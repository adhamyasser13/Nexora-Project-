import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTracks } from '../../api/api.js'
import { Button } from '../../components/Button/Button.jsx'
import { Card } from '../../components/Card/Card.jsx'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar.jsx'
import { StateMessage } from '../../components/StateMessage/StateMessage.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { trackPercent } from '../../lib/progress.js'
import styles from './TracksPage.module.css'

export function TracksPage() {
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
        if (!cancelled) setError('Could not load tracks.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <StateMessage
        title="Tracks unavailable"
        body={error}
        action={<Button onClick={() => window.location.reload()}>Refresh</Button>}
      />
    )
  }

  if (!tracks || !meta.ready) {
    return <StateMessage title="Loading tracks…" body="Pulling curated paths from the catalog." />
  }

  if (!tracks.length) {
    return (
      <StateMessage
        title="No tracks yet"
        body="Add JSON files under src/data/tracks to populate the catalog."
      />
    )
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tracks</h1>
        <p className={styles.lead}>
          Eight paths. Same structure: stages in order, videos, then a quiz to unlock the next
          stage.
        </p>
      </header>
      <div className={styles.grid}>
        {tracks.map((track) => {
          const percent = trackPercent(track, state.progress)
          const started = Boolean(state.progress.tracks[track.id])

          return (
            <Card key={track.id} className={styles.card}>
              <div className={styles.meta}>
                <span className={styles.level}>{track.level}</span>
                <span>{track.stages.length} stages</span>
              </div>
              <h2 className={styles.cardTitle}>
                <Link to={`/tracks/${track.id}`}>{track.title}</Link>
              </h2>
              <p className={styles.desc}>{track.description}</p>
              {started ? <ProgressBar value={percent} label="Your progress" /> : null}
              <Button to={`/tracks/${track.id}`} variant={started ? 'secondary' : 'primary'}>
                {started ? 'Continue' : 'Open roadmap'}
              </Button>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
