export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function allEmailsFilled(emails) {
  return emails.every(email => email.trim().length > 0)
}

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

export function isEmailDuplicate(email, emails, excludeIndex = -1) {
  const normalized = normalizeEmail(email)
  if (!normalized) return false
  return emails.some(
    (other, index) => index !== excludeIndex && normalizeEmail(other) === normalized,
  )
}

export function isEmailInMembers(email, members) {
  const normalized = normalizeEmail(email)
  if (!normalized) return false
  return members.some(
    member => member.email && normalizeEmail(member.email) === normalized,
  )
}

export function nameFromEmail(email) {
  const part = email.split('@')[0] ?? email
  return part
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || email
}

export function normalizeInviteCode(code) {
  return code.trim().toUpperCase()
}

export const FIXED_INVITE_CODE = 'BLASOL'

export function generateInviteCode() {
  return FIXED_INVITE_CODE
}

export function getDefaultJoinableGroup() {
  return {
    name: 'My group',
    invitationCode: FIXED_INVITE_CODE,
    members: buildJoinedGroupMembers(),
  }
}

export function withFixedInviteCode(group) {
  if (!group) return group
  return { ...group, invitationCode: FIXED_INVITE_CODE }
}

export function formatMemberList(members) {
  const labels = members.map(member => (member.isAdmin ? 'You' : member.name))
  if (labels.length === 0) return ''
  if (labels.length === 1) return `${labels[0]}.`
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}.`
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}.`
}

const JOINED_GROUP_MEMBERS = [
  { name: 'Sofia', email: 'sofia@gmail.com' },
  { name: 'Stinne', email: 'stinne.s@gmail.com' },
  { name: 'Maria', email: 'maria.t@hotmail.com' },
]

export function buildJoinedGroupMembers() {
  return [
    { id: 1, name: 'You', email: '', isAdmin: true },
    ...JOINED_GROUP_MEMBERS.map((member, index) => ({
      id: index + 2,
      name: member.name,
      email: member.email,
      isAdmin: false,
    })),
  ]
}

export function applyJoinedGroupMembers(group) {
  return {
    ...group,
    members: buildJoinedGroupMembers(),
  }
}

export function createGroupFromForm(groupName, emails) {
  const invited = emails
    .map(e => e.trim())
    .filter(Boolean)
    .filter((email, index, list) => {
      const normalized = normalizeEmail(email)
      return list.findIndex(e => normalizeEmail(e) === normalized) === index
    })
  let nextId = 2

  const members = [
    { id: 1, name: 'You', email: '', isAdmin: true },
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
