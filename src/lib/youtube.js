let apiPromise

export function loadYoutubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve(window.YT)
      }

      const existing = document.querySelector('script[data-careerx-yt]')
      if (!existing) {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        script.async = true
        script.dataset.careerxYt = 'true'
        document.head.appendChild(script)
      }
    })
  }

  return apiPromise
}
