import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTrack } from '../../api/api.js'
import { Button } from '../../components/Button/Button.jsx'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar.jsx'
import { StateMessage } from '../../components/StateMessage/StateMessage.jsx'
import { StatusBadge } from '../../components/StatusBadge/StatusBadge.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { nextOpenStage, sortedStages, stageStatus, trackPercent } from '../../lib/progress.js'
import styles from './RoadmapPage.module.css'

export function RoadmapPage() {
  const { trackId } = useParams()
  const { state, meta } = useProgress()
  const [track, setTrack] = useState(undefined)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setTrack(undefined)
    getTrack(trackId)
      .then((data) => {
        if (!cancelled) setTrack(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this track.')
      })
    return () => {
      cancelled = true
    }
  }, [trackId])

  if (error) {
    return <StateMessage title="Roadmap unavailable" body={error} />
  }

  if (track === undefined || !meta.ready) {
    return <StateMessage title="Loading roadmap…" />
  }

  if (!track) {
    return (
      <StateMessage
        title="Track not found"
        body="That track id is not in the catalog."
        action={<Button to="/tracks">Back to tracks</Button>}
      />
    )
  }

  const stages = sortedStages(track)
  const percent = trackPercent(track, state.progress)
  const continueStage = nextOpenStage(track, state.progress)

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>{track.level} · {stages.length} stages</p>
        <h1 className={styles.title}>{track.title}</h1>
        <p className={styles.lead}>{track.description}</p>
        <ProgressBar value={percent} label="Track progress" />
        <Button to={`/tracks/${track.id}/stages/${continueStage.id}`}>
          Continue: {continueStage.title}
        </Button>
      </header>

      <ol className={styles.list}>
        {stages.map((stage) => {
          const status = stageStatus(track, state.progress, stage.id)
          const locked = status === 'locked'
          const content = (
            <>
              <div className={styles.rowTop}>
                <span className={styles.order}>{String(stage.order).padStart(2, '0')}</span>
                <StatusBadge status={status} />
              </div>
              <h2 className={styles.stageTitle}>{stage.title}</h2>
              <p className={styles.goal}>{stage.goal}</p>
              <p className={styles.hours}>~{stage.estimatedHours} hours</p>
            </>
          )

          return (
            <li key={stage.id} className={`${styles.item} ${styles[status] ?? ''}`.trim()}>
              {locked ? (
                <div className={styles.lockedBlock} aria-disabled="true">
                  {content}
                  <p className={styles.lockHint}>Finish the previous stage quiz to unlock.</p>
                </div>
              ) : (
                <Link
                  className={styles.link}
                  to={`/tracks/${track.id}/stages/${stage.id}`}
                >
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
