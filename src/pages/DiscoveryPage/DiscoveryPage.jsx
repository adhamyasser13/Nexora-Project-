import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDiscoveryQuestions, saveDiscoveryResult } from '../../api/api.js'
import { Button } from '../../components/Button/Button.jsx'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar.jsx'
import { StateMessage } from '../../components/StateMessage/StateMessage.jsx'
import styles from './DiscoveryPage.module.css'

function scoreAnswers(questions, answers) {
  const totals = {}

  questions.forEach((question) => {
    const optionId = answers[question.id]
    const option = question.options.find((item) => item.id === optionId)
    if (!option) return
    Object.entries(option.scores).forEach(([trackId, points]) => {
      totals[trackId] = (totals[trackId] ?? 0) + points
    })
  })

  const sum = Object.values(totals).reduce((acc, value) => acc + value, 0) || 1
  return Object.entries(totals)
    .map(([trackId, points]) => ({
      trackId,
      points,
      percent: Math.round((points / sum) * 100),
    }))
    .sort((a, b) => b.points - a.points)
}

export function DiscoveryPage() {
  const navigate = useNavigate()
  const [pack, setPack] = useState(null)
  const [error, setError] = useState(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    let cancelled = false
    getDiscoveryQuestions()
      .then((data) => {
        if (!cancelled) setPack(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load discovery questions.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return <StateMessage title="Discovery unavailable" body={error} />
  }

  if (!pack) {
    return <StateMessage title="Loading discovery…" body="Preparing nine questions." />
  }

  const question = pack.questions[index]
  const selected = answers[question.id]
  const progress = Math.round((index / pack.questions.length) * 100)

  function choose(optionId) {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
  }

  function next() {
    if (!selected) return
    if (index < pack.questions.length - 1) {
      setIndex((value) => value + 1)
      return
    }

    const ranked = scoreAnswers(pack.questions, { ...answers, [question.id]: selected })
    const top = ranked.slice(0, 3)
    const topSum = top.reduce((sum, item) => sum + item.points, 0) || 1
    const rankedTop = top.map((item) => ({
      ...item,
      percent: Math.round((item.points / topSum) * 100),
    }))
    saveDiscoveryResult({ ranked: rankedTop, answeredAt: Date.now() }).then(() => {
      navigate('/discover/result')
    })
  }

  function back() {
    if (index === 0) return
    setIndex((value) => value - 1)
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{pack.title}</h1>
        <p className={styles.lead}>{pack.description}</p>
        <ProgressBar value={progress} label={`Question ${index + 1} of ${pack.questions.length}`} />
      </header>

      <div className={styles.panel}>
        <h2 className={styles.question}>{question.text}</h2>
        <div className={styles.options} role="radiogroup" aria-label={question.text}>
          {question.options.map((option) => {
            const active = selected === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`${styles.option} ${active ? styles.selected : ''}`.trim()}
                onClick={() => choose(option.id)}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={back} disabled={index === 0}>
            Back
          </Button>
          <Button onClick={next} disabled={!selected}>
            {index === pack.questions.length - 1 ? 'See matches' : 'Next'}
          </Button>
        </div>
      </div>
    </section>
  )
}
