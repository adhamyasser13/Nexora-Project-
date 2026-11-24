import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTracks } from '../../api/api.js'
import { Button } from '../../components/Button/Button.jsx'
import styles from './LandingPage.module.css'

const doubts = [
  'Where do I start?',
  'What comes first, and what comes after?',
  'Which videos are actually worth my time?',
  'When am I ready for the next stage?',
]

const steps = [
  {
    title: 'Pick a track',
    body: 'Browse eight paths or answer nine questions. You choose — nothing is auto-assigned.',
  },
  {
    title: 'Follow the order',
    body: 'Each stage stays locked until you finish the videos and pass the quiz.',
  },
  {
    title: 'Watch, then prove it',
    body: 'Videos mark complete when they end. Pass the quiz at 70% to unlock what is next.',
  },
]

export function LandingPage() {
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    let cancelled = false
    getTracks().then((data) => {
      if (!cancelled) setTracks(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.brand}>
          Career<span className={styles.x}>X</span>
        </p>
        <h1 className={styles.title}>Know where to start. Know what&apos;s next.</h1>
        <p className={styles.lead}>
          One curated track at a time — ordered stages, chosen videos, and quizzes that unlock
          the next step. Built for CS and engineering students who are tired of endless tabs.
        </p>
        <div className={styles.actions}>
          <Button to="/discover">Find your track</Button>
          <Button to="/tracks" variant="secondary">
            Browse tracks
          </Button>
        </div>
      </section>

      <section className={styles.problem} aria-labelledby="problem-heading">
        <h2 id="problem-heading" className={styles.sectionTitle}>
          The usual mess
        </h2>
        <ul className={styles.doubts}>
          {doubts.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className={styles.promise}>
          CareerX answers those with a single path the team already sorted — not another search
          results page.
        </p>
      </section>

      <section className={styles.how} aria-labelledby="how-heading">
        <h2 id="how-heading" className={styles.sectionTitle}>
          How a track works
        </h2>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepIndex}>{index + 1}</span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {tracks.length ? (
        <section className={styles.catalog} aria-labelledby="catalog-heading">
          <div className={styles.catalogHead}>
            <h2 id="catalog-heading" className={styles.sectionTitle}>
              Eight tracks, one structure
            </h2>
            <Button to="/tracks" variant="ghost">
              See all roadmaps
            </Button>
          </div>
          <ul className={styles.trackList}>
            {tracks.map((track) => (
              <li key={track.id}>
                <Link className={styles.trackRow} to={`/tracks/${track.id}`}>
                  <span className={styles.trackTitle}>{track.title}</span>
                  <span className={styles.trackMeta}>
                    {track.level} · {track.stages.length} stages
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
