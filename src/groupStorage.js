import {
  applyJoinedGroupMembers,
  FIXED_INVITE_CODE,
  getDefaultJoinableGroup,
  normalizeInviteCode,
  withFixedInviteCode,
} from './groupUtils'

const STORAGE_KEY = 'blasol-group'
const REGISTRY_KEY = 'blasol-group-registry'

function getDefaultState() {
  return {
    group: null,
    hasCreatedGroup: false,
    groupBannerExpanded: true,
    meetupPoint: null,
  }
}

function readStorageBlob() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function isValidMeetupPoint(point) {
  if (!point || typeof point !== 'object') return false

  return (
    typeof point.left === 'number' &&
    typeof point.top === 'number' &&
    typeof point.time === 'string' &&
    point.time.length > 0
  )
}

export function loadMeetupPoint() {
  const point = readStorageBlob().meetupPoint
  return isValidMeetupPoint(point) ? point : null
}

export function saveMeetupPoint(meetupPoint) {
  try {
    const current = readStorageBlob()

    if (meetupPoint && isValidMeetupPoint(meetupPoint)) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...current, meetupPoint }),
      )
      return
    }

    delete current.meetupPoint
    if (Object.keys(current).length === 0) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    // Ignore storage errors
  }
}

function isValidGroup(group) {
  if (!group || typeof group !== 'object') return false

  return (
    typeof group.name === 'string' &&
    group.name.trim().length > 0 &&
    typeof group.invitationCode === 'string' &&
    group.invitationCode.length > 0 &&
    Array.isArray(group.members) &&
    group.members.length > 0 &&
    group.members.every(
      member =>
        member &&
        typeof member.id === 'number' &&
        typeof member.name === 'string' &&
        typeof member.isAdmin === 'boolean',
    )
  )
}

export function loadGroupState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()

    const data = JSON.parse(raw)
    if (!data.hasCreatedGroup || !isValidGroup(data.group)) {
      return getDefaultState()
    }

    const group = withFixedInviteCode(data.group)
    registerGroup(group)

    return {
      group,
      hasCreatedGroup: true,
      groupBannerExpanded:
        typeof data.groupBannerExpanded === 'boolean' ? data.groupBannerExpanded : true,
      meetupPoint: isValidMeetupPoint(data.meetupPoint) ? data.meetupPoint : null,
    }
  } catch {
    return getDefaultState()
  }
}

function loadRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) return []

    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []

    return list.filter(isValidGroup)
  } catch {
    return []
  }
}

function saveRegistry(groups) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(groups))
  } catch {
    // Ignore storage errors
  }
}

export function registerGroup(group) {
  if (!isValidGroup(group)) return

  const code = normalizeInviteCode(group.invitationCode)
  const registry = loadRegistry().filter(
    g => normalizeInviteCode(g.invitationCode) !== code,
  )
  registry.push(group)
  saveRegistry(registry)
}

export function findGroupByInviteCode(code) {
  const normalized = normalizeInviteCode(code)
  if (!normalized) return null

  const fromRegistry = loadRegistry().find(
    g => normalizeInviteCode(g.invitationCode) === normalized,
  )
  if (fromRegistry) return fromRegistry

  const current = loadGroupState()
  if (
    current.hasCreatedGroup &&
    isValidGroup(current.group) &&
    normalizeInviteCode(current.group.invitationCode) === normalized
  ) {
    return current.group
  }

  if (normalized === FIXED_INVITE_CODE) {
    return getDefaultJoinableGroup()
  }

  return null
}

export function joinGroupFromInviteCode(code) {
  const normalized = normalizeInviteCode(code)
  if (!normalized) {
    return { ok: false, error: 'Enter an invitation code.' }
  }

  const group = findGroupByInviteCode(normalized)
  if (!group) {
    return { ok: false, error: 'Invalid invitation code. Check the code and try again.' }
  }

  return { ok: true, group: applyJoinedGroupMembers(group) }
}

export function saveGroupState({ group, hasCreatedGroup, groupBannerExpanded }) {
  try {
    if (!hasCreatedGroup || !isValidGroup(group)) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    const normalizedGroup = withFixedInviteCode(group)
    const existing = readStorageBlob()
    registerGroup(normalizedGroup)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        group: normalizedGroup,
        hasCreatedGroup: true,
        groupBannerExpanded,
        ...(isValidMeetupPoint(existing.meetupPoint)
          ? { meetupPoint: existing.meetupPoint }
          : {}),
      }),
    )
  } catch {
    // Ignore storage errors (e.g. private browsing quota)
  }
}
