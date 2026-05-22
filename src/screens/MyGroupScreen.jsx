import { useEffect, useState } from 'react'
import './MyGroupScreen.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'
import {
  BACK_ARROW, ICON_EDIT, ICON_COPY,
  AVATAR_ADMIN, AVATAR_MEMBER,
  ICON_LEAVE, ICON_DELETE, ICON_ADD, ICON_LOCATION,
} from '../assets'
import { isEmailInMembers } from '../groupUtils'

// ── Member Card ───────────────────────────────────────────────────────────────
//
// Displays a single group member row.
//
// Props:
//   member     – the member object (name, email, isAdmin, isCurrentUser)
//   canManage  – true when the logged-in user (Mette) is the group admin;
//                controls whether the delete button is shown for other members
//   onRemove   – callback to remove a member by their id

function MemberCard({ member, onRemove, canManage }) {
  // isCurrentUser → dark blue card (always "You")
  // isAdmin       → ADMIN badge (whoever the admin is)
  const cardClass = `member-card ${member.isCurrentUser ? 'member-card--self' : 'member-card--member'}`

  return (
    <div className={cardClass}>
      <div className="member-card__info">
        <img src={member.avatar} alt="" className="member-card__avatar" />
        <div className="member-card__details">
          <span className="member-card__name">{member.name}</span>
          {member.email && (
            <span className="member-card__email">{member.email}</span>
          )}
        </div>
      </div>

      <div className="member-card__actions">
        {/* Admin badge – shows on whoever is the current admin */}
        {member.isAdmin && (
          <span className="member-card__admin-badge">ADMIN</span>
        )}

        {/* Current user gets a "leave" button; admins can delete other members */}
        {member.isCurrentUser ? (
          <button type="button" className="member-card__action" aria-label="Leave group">
            <img src={ICON_LEAVE} alt="" className="member-card__action-icon" />
          </button>
        ) : canManage ? (
          <button
            type="button"
            className="member-card__delete"
            onClick={() => onRemove(member.id)}
            aria-label={`Remove ${member.name}`}
          >
            <img src={ICON_DELETE} alt="" className="member-card__delete-icon" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

// ── Group Name Header ─────────────────────────────────────────────────────────
//
// Shows the group name with an edit button.
// Clicking the edit icon switches to an inline text input.
// Pressing Enter or clicking away saves the new name.

function GroupNameHeader({ name, onNameChange }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  // Keep the draft in sync if the name changes from outside (e.g. after join)
  useEffect(() => {
    setDraft(name)
  }, [name])

  function saveName() {
    const trimmed = draft.trim()
    if (trimmed) onNameChange(trimmed)
    else setDraft(name) // revert if the user cleared the field
    setIsEditing(false)
  }

  return (
    <div className="my-group__header">
      {isEditing ? (
        <input
          type="text"
          className="my-group__title-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={saveName}
          onKeyDown={e => {
            if (e.key === 'Enter') saveName()
            if (e.key === 'Escape') {
              setDraft(name)
              setIsEditing(false)
            }
          }}
          autoFocus
          aria-label="Group name"
        />
      ) : (
        <h1 className="my-group__title">{name}</h1>
      )}
      <button
        type="button"
        className="my-group__edit-btn"
        onClick={() => setIsEditing(true)}
        aria-label="Edit group name"
      >
        <img src={ICON_EDIT} alt="" className="my-group__edit-icon" />
      </button>
    </div>
  )
}

// ── My Group Screen ───────────────────────────────────────────────────────────
//
// Shows the current group: invitation code, location sharing toggle,
// and the member list with the option to add or remove members.

export default function MyGroupScreen({
  onNavigate,
  group,
  onGroupNameChange,
  onAddMember,
  onRemoveMember,
}) {
  const [inviteEmail, setInviteEmail]     = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [copied, setCopied]               = useState(false)

  // Reset "Copied!" label when the invitation code changes
  useEffect(() => {
    setCopied(false)
  }, [group.invitationCode])

  // Auto-hide the "Copied!" label after 2 seconds
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  // Check whether the logged-in user (Mette) is the admin of this group.
  // This is true when she created the group, false when she joined someone else's group.
  const currentUserIsAdmin = group.members.some(m => m.isCurrentUser && m.isAdmin)

  // Attach avatars: Mette always gets the admin/self avatar, everyone else the member avatar.
  // This is a visual distinction ("You" = dark blue card), not tied to admin status.
  const members = group.members.map(member => ({
    ...member,
    avatar: member.isCurrentUser ? AVATAR_ADMIN : AVATAR_MEMBER,
  }))

  const inviteIsDuplicate = isEmailInMembers(inviteEmail, group.members)

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(group.invitationCode)
      setCopied(true)
    } catch {
      // Clipboard API may be unavailable in non-secure contexts (http)
    }
  }

  function handleAddInvite(event) {
    event.preventDefault()
    const trimmed = inviteEmail.trim()
    if (!trimmed || inviteIsDuplicate) return
    onAddMember(trimmed)
    setInviteEmail('')
    setShowInviteForm(false)
  }

  return (
    <div className="screen my-group-screen">
      <StatusBar />

      <div className="my-group__content">
        <button
          type="button"
          className="back-arrow"
          onClick={() => onNavigate('map')}
          aria-label="Go back"
        >
          <img src={BACK_ARROW} alt="" className="back-arrow__img" />
        </button>

        <GroupNameHeader name={group.name} onNameChange={onGroupNameChange} />

        {/* ── Invitation code ── */}
        <div className="invitation-section">
          <span className="section-label">Invitation code</span>
          <div className="invitation-code-box">
            <span className="invitation-code-box__code">{group.invitationCode}</span>
            <button
              type="button"
              className="invitation-code-box__copy"
              onClick={handleCopyCode}
              aria-label={copied ? 'Copied to clipboard' : 'Copy invitation code'}
            >
              {copied ? (
                <span className="invitation-code-box__copied">Copied!</span>
              ) : (
                <img src={ICON_COPY} alt="" className="invitation-code-box__copy-icon" />
              )}
            </button>
          </div>
        </div>

        {/* ── Location sharing toggle (visual only – not functional) ── */}
        <div className="location-sharing-section">
          <span className="section-label">Location sharing</span>
          <div className="location-sharing-card">
            <div className="location-sharing-card__row">
              <div className="location-sharing-card__left">
                <img src={ICON_LOCATION} alt="" className="location-sharing-card__icon" />
                <span className="location-sharing-card__label">Share my location</span>
              </div>
              <button
                type="button"
                className="location-toggle location-toggle--on"
                aria-label="Toggle location sharing"
              >
                <span className="location-toggle__thumb" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Member list ── */}
        <div className="members-section">
          <span className="section-label">Group members</span>

          {members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              canManage={currentUserIsAdmin}
              onRemove={memberId => {
                onRemoveMember(memberId)
                setShowInviteForm(false)
                setInviteEmail('')
              }}
            />
          ))}

          {/* Inline invite form – shown when "Add more" is clicked */}
          {showInviteForm && (
            <form className="invite-member-form" onSubmit={handleAddInvite}>
              <input
                type="email"
                className={`invite-member-form__input${inviteIsDuplicate ? ' invite-member-form__input--error' : ''}`}
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                required
                aria-label="Email to invite"
                aria-invalid={inviteIsDuplicate}
              />
              <button
                type="submit"
                className="invite-member-form__submit"
                disabled={!inviteEmail.trim() || inviteIsDuplicate}
              >
                Invite
              </button>
            </form>
          )}

          {showInviteForm && inviteIsDuplicate && (
            <p className="invite-member-form__hint">This email is already in the group.</p>
          )}

          <button
            type="button"
            className="add-more-btn"
            onClick={() => setShowInviteForm(true)}
          >
            <img src={ICON_ADD} alt="" className="add-more-btn__icon" />
            <span className="add-more-btn__label">Add more</span>
          </button>
        </div>
      </div>

      <NavigationMenu activeTab="map" onNavigate={onNavigate} />
    </div>
  )
}
