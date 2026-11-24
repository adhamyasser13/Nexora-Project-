import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getTrack } from '../../api/api.js'
import { Button } from '../../components/Button/Button.jsx'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar.jsx'
import { StateMessage } from '../../components/StateMessage/StateMessage.jsx'
import { YoutubePlayer } from '../../components/YoutubePlayer/YoutubePlayer.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { areVideosComplete, isStageUnlocked } from '../../lib/progress.js'
import { isVideoComplete } from '../../lib/video.js'
import styles from './StagePage.module.css'

export function StagePage() {
  const { trackId, stageId } = useParams()
  const { state, actions, meta } = useProgress()
  const [track, setTrack] = useState(undefined)
  const [error, setError] = useState(null)
  const [activeVideo, setActiveVideo] = useState(0)

  useEffect(() => {
    let cancelled = false
    setTrack(undefined)
    setActiveVideo(0)
    getTrack(trackId)
      .then((data) => {
        if (!cancelled) setTrack(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this stage.')
      })
    return () => {
      cancelled = true
    }
  }, [trackId])

  useEffect(() => {
    if (!track) return
    if (state.progress.tracks[track.id]) return
    const current = track.stages.find((item) => item.id === stageId)
    if (!current) return
    if (!isStageUnlocked(track, state.progress, current.id)) return
    actions.startTrack(track)
  }, [actions, stageId, state.progress, track])

  if (error) {
    return <StateMessage title="Stage unavailable" body={error} />
  }

  if (track === undefined || !meta.ready) {
    return <StateMessage title="Loading stage…" />
  }

  if (!track) {
    return (
      <StateMessage
        title="Track not found"
        action={<Button to="/tracks">Back to tracks</Button>}
      />
    )
  }

  const stage = track.stages.find((item) => item.id === stageId)
  if (!stage) {
    return (
      <StateMessage
        title="Stage not found"
        action={<Button to={`/tracks/${track.id}`}>Back to roadmap</Button>}
      />
    )
  }

  if (!isStageUnlocked(track, state.progress, stage.id)) {
    return <Navigate to={`/tracks/${track.id}`} replace />
  }

  const stageProgress = state.getStageProgress(track.id, stage.id)
  const doneCount = stage.videos.filter((item) => isVideoComplete(stageProgress, item)).length
  const videosDone = areVideosComplete(track, state.progress, stage.id)
  const video = stage.videos[activeVideo] ?? stage.videos[0]
  const videoPercent = Math.round((doneCount / Math.max(stage.videos.length, 1)) * 100)

  function markComplete(videoId = video.id) {
    actions.completeVideo({
      track,
      stageId: stage.id,
      videoId,
    })
    const nextIncomplete = stage.videos.findIndex(
      (item) => item.id !== videoId && !isVideoComplete(stageProgress, item),
    )
    if (nextIncomplete >= 0) setActiveVideo(nextIncomplete)
  }

  return (
    <section className={styles.page}>
      <nav className={styles.crumb}>
        <Link to={`/tracks/${track.id}`}>{track.title}</Link>
        <span aria-hidden="true">/</span>
        <span>{stage.title}</span>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>{stage.title}</h1>
        <p className={styles.goal}>{stage.goal}</p>
        <ProgressBar value={videoPercent} label={`${doneCount}/${stage.videos.length} videos done`} />
      </header>

      <div className={styles.layout}>
        <div className={styles.playerCol}>
          <YoutubePlayer
            key={video.id}
            youtubeId={video.youtubeId}
            title={video.title}
            onEnded={() => markComplete(video.id)}
          />
          <div className={styles.videoMeta}>
            <h2 className={styles.videoTitle}>{video.title}</h2>
            <p className={styles.channel}>
              {video.channel} · {video.durationMin} min ·{' '}
              <span className={styles.lang}>{video.language.toUpperCase()}</span>
            </p>
            {isVideoComplete(stageProgress, video) ? (
              <p className={styles.done}>Marked complete</p>
            ) : (
              <Button variant="secondary" onClick={() => markComplete(video.id)}>
                Mark complete
              </Button>
            )}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <h3 className={styles.sideTitle}>Videos</h3>
          <ol className={styles.videoList}>
            {stage.videos.map((item, index) => {
              const complete = isVideoComplete(stageProgress, item)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`${styles.videoBtn} ${index === activeVideo ? styles.active : ''}`.trim()}
                    onClick={() => setActiveVideo(index)}
                  >
                    <span>{item.title}</span>
                    <span className={styles.flag}>{complete ? 'Done' : item.language}</span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className={styles.project}>
            <h3 className={styles.sideTitle}>Stage project</h3>
            <p className={styles.projectTitle}>{stage.project.title}</p>
            <p className={styles.projectBody}>{stage.project.description}</p>
          </div>

          <Button
            to={`/tracks/${track.id}/stages/${stage.id}/quiz`}
            disabled={!videosDone}
          >
            {videosDone ? 'Take stage quiz' : 'Finish videos to unlock quiz'}
          </Button>
        </aside>
      </div>
    </section>
  )
}
