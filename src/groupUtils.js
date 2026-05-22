/**
 * groupUtils.js – Pure helper functions for group logic
 *
 * These functions do not touch the UI or localStorage.
 * They handle things like email validation, name formatting,
 * and building the member list objects used across the app.
 */

// ── Email helpers ─────────────────────────────────────────────────────────────

/** Trim and lowercase an email so comparisons are case-insensitive */
export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

/** Returns true if every email field in the array has been filled in */
export function allEmailsFilled(emails) {
  return emails.every(email => email.trim().length > 0)
}

/** Returns true if any two emails in the array are the same (after normalizing) */
export function hasDuplicateEmails(emails) {
  const seen = new Set()
  for (const email of emails) {
    const normalized = normalizeEmail(email)
    if (!normalized) continue
    if (seen.has(normalized)) return true
    seen.add(normalized)
  }
  return false
}

/**
 * Returns true if a single email already exists elsewhere in the list.
 * excludeIndex lets you skip the field being edited so it doesn't
 * flag itself as a duplicate.
 */
export function isEmailDuplicate(email, emails, excludeIndex = -1) {
  const normalized = normalizeEmail(email)
  if (!normalized) return false
  return emails.some(
    (other, index) => index !== excludeIndex && normalizeEmail(other) === normalized,
  )
}

/** Returns true if an email is already in the group's member list */
export function isEmailInMembers(email, members) {
  const normalized = normalizeEmail(email)
  if (!normalized) return false
  return members.some(
    member => member.email && normalizeEmail(member.email) === normalized,
  )
}

// ── Name helpers ──────────────────────────────────────────────────────────────

/**
 * Converts an email address into a human-readable display name.
 * e.g. "john.doe@gmail.com" → "John Doe"
 */
export function nameFromEmail(email) {
  const part = email.split('@')[0] ?? email
  return (
    part
      .replace(/[._-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || email
  )
}

// ── Invitation code ───────────────────────────────────────────────────────────

/** Trim and uppercase an invite code before comparing or storing it */
export function normalizeInviteCode(code) {
  return code.trim().toUpperCase()
}

/**
 * Fixed code used for the prototype.
 * In a real app this would be randomly generated on the server.
 */
export const FIXED_INVITE_CODE = 'BLASOL'

/** Always returns the fixed invite code (prototype shortcut) */
export function generateInviteCode() {
  return FIXED_INVITE_CODE
}

// ── Mock group data ───────────────────────────────────────────────────────────
//
// The app simulates a pre-existing group that can be joined with code "BLASOL".
// These are the three friends who are already in that group.
// Sofia is set as admin because Mette will join as a regular member.

const JOINED_GROUP_MEMBERS = [
  { name: 'Sofia',  email: 'sofia@gmail.com',     isAdmin: true  },
  { name: 'Stinne', email: 'stinne.s@gmail.com',  isAdmin: false },
  { name: 'Maria',  email: 'maria.t@hotmail.com', isAdmin: false },
]

/**
 * Builds the full member list for when Mette joins an existing group.
 * Mette is placed first and marked as isCurrentUser so the UI can
 * style her card differently ("You").
 */
export function buildJoinedGroupMembers() {
  return [
    { id: 1, name: 'Mette', email: 'mette@gmail.com', isAdmin: false, isCurrentUser: true },
    ...JOINED_GROUP_MEMBERS.map((member, index) => ({
      id: index + 2,
      name: member.name,
      email: member.email,
      isAdmin: member.isAdmin,
    })),
  ]
}

/** Returns the default joinable group (used when the invite code "BLASOL" is entered) */
export function getDefaultJoinableGroup() {
  return {
    name: 'My group',
    invitationCode: FIXED_INVITE_CODE,
    members: buildJoinedGroupMembers(),
  }
}

/**
 * Replaces any stored invite code with the fixed one.
 * Ensures the displayed code is always "BLASOL" regardless of what was saved.
 */
export function withFixedInviteCode(group) {
  if (!group) return group
  return { ...group, invitationCode: FIXED_INVITE_CODE }
}

/**
 * Replaces a group's member list with the standard joined-group member list.
 * Called after the join flow so Mette always gets the correct member data.
 */
export function applyJoinedGroupMembers(group) {
  return {
    ...group,
    members: buildJoinedGroupMembers(),
  }
}

// ── Group creation ────────────────────────────────────────────────────────────

/**
 * Creates a new group object from the Create Group form data.
 * Mette is always the first member and the admin when she creates a group.
 */
export function createGroupFromForm(groupName, emails) {
  // Deduplicate and filter out empty email fields
  const invited = emails
    .map(e => e.trim())
    .filter(Boolean)
    .filter((email, index, list) => {
      const normalized = normalizeEmail(email)
      return list.findIndex(e => normalizeEmail(e) === normalized) === index
    })

  let nextId = 2

  const members = [
    { id: 1, name: 'Mette', email: 'mette@gmail.com', isAdmin: true, isCurrentUser: true },
    ...invited.map(email => ({
      id: nextId++,
      name: nameFromEmail(email),
      email,
      isAdmin: false,
    })),
  ]

  return {
    name: groupName.trim(),
    invitationCode: generateInviteCode(),
    members,
  }
}

// ── Display formatting ────────────────────────────────────────────────────────

/**
 * Formats a member list as a readable sentence for the map group bar.
 * The current user (Mette) is always shown as "You".
 * e.g. "You, Sofia and Stinne."
 */
export function formatMemberList(members) {
  const labels = members.map(member => (member.isCurrentUser ? 'You' : member.name))
  if (labels.length === 0) return ''
  if (labels.length === 1) return `${labels[0]}.`
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}.`
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}.`
}
