import { useEffect, useId, useRef, useState } from 'react'
import { loadYoutubeApi } from '../../lib/youtube.js'
import styles from './YoutubePlayer.module.css'

export function YoutubePlayer({ youtubeId, title, onEnded }) {
  const hostId = useId().replace(/:/g, '')
  const playerRef = useRef(null)
  const onEndedRef = useRef(onEnded)
  const [error, setError] = useState(null)

  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

  useEffect(() => {
    let cancelled = false
    let player

    setError(null)

    if (!youtubeId) {
      setError('Draft video: paste a YouTube link into youtubeUrl in the track JSON file.')
      return () => {
        cancelled = true
      }
    }

    loadYoutubeApi()
      .then((YT) => {
        if (cancelled) return
        player = new YT.Player(`yt-${hostId}`, {
          videoId: youtubeId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onStateChange(event) {
              if (event.data === YT.PlayerState.ENDED) {
                onEndedRef.current?.()
              }
            },
            onError() {
              setError('This video could not be embedded. Try another browser or check the video id.')
            },
          },
        })
        playerRef.current = player
      })
      .catch(() => {
        if (!cancelled) {
          setError('YouTube player failed to load. Check your connection and refresh.')
        }
      })

    return () => {
      cancelled = true
      try {
        player?.destroy?.()
      } catch {
        // player may already be gone
      }
      playerRef.current = null
    }
  }, [hostId, youtubeId])

  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        <div id={`yt-${hostId}`} className={styles.player} title={title} />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  )
}
