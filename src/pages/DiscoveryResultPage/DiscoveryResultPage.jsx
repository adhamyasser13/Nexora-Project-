import { useEffect, useState } from 'react'
import { getDiscoveryResult, getTracks } from '../../api/api.js'
import { Button } from '../../components/Button/Button.jsx'
import { Card } from '../../components/Card/Card.jsx'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar.jsx'
import { StateMessage } from '../../components/StateMessage/StateMessage.jsx'
import styles from './DiscoveryResultPage.module.css'

export function DiscoveryResultPage() {
  const [result, setResult] = useState(undefined)
  const [tracks, setTracks] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getDiscoveryResult(), getTracks()]).then(([discovery, trackList]) => {
      if (cancelled) return
      setResult(discovery)
      setTracks(trackList)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (result === undefined || !tracks) {
    return <StateMessage title="Loading results…" />
  }

  if (!result?.ranked?.length) {
    return (
      <StateMessage
        title="No discovery result yet"
        body="Answer the questions first, then come back to pick a track."
        action={<Button to="/discover">Take discovery</Button>}
      />
    )
  }

  const matches = result.ranked
    .map((item) => {
      const track = tracks.find((entry) => entry.id === item.trackId)
      return track ? { ...item, track } : null
    })
    .filter(Boolean)

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your top matches</h1>
        <p className={styles.lead}>
          These are suggestions ranked by your answers. You choose — nothing is locked in for you.
        </p>
      </header>

      <div className={styles.list}>
        {matches.map((match, index) => (
          <Card key={match.trackId} className={styles.card}>
            <p className={styles.rank}>Match {index + 1}</p>
            <h2 className={styles.cardTitle}>{match.track.title}</h2>
            <p className={styles.desc}>{match.track.description}</p>
            <ProgressBar value={match.percent} label="Fit score" />
            <Button to={`/tracks/${match.track.id}`}>Open this roadmap</Button>
          </Card>
        ))}
      </div>

      <div className={styles.footer}>
        <Button to="/discover" variant="secondary">
          Retake discovery
        </Button>
        <Button to="/tracks" variant="ghost">
          Browse all tracks
        </Button>
      </div>
    </section>
  )
}
