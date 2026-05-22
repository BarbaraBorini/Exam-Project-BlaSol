/**
 * CreateGroupScreen.jsx – Create or join a group
 *
 * This screen has two accordion sections:
 *  1. "Create a new group"  – the user fills in a name and friend emails
 *  2. "Join existing group" – the user enters an invitation code
 *
 * Only one accordion can be open at a time.
 */

import { useState } from 'react'
import './CreateGroupScreen.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'
import {
  BACK_ARROW,
  BTN_CREATE_BG_CLOSED,
  BTN_CREATE_BG_OPEN,
  BTN_JOIN_BG_CLOSED,
  BTN_JOIN_BG_OPEN,
  ICON_CHEVRON_DOWN,
  ICON_ADD,
} from '../assets'
import {
  allEmailsFilled,
  hasDuplicateEmails,
  isEmailDuplicate,
} from '../groupUtils'

// ── Group Accordion ───────────────────────────────────────────────────────────
//
// A reusable expanding/collapsing card.
// When closed it shows the background image for its closed state;
// when open it shows the open-state image and reveals the inner content.

function GroupAccordion({
  id,
  title,
  bgClosed,
  bgOpen,
  variant,
  isOpen,
  onToggle,
  children,
}) {
  return (
    <div
      className={`group-accordion group-accordion--${variant}${isOpen ? ' group-accordion--open' : ''}`}
    >
      {/* Background image switches between closed and open states */}
      <img
        src={isOpen ? bgOpen : bgClosed}
        alt=""
        className="group-accordion__bg"
        aria-hidden="true"
      />
      <button
        type="button"
        className="group-accordion__header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
      >
        <span className="group-accordion__title">{title}</span>
        <img src={ICON_CHEVRON_DOWN} alt="" className="group-accordion__chevron" />
      </button>
      <div
        id={`${id}-panel`}
        className="group-accordion__panel"
        aria-hidden={!isOpen}
      >
        <div className="group-accordion__panel-inner">{children}</div>
      </div>
    </div>
  )
}

// ── Create Group Screen ───────────────────────────────────────────────────────

export default function CreateGroupScreen({ onNavigate, onCreateGroup, onJoinGroup }) {
  // Which accordion is currently open: 'create' | 'join' | null
  const [openSection, setOpenSection] = useState(null)

  // Create-group form state
  const [groupName, setGroupName] = useState('')
  const [emails, setEmails]       = useState(['']) // starts with one empty email field

  // Join-group form state
  const [inviteCode, setInviteCode] = useState('')
  const [joinError, setJoinError]   = useState('')

  // "Create" is only enabled when a group name is set and no email is duplicated
  const canAddMoreEmails = allEmailsFilled(emails) && !hasDuplicateEmails(emails)
  const canCreate        = groupName.trim().length > 0 && !hasDuplicateEmails(emails)

  // Toggle an accordion open/closed; opening one closes the other
  function toggleSection(section) {
    setOpenSection(prev => (prev === section ? null : section))
  }

  // Add a new empty email input field
  function addEmailField() {
    if (!canAddMoreEmails) return
    setEmails(prev => [...prev, ''])
  }

  // Update a specific email field and auto-remove it if the user clears it
  function updateEmail(index, value) {
    setEmails(prev => {
      const next = prev.map((email, i) => (i === index ? value : email))
      const hadEmail = prev[index].trim().length > 0
      const isCleared = !value.trim()

      // If the user deletes the content of a field, remove the extra empty row
      if (hadEmail && isCleared) {
        return pruneExtraEmptyField(next, index)
      }
      return next
    })
  }

  /**
   * Removes an extra empty email field from the list.
   * We keep exactly one empty field at most; any extras are pruned.
   * excludeIndex prevents the field currently being edited from being removed.
   */
  function pruneExtraEmptyField(list, excludeIndex = -1) {
    const emptyIndex = list.findIndex(
      (email, i) => i !== excludeIndex && !email.trim(),
    )
    if (list.length > 1 && emptyIndex !== -1) {
      const pruned = list.filter((_, i) => i !== emptyIndex)
      return pruned.length > 0 ? pruned : ['']
    }
    return list
  }

  // Remove a specific email field by index
  function removeEmailField(index) {
    setEmails(prev => {
      if (prev.length <= 1) return [''] // always keep at least one field
      const withoutDeleted = prev.filter((_, i) => i !== index)
      return pruneExtraEmptyField(withoutDeleted)
    })
  }

  function handleCreate(event) {
    event.preventDefault()
    if (!canCreate) return
    onCreateGroup(groupName, emails)
  }

  function handleJoin() {
    const result = onJoinGroup(inviteCode)
    if (!result?.ok) {
      setJoinError(result?.error ?? 'Could not join group.')
    }
  }

  return (
    <div className="screen create-group-screen">
      <StatusBar />

      <div className="create-group__content">
        <button
          type="button"
          className="back-arrow"
          onClick={() => onNavigate('map')}
          aria-label="Go back"
        >
          <img src={BACK_ARROW} alt="" className="back-arrow__img" />
        </button>

        <h1 className="create-group__title">
          Create a group or join an existing one
        </h1>

        <p className="create-group__subtitle">
          You and your friends will be able to see each other&apos;s location on the
          map and set a meetup point for the group.
        </p>

        <div className="create-group__accordions">

          {/* ── Create a new group ── */}
          <GroupAccordion
            id="create-group"
            title="Create a new group"
            bgClosed={BTN_CREATE_BG_CLOSED}
            bgOpen={BTN_CREATE_BG_OPEN}
            variant="create"
            isOpen={openSection === 'create'}
            onToggle={() => toggleSection('create')}
          >
            <form className="group-form" onSubmit={handleCreate}>
              <label className="group-form__label" htmlFor="group-name">
                Group name:
              </label>
              <input
                id="group-name"
                type="text"
                className="group-form__input"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required
              />

              <span className="group-form__label">Add friends with email</span>
              {emails.map((email, index) => (
                <div key={index} className="group-form__email-row">
                  <input
                    type="email"
                    className={`group-form__input${isEmailDuplicate(email, emails, index) ? ' group-form__input--error' : ''}`}
                    value={email}
                    placeholder="email@example.com"
                    onChange={e => updateEmail(index, e.target.value)}
                    aria-label={`Friend email ${index + 1}`}
                    aria-invalid={isEmailDuplicate(email, emails, index)}
                  />
                  {/* Only show remove button when there is more than one field */}
                  {emails.length > 1 && (
                    <button
                      type="button"
                      className="group-form__email-remove"
                      onClick={() => removeEmailField(index)}
                      aria-label={`Remove email field ${index + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {hasDuplicateEmails(emails) && (
                <p className="group-form__hint group-form__hint--error">
                  Each email must be unique.
                </p>
              )}

              <button
                type="button"
                className="group-form__add-more"
                onClick={addEmailField}
                disabled={!canAddMoreEmails}
              >
                <img src={ICON_ADD} alt="" className="group-form__add-more-icon" />
                <span>Add more</span>
              </button>

              <div className="group-form__actions">
                <button
                  type="submit"
                  className="group-form__submit group-form__submit--create"
                  disabled={!canCreate}
                >
                  Create
                </button>
              </div>
            </form>
          </GroupAccordion>

          {/* ── Join existing group ── */}
          <GroupAccordion
            id="join-group"
            title="Join existing group"
            bgClosed={BTN_JOIN_BG_CLOSED}
            bgOpen={BTN_JOIN_BG_OPEN}
            variant="join"
            isOpen={openSection === 'join'}
            onToggle={() => toggleSection('join')}
          >
            <label className="group-form__label" htmlFor="invite-code">
              Invitation code:
            </label>
            <input
              id="invite-code"
              type="text"
              className={`group-form__input${joinError ? ' group-form__input--error' : ''}`}
              value={inviteCode}
              onChange={e => {
                setInviteCode(e.target.value.toUpperCase()) // always uppercase for the code
                setJoinError('')                            // clear previous error on change
              }}
              placeholder="Enter invitation code"
              aria-invalid={Boolean(joinError)}
            />

            {joinError && (
              <p className="group-form__hint group-form__hint--error">{joinError}</p>
            )}

            <div className="group-form__actions">
              <button
                type="button"
                className="group-form__submit group-form__submit--join"
                onClick={handleJoin}
                disabled={!inviteCode.trim()}
              >
                Join
              </button>
            </div>
          </GroupAccordion>

        </div>
      </div>

      <NavigationMenu activeTab="map" onNavigate={onNavigate} />
    </div>
  )
}
