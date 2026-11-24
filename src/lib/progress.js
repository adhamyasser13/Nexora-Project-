import { isVideoComplete } from './video.js'

export function emptyProgress() {
  return { tracks: {} }
}

export function sortedStages(track) {
  return [...track.stages].sort((a, b) => a.order - b.order)
}

export function getTrackProgress(progress, trackId) {
  return progress.tracks[trackId] ?? {
    currentStageId: null,
    completedStageIds: [],
    stages: {},
  }
}

export function getStageProgress(progress, trackId, stageId) {
  return getTrackProgress(progress, trackId).stages[stageId] ?? {
    completedVideoIds: [],
    quiz: { bestScore: 0, passed: false, attempts: 0 },
  }
}

export function isStageComplete(track, progress, stageId) {
  const stage = track.stages.find((item) => item.id === stageId)
  if (!stage) return false
  const stageProgress = getStageProgress(progress, track.id, stageId)
  const videosDone = stage.videos.every((video) => isVideoComplete(stageProgress, video))
  return videosDone && Boolean(stageProgress.quiz.passed)
}

export function isStageUnlocked(track, progress, stageId) {
  const stages = sortedStages(track)
  const index = stages.findIndex((stage) => stage.id === stageId)
  if (index <= 0) return true
  return isStageComplete(track, progress, stages[index - 1].id)
}

export function areVideosComplete(track, progress, stageId) {
  const stage = track.stages.find((item) => item.id === stageId)
  if (!stage) return false
  const stageProgress = getStageProgress(progress, track.id, stageId)
  return stage.videos.every((video) => isVideoComplete(stageProgress, video))
}

export function trackPercent(track, progress) {
  if (!track.stages.length) return 0
  const done = track.stages.filter((stage) =>
    isStageComplete(track, progress, stage.id),
  ).length
  return Math.round((done / track.stages.length) * 100)
}

export function nextOpenStage(track, progress) {
  const stages = sortedStages(track)
  return (
    stages.find((stage) => !isStageComplete(track, progress, stage.id) && isStageUnlocked(track, progress, stage.id)) ??
    stages[stages.length - 1]
  )
}

export function stageStatus(track, progress, stageId) {
  if (isStageComplete(track, progress, stageId)) return 'completed'
  if (isStageUnlocked(track, progress, stageId)) return 'in-progress'
  return 'locked'
}
