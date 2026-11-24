import { useEffect, useState } from 'react'
import { getTracks } from '../../api/api.js'
import { Button } from '../../components/Button/Button.jsx'
import { Card } from '../../components/Card/Card.jsx'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar.jsx'
import { StateMessage } from '../../components/StateMessage/StateMessage.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { nextOpenStage, trackPercent } from '../../lib/progress.js'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { state, meta } = useProgress()
  const [tracks, setTracks] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getTracks()
      .then((data) => {
        if (!cancelled) setTracks(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load dashboard data.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return <StateMessage title="Dashboard unavailable" body={error} />
  }

  if (!tracks || !meta.ready) {
    return <StateMessage title="Loading dashboard…" />
  }

  if (!tracks.length) {
    return (
      <StateMessage
        title="No tracks in the catalog"
        body="Add JSON files under src/data/tracks to populate progress."
      />
    )
  }

  const startedCount = tracks.filter((track) => state.progress.tracks[track.id]).length

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.lead}>
          Progress across every track in this browser. {startedCount} of {tracks.length} started.
        </p>
      </header>

      <div className={styles.grid}>
        {tracks.map((track) => {
          const started = Boolean(state.progress.tracks[track.id])
          const percent = trackPercent(track, state.progress)
          const trackState = state.getTrackProgress(track.id)
          const current = nextOpenStage(track, state.progress)
          const completedCount = trackState.completedStageIds.length
          const quizRows = track.stages
            .map((stage) => {
              const quiz = state.getStageProgress(track.id, stage.id).quiz
              if (!quiz.attempts) return null
              return (
                <li key={stage.id}>
                  {stage.title}: {quiz.bestScore}%
                  {quiz.passed ? ' · passed' : ''}
                </li>
              )
            })
            .filter(Boolean)

          return (
            <Card key={track.id} className={styles.card}>
              <h2 className={styles.cardTitle}>{track.title}</h2>
              <ProgressBar
                value={percent}
                label={`${completedCount}/${track.stages.length} stages`}
              />
              {started ? (
                <p className={styles.current}>
                  Current: <strong>{current.title}</strong>
                </p>
              ) : (
                <p className={styles.current}>Not started yet</p>
              )}
              {quizRows.length ? <ul className={styles.quizzes}>{quizRows}</ul> : null}
              <Button
                to={
                  started
                    ? `/tracks/${track.id}/stages/${current.id}`
                    : `/tracks/${track.id}`
                }
                variant={started ? 'primary' : 'secondary'}
              >
                {started ? 'Continue learning' : 'Open roadmap'}
              </Button>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
