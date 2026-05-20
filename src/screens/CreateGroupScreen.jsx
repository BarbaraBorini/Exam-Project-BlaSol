import { useState } from 'react'
import './CreateGroupScreen.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'
import {
  BACK_ARROW,
  BTN_CREATE_BG,
  BTN_JOIN_BG,
  ICON_CHEVRON_DOWN,
  ICON_ADD,
} from '../assets'
import {
  allEmailsFilled,
  hasDuplicateEmails,
  isEmailDuplicate,
} from '../groupUtils'

function GroupAccordion({
  id,
  title,
  bgSrc,
  variant,
  isOpen,
  onToggle,
  children,
}) {
  return (
    <div
      className={`group-accordion group-accordion--${variant}${isOpen ? ' group-accordion--open' : ''}`}
    >
      <img src={bgSrc} alt="" className="group-accordion__bg" aria-hidden="true" />
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

export default function CreateGroupScreen({ onNavigate, onCreateGroup }) {
  const [openSection, setOpenSection] = useState(null)
  const [groupName, setGroupName] = useState('')
  const [emails, setEmails] = useState([''])
  const [inviteCode, setInviteCode] = useState('')

  const canAddMoreEmails = allEmailsFilled(emails) && !hasDuplicateEmails(emails)
  const canCreate =
    groupName.trim().length > 0 && !hasDuplicateEmails(emails)

  function toggleSection(section) {
    setOpenSection(prev => (prev === section ? null : section))
  }

  function addEmailField() {
    if (!canAddMoreEmails) return
    setEmails(prev => [...prev, ''])
  }

  function updateEmail(index, value) {
    setEmails(prev => {
      const next = prev.map((email, i) => (i === index ? value : email))
      const hadEmail = prev[index].trim().length > 0
      const isCleared = !value.trim()

      if (hadEmail && isCleared) {
        return pruneExtraEmptyField(next, index)
      }

      return next
    })
  }

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

  function removeEmailField(index) {
    setEmails(prev => {
      if (prev.length <= 1) return ['']
      const withoutDeleted = prev.filter((_, i) => i !== index)
      return pruneExtraEmptyField(withoutDeleted)
    })
  }

  function handleCreate(event) {
    event.preventDefault()
    if (!canCreate) return
    onCreateGroup(groupName, emails)
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
          <GroupAccordion
            id="create-group"
            title="Create a new group"
            bgSrc={BTN_CREATE_BG}
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

          <GroupAccordion
            id="join-group"
            title="Join existing group"
            bgSrc={BTN_JOIN_BG}
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
              className="group-form__input"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              placeholder="Enter invitation code"
            />

            <div className="group-form__actions">
              <button
                type="button"
                className="group-form__submit group-form__submit--join"
                onClick={() => onNavigate('my-group')}
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
