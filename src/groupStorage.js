const STORAGE_KEY = 'blasol-group'

function getDefaultState() {
  return {
    group: null,
    hasCreatedGroup: false,
    groupBannerExpanded: true,
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

    return {
      group: data.group,
      hasCreatedGroup: true,
      groupBannerExpanded:
        typeof data.groupBannerExpanded === 'boolean' ? data.groupBannerExpanded : true,
    }
  } catch {
    return getDefaultState()
  }
}

export function saveGroupState({ group, hasCreatedGroup, groupBannerExpanded }) {
  try {
    if (!hasCreatedGroup || !isValidGroup(group)) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ group, hasCreatedGroup: true, groupBannerExpanded }),
    )
  } catch {
    // Ignore storage errors (e.g. private browsing quota)
  }
}
