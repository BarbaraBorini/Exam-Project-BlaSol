/**
 * groupStorage.js – localStorage persistence for group data
 *
 * The browser's localStorage is used to remember the user's group
 * between page refreshes. Everything is stored under a single JSON key.
 *
 * Stored shape (STORAGE_KEY):
 * {
 *   group:               { name, invitationCode, members[] }
 *   hasCreatedGroup:     boolean
 *   groupBannerExpanded: boolean
 *   meetupPoint:         { left, top, time } | undefined
 * }
 *
 * A second key (REGISTRY_KEY) keeps a list of known groups so that
 * invite codes can be looked up even across browser sessions.
 */

import {
  applyJoinedGroupMembers,
  FIXED_INVITE_CODE,
  getDefaultJoinableGroup,
  normalizeInviteCode,
  withFixedInviteCode,
} from './groupUtils'

const STORAGE_KEY  = 'blasol-group'
const REGISTRY_KEY = 'blasol-group-registry'

// ── Default state ─────────────────────────────────────────────────────────────

/** The state used when no saved data is found (first-time visitor) */
function getDefaultState() {
  return {
    group: null,
    hasCreatedGroup: false,
    groupBannerExpanded: true,
    meetupPoint: null,
  }
}

// ── Low-level storage helpers ─────────────────────────────────────────────────

/** Reads the raw blob from localStorage. Returns {} on error or if empty. */
function readStorageBlob() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// ── Validation ────────────────────────────────────────────────────────────────
//
// Before trusting data from localStorage we validate its shape.
// localStorage can contain stale, corrupted, or manually edited data.

function isValidMeetupPoint(point) {
  if (!point || typeof point !== 'object') return false
  return (
    typeof point.left === 'number' &&
    typeof point.top  === 'number' &&
    typeof point.time === 'string' &&
    point.time.length > 0
  )
}

function isValidGroup(group) {
  if (!group || typeof group !== 'object') return false
  return (
    typeof group.name          === 'string' && group.name.trim().length > 0 &&
    typeof group.invitationCode === 'string' && group.invitationCode.length > 0 &&
    Array.isArray(group.members) && group.members.length > 0 &&
    group.members.every(
      member =>
        member &&
        typeof member.id      === 'number'  &&
        typeof member.name    === 'string'  &&
        typeof member.isAdmin === 'boolean',
    )
  )
}

// ── Meetup point ──────────────────────────────────────────────────────────────

/** Load the last saved meetup point, or null if none/invalid */
export function loadMeetupPoint() {
  const point = readStorageBlob().meetupPoint
  return isValidMeetupPoint(point) ? point : null
}

/** Save (or clear) the meetup point without overwriting other stored data */
export function saveMeetupPoint(meetupPoint) {
  try {
    const current = readStorageBlob()

    if (meetupPoint && isValidMeetupPoint(meetupPoint)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, meetupPoint }))
      return
    }

    // meetupPoint is null/invalid – remove it from the blob
    delete current.meetupPoint
    if (Object.keys(current).length === 0) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    // Ignore storage errors (e.g. private browsing, quota exceeded)
  }
}

// ── Group state ───────────────────────────────────────────────────────────────

/** Load all group-related state from localStorage, or return defaults */
export function loadGroupState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()

    const data = JSON.parse(raw)
    if (!data.hasCreatedGroup || !isValidGroup(data.group)) {
      return getDefaultState()
    }

    const group = withFixedInviteCode(data.group)
    registerGroup(group) // keep the registry up to date

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

/** Persist the current group state to localStorage */
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
        // Preserve the meetup point if it was already saved
        ...(isValidMeetupPoint(existing.meetupPoint)
          ? { meetupPoint: existing.meetupPoint }
          : {}),
      }),
    )
  } catch {
    // Ignore storage errors (e.g. private browsing quota)
  }
}

// ── Group registry ────────────────────────────────────────────────────────────
//
// A secondary list of known groups stored separately so that invite codes
// can be resolved even across different sessions or devices sharing storage.

function loadRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.filter(isValidGroup) : []
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

/** Add or update a group in the registry (keyed by invite code) */
export function registerGroup(group) {
  if (!isValidGroup(group)) return
  const code = normalizeInviteCode(group.invitationCode)
  const registry = loadRegistry().filter(
    g => normalizeInviteCode(g.invitationCode) !== code,
  )
  registry.push(group)
  saveRegistry(registry)
}

// ── Join flow ─────────────────────────────────────────────────────────────────

/**
 * Looks up a group by invite code.
 * Checks the registry first, then the current session, then the built-in
 * demo group (code "BLASOL").
 */
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

  // Fall back to the built-in demo group
  if (normalized === FIXED_INVITE_CODE) {
    return getDefaultJoinableGroup()
  }

  return null
}

/**
 * Attempts to join a group using an invite code.
 * Returns { ok: true, group } on success or { ok: false, error } on failure.
 */
export function joinGroupFromInviteCode(code) {
  const normalized = normalizeInviteCode(code)
  if (!normalized) {
    return { ok: false, error: 'Enter an invitation code.' }
  }

  const group = findGroupByInviteCode(normalized)
  if (!group) {
    return { ok: false, error: 'Invalid invitation code. Check the code and try again.' }
  }

  // Replace the stored members with the standard joined-group member list
  return { ok: true, group: applyJoinedGroupMembers(group) }
}
