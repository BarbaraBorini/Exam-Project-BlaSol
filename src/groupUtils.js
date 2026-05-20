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

export function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function formatMemberList(members) {
  const labels = members.map(member => (member.isAdmin ? 'you' : member.name))
  if (labels.length === 0) return ''
  if (labels.length === 1) return `${labels[0]}.`
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}.`
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}.`
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
