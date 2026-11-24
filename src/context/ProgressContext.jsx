import { createContext, use, useEffect, useMemo, useReducer } from 'react'
import { getProgress, getTrack, saveProgress } from '../api/api.js'
import { emptyProgress, getStageProgress, getTrackProgress, sortedStages } from '../lib/progress.js'

const ProgressContext = createContext(null)

function ensureTrack(progress, trackId, firstStageId) {
  const existing = progress.tracks[trackId]
  if (existing) return existing
  return {
    currentStageId: firstStageId,
    completedStageIds: [],
    stages: {},
  }
}

function ensureStage(trackState, stageId) {
  return (
    trackState.stages[stageId] ?? {
      completedVideoIds: [],
      quiz: { bestScore: 0, passed: false, attempts: 0 },
    }
  )
}

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...state, progress: action.progress, ready: true, error: null }
    case 'fail':
      return { ...state, ready: true, error: action.error }
    case 'start-track': {
      const { track } = action
      if (state.progress.tracks[track.id]) return state
      const firstStageId = sortedStages(track)[0]?.id ?? null
      const next = {
        ...state.progress,
        tracks: {
          ...state.progress.tracks,
          [track.id]: ensureTrack(state.progress, track.id, firstStageId),
        },
      }
      return { ...state, progress: next }
    }
    case 'complete-video': {
      const { track, videoId, stageId } = action
      const trackState = ensureTrack(state.progress, track.id, sortedStages(track)[0]?.id)
      const stageState = ensureStage(trackState, stageId)
      if (stageState.completedVideoIds.includes(videoId)) return state

      const next = {
        ...state.progress,
        tracks: {
          ...state.progress.tracks,
          [track.id]: {
            ...trackState,
            currentStageId: trackState.currentStageId ?? stageId,
            stages: {
              ...trackState.stages,
              [stageId]: {
                ...stageState,
                completedVideoIds: [...stageState.completedVideoIds, videoId],
              },
            },
          },
        },
      }
      return { ...state, progress: next }
    }
    case 'submit-quiz': {
      const { track, stageId, score, passed } = action
      const stages = sortedStages(track)
      const trackState = ensureTrack(state.progress, track.id, stages[0]?.id)
      const stageState = ensureStage(trackState, stageId)
      const completedStageIds = new Set(trackState.completedStageIds)
      if (passed) completedStageIds.add(stageId)

      const currentIndex = stages.findIndex((stage) => stage.id === stageId)
      const nextStage = passed ? stages[currentIndex + 1] : stages[currentIndex]

      const next = {
        ...state.progress,
        tracks: {
          ...state.progress.tracks,
          [track.id]: {
            ...trackState,
            currentStageId: nextStage?.id ?? stageId,
            completedStageIds: [...completedStageIds],
            stages: {
              ...trackState.stages,
              [stageId]: {
                ...stageState,
                quiz: {
                  bestScore: Math.max(stageState.quiz.bestScore, score),
                  passed: stageState.quiz.passed || passed,
                  attempts: stageState.quiz.attempts + 1,
                },
              },
            },
          },
        },
      }
      return { ...state, progress: next }
    }
    default:
      return state
  }
}

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    progress: emptyProgress(),
    ready: false,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    getProgress()
      .then((progress) => {
        if (!cancelled) dispatch({ type: 'hydrate', progress })
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'fail', error: 'Could not load saved progress.' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!state.ready) return
    saveProgress(state.progress)
  }, [state.progress, state.ready])

  const actions = useMemo(
    () => ({
      startTrack(track) {
        dispatch({ type: 'start-track', track })
      },
      completeVideo({ track, stageId, videoId }) {
        dispatch({ type: 'complete-video', track, stageId, videoId })
      },
      submitQuiz({ track, stageId, score, passed }) {
        dispatch({ type: 'submit-quiz', track, stageId, score, passed })
      },
      async loadTrack(trackId) {
        return getTrack(trackId)
      },
    }),
    [],
  )

  const value = useMemo(
    () => ({
      state: {
        progress: state.progress,
        getTrackProgress: (trackId) => getTrackProgress(state.progress, trackId),
        getStageProgress: (trackId, stageId) => getStageProgress(state.progress, trackId, stageId),
      },
      actions,
      meta: { ready: state.ready, error: state.error },
    }),
    [actions, state],
  )

  return <ProgressContext value={value}>{children}</ProgressContext>
}

export function useProgress() {
  const value = use(ProgressContext)
  if (!value) {
    throw new Error('useProgress must be used inside ProgressProvider')
  }
  return value
}
