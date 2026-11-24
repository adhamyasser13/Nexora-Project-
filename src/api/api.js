import { emptyProgress } from '../lib/progress.js'
import { resolveTrack } from '../lib/video.js'

const STORAGE_KEY = 'careerx:progress:v1'
const DISCOVERY_KEY = 'careerx:discovery:v1'

const TRACK_ORDER = [
  'frontend',
  'software-engineering',
  'backend',
  'data-analysis',
  'ui-ux',
  'mobile-flutter',
  'cybersecurity',
  'networking',
]

const trackModules = import.meta.glob('../data/tracks/*.json', {
  eager: true,
  import: 'default',
})

let tracksCache
let discoveryCache
let progressCache

function delay(value) {
  return Promise.resolve(value)
}

function loadTracks() {
  if (!tracksCache) {
    tracksCache = Object.values(trackModules).map(resolveTrack).sort((a, b) => {
      const left = TRACK_ORDER.indexOf(a.id)
      const right = TRACK_ORDER.indexOf(b.id)
      const aIndex = left === -1 ? TRACK_ORDER.length : left
      const bIndex = right === -1 ? TRACK_ORDER.length : right
      if (aIndex !== bIndex) return aIndex - bIndex
      return a.title.localeCompare(b.title)
    })
  }
  return tracksCache
}

export function getTracks() {
  return delay(loadTracks())
}

export function getTrack(id) {
  const track = loadTracks().find((item) => item.id === id) ?? null
  return delay(track)
}

export async function getDiscoveryQuestions() {
  if (!discoveryCache) {
    discoveryCache = (await import('../data/discovery.json')).default
  }
  return discoveryCache
}

export function getProgress() {
  if (progressCache) return delay(progressCache)

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    progressCache = raw ? JSON.parse(raw) : emptyProgress()
  } catch {
    progressCache = emptyProgress()
  }

  if (!progressCache?.tracks) {
    progressCache = emptyProgress()
  }

  return delay(progressCache)
}

export function saveProgress(progress) {
  progressCache = progress
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Private mode or quota — keep the in-memory copy.
  }
  return delay(progress)
}

export function saveDiscoveryResult(result) {
  try {
    sessionStorage.setItem(DISCOVERY_KEY, JSON.stringify(result))
  } catch {
    // ignore
  }
  return delay(result)
}

export function getDiscoveryResult() {
  try {
    const raw = sessionStorage.getItem(DISCOVERY_KEY)
    return delay(raw ? JSON.parse(raw) : null)
  } catch {
    return delay(null)
  }
}
