import { useEffect, useState } from 'react'
import './MyGroupScreen.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'
import {
  BACK_ARROW, ICON_EDIT, ICON_COPY,
  AVATAR_ADMIN, AVATAR_MEMBER,
  ICON_LEAVE, ICON_DELETE, ICON_ADD,
} from '../assets'
import { isEmailInMembers } from '../groupUtils'

function MemberCard({ member, onRemove }) {
  return (
    <div className={`member-card ${member.isAdmin ? 'member-card--admin' : 'member-card--member'}`}>
      <div className="member-card__info">
        <img src={member.avatar} alt="" className="member-card__avatar" />
        <div className="member-card__details">
          <span className="member-card__name">{member.name}</span>
          {member.email ? (
            <span className="member-card__email">{member.email}</span>
          ) : null}
        </div>
      </div>

      {member.isAdmin ? (
        <>
          <span className="member-card__admin-badge">ADMIN</span>
          <button type="button" className="member-card__action" aria-label="Leave group">
            <img src={ICON_LEAVE} alt="" className="member-card__action-icon" />
          </button>
        </>
      ) : (
        <button
          type="button"
          className="member-card__delete"
          onClick={() => onRemove(member.id)}
          aria-label={`Remove ${member.name}`}
        >
          <img src={ICON_DELETE} alt="" className="member-card__delete-icon" />
        </button>
      )}
    </div>
  )
}

function GroupNameHeader({ name, onNameChange }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  useEffect(() => {
    setDraft(name)
  }, [name])

  function saveName() {
    const trimmed = draft.trim()
    if (trimmed) onNameChange(trimmed)
    else setDraft(name)
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

export default function MyGroupScreen({
  onNavigate,
  group,
  onGroupNameChange,
  onAddMember,
  onRemoveMember,
}) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCopied(false)
  }, [group.invitationCode])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const members = group.members.map(member => ({
    ...member,
    avatar: member.isAdmin ? AVATAR_ADMIN : AVATAR_MEMBER,
  }))

  const inviteIsDuplicate = isEmailInMembers(inviteEmail, group.members)

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(group.invitationCode)
      setCopied(true)
    } catch {
      // Clipboard API unavailable (e.g. non-secure context) – silently ignore
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

        <div className="members-section">
          <span className="section-label">Group members</span>

          {members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onRemove={memberId => {
                onRemoveMember(memberId)
                setShowInviteForm(false)
                setInviteEmail('')
              }}
            />
          ))}

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
