/**
 * Draft video links live on each lesson as `youtubeUrl`.
 * Change that URL in src/data/tracks/*.json — youtubeId is derived from it.
 */

export function parseYoutubeId(value) {
  if (!value) return ''
  const trimmed = String(value).trim()
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (url.hostname === 'youtu.be' || url.hostname.endsWith('.youtu.be')) {
      return url.pathname.replace(/^\//, '').split('/')[0] ?? ''
    }
    const fromQuery = url.searchParams.get('v')
    if (fromQuery) return fromQuery
    const embed = url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/)
    return embed?.[1] ?? ''
  } catch {
    return ''
  }
}

export function resolveVideo(video, stageId, index) {
  const youtubeId = parseYoutubeId(video.youtubeUrl) || parseYoutubeId(video.youtubeId)
  return {
    ...video,
    id: video.id || `${stageId}-v${index + 1}`,
    youtubeId,
    youtubeUrl: video.youtubeUrl || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ''),
  }
}

export function resolveTrack(track) {
  return {
    ...track,
    stages: track.stages.map((stage) => ({
      ...stage,
      videos: stage.videos.map((video, index) => resolveVideo(video, stage.id, index)),
    })),
  }
}

export function isVideoComplete(stageProgress, video) {
  const ids = stageProgress?.completedVideoIds ?? []
  return ids.includes(video.id) || ids.includes(video.youtubeId)
}
