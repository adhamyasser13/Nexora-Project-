import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getTrack } from '../../api/api.js'
import { Button } from '../../components/Button/Button.jsx'
import { StateMessage } from '../../components/StateMessage/StateMessage.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { areVideosComplete, isStageUnlocked, sortedStages } from '../../lib/progress.js'
import styles from './QuizPage.module.css'

export function QuizPage() {
  const { trackId, stageId } = useParams()
  const { state, actions, meta } = useProgress()
  const [track, setTrack] = useState(undefined)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false
    setTrack(undefined)
    setAnswers({})
    setResult(null)
    getTrack(trackId)
      .then((data) => {
        if (!cancelled) setTrack(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this quiz.')
      })
    return () => {
      cancelled = true
    }
  }, [trackId, stageId])

  const stage = useMemo(
    () => track?.stages.find((item) => item.id === stageId) ?? null,
    [track, stageId],
  )

  if (error) {
    return <StateMessage title="Quiz unavailable" body={error} />
  }

  if (track === undefined || !meta.ready) {
    return <StateMessage title="Loading quiz…" />
  }

  if (!track || !stage) {
    return (
      <StateMessage
        title="Quiz not found"
        action={<Button to="/tracks">Back to tracks</Button>}
      />
    )
  }

  if (!isStageUnlocked(track, state.progress, stage.id)) {
    return <Navigate to={`/tracks/${track.id}`} replace />
  }

  if (!areVideosComplete(track, state.progress, stage.id)) {
    return (
      <StateMessage
        title="Finish the videos first"
        body="The quiz unlocks after every video in this stage is marked complete."
        action={
          <Button to={`/tracks/${track.id}/stages/${stage.id}`}>Back to stage</Button>
        }
      />
    )
  }

  const questions = stage.quiz.questions
  const allAnswered = questions.every((_, index) => answers[index] !== undefined)
  const stageProgress = state.getStageProgress(track.id, stage.id)
  const stages = sortedStages(track)
  const stageIndex = stages.findIndex((item) => item.id === stage.id)
  const nextStage = stages[stageIndex + 1]

  function submit() {
    if (!allAnswered) return
    let correct = 0
    questions.forEach((question, index) => {
      if (answers[index] === question.answerIndex) correct += 1
    })
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= stage.quiz.passingScore
    actions.submitQuiz({ track, stageId: stage.id, score, passed })
    setResult({ score, passed, correct })
  }

  function retake() {
    setAnswers({})
    setResult(null)
  }

  return (
    <section className={styles.page}>
      <nav className={styles.crumb}>
        <Link to={`/tracks/${track.id}`}>{track.title}</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/tracks/${track.id}/stages/${stage.id}`}>{stage.title}</Link>
        <span aria-hidden="true">/</span>
        <span>Quiz</span>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>{stage.title} quiz</h1>
        <p className={styles.lead}>
          Pass with {stage.quiz.passingScore}% or higher to unlock the next stage. Unlimited
          retakes.
        </p>
        {stageProgress.quiz.attempts > 0 ? (
          <p className={styles.best}>
            Best score so far: {stageProgress.quiz.bestScore}% · Attempts:{' '}
            {stageProgress.quiz.attempts}
          </p>
        ) : null}
      </header>

      {result ? (
        <div className={`${styles.result} ${result.passed ? styles.pass : styles.fail}`}>
          <h2 className={styles.resultTitle}>
            {result.passed ? 'Stage passed' : 'Keep going'}
          </h2>
          <p className={styles.resultBody}>
            You scored {result.score}% ({result.correct}/{questions.length} correct).
            {result.passed
              ? nextStage
                ? ` ${nextStage.title} is now unlocked.`
                : ' You finished every stage in this track.'
              : ` You need ${stage.quiz.passingScore}% to pass.`}
          </p>
          <div className={styles.actions}>
            {result.passed ? (
              nextStage ? (
                <Button to={`/tracks/${track.id}/stages/${nextStage.id}`}>
                  Continue to next stage
                </Button>
              ) : (
                <Button to="/dashboard">Open dashboard</Button>
              )
            ) : null}
            <Button onClick={retake} variant={result.passed ? 'ghost' : 'primary'}>
              Retake quiz
            </Button>
            <Button to={`/tracks/${track.id}`} variant="secondary">
              Back to roadmap
            </Button>
          </div>

          <div className={styles.review}>
            <h3 className={styles.reviewTitle}>Review</h3>
            {questions.map((question, index) => {
              const chosen = answers[index]
              const correct = chosen === question.answerIndex
              return (
                <div key={question.text} className={styles.reviewItem}>
                  <p className={styles.qText}>
                    {index + 1}. {question.text}
                  </p>
                  <p className={correct ? styles.ok : styles.bad}>
                    Your answer: {question.options[chosen]}
                  </p>
                  {!correct ? (
                    <p className={styles.ok}>Correct: {question.options[question.answerIndex]}</p>
                  ) : null}
                  <p className={styles.explain}>{question.explanation}</p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          {questions.map((question, index) => (
            <fieldset key={question.text} className={styles.fieldset}>
              <legend className={styles.legend}>
                {index + 1}. {question.text}
              </legend>
              <div className={styles.options}>
                {question.options.map((option, optionIndex) => {
                  const id = `q${index}-o${optionIndex}`
                  return (
                    <label key={id} className={styles.option} htmlFor={id}>
                      <input
                        id={id}
                        type="radio"
                        name={`q-${index}`}
                        checked={answers[index] === optionIndex}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [index]: optionIndex }))
                        }
                      />
                      <span>{option}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}
          <Button type="submit" disabled={!allAnswered}>
            Submit quiz
          </Button>
        </form>
      )}
    </section>
  )
}
