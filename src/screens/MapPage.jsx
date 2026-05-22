import { useState, useRef, useEffect } from 'react'
import './MapPage.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'
import { formatMemberList } from '../groupUtils'
import { loadMeetupPoint, saveMeetupPoint } from '../groupStorage'
import iconGroup from '../assets/group.svg'
import iconEyeOpen from '../assets/eye_open.svg'
import iconEyeClosed from '../assets/eye-closed.svg'
import iconMeetup from '../assets/meetup-point.svg'
import iconMeetupblue from '../assets/meetup-blue.svg'
import iconTime from '../assets/time.svg'

// Local map SVG (includes background, paths, North sign, You-marker, AID icon, entrances)
import mapSvg from '../assets/Map.svg'

// Local icon SVGs
import iconBar     from '../assets/bar.svg'
import iconWC      from '../assets/toilets.svg'
import iconMerch   from '../assets/merch.svg'
import iconVand    from '../assets/water.svg'
import iconStage   from '../assets/stage.svg'
import iconFood    from '../assets/food.svg'
import iconBlasolBar from '../assets/blasol-bar.svg'

// Local stage banner backgrounds
import stageBgVidunderbla  from '../assets/Background-VIDUNDERBLÅ.svg'
import stageBgBirkelunden  from '../assets/Background-BIRKELUNDEN.svg'
import stageBgByfesten     from '../assets/Background-BYFESTEN.svg'
import stageBgDragonen     from '../assets/Background-DRAGONEN.svg'

// Figma CDN – map header UI icons only
import {
  ICON_FILTER, ICON_BANNER_GROUP, ICON_CHEVRON_DOWN, BACK_ARROW} from '../assets'

// ── Sub-components ────────────────────────────────────────────────────────────

const GROUP_BANNER_DESCRIPTION =
  'When you and your friends join a group, you are able to see each other\u2019s location on the map and set a meetup point for the group.'

const FRIEND_MARKER_POSITIONS = [
  { left: 72, top: 420 },
  { left: 280, top: 380 },
  { left: 195, top: 520 },
]

function MyGroupBar({ group, onOpenMyGroup, friendsVisible, onToggleFriends, onNewMeetup }) {
  return (
    <div className="my-group-bar">
      <div className="my-group-bar__info">
        <img src={iconGroup} alt="" className="my-group-bar__group-icon" />
        <div className="my-group-bar__text">
          <span className="my-group-bar__name">{group.name}</span>
          <span className="my-group-bar__members">{formatMemberList(group.members)}</span>
        </div>
        <button
          type="button"
          className="my-group-bar__nav"
          onClick={onOpenMyGroup}
          aria-label="Open group settings"
        >
          <img src={BACK_ARROW} alt="" className="my-group-bar__arrow" />
        </button>
      </div>
      <div className="my-group-bar__actions">
        <button
          type="button"
          className="my-group-bar__btn my-group-bar__btn--hide"
          onClick={onToggleFriends}
        >
          <img
            src={friendsVisible ? iconEyeOpen : iconEyeClosed}
            alt=""
            className="my-group-bar__btn-icon"
          />
          <span>{friendsVisible ? 'Hide on map' : 'Show on map'}</span>
        </button>
        <button
          type="button"
          className="my-group-bar__btn my-group-bar__btn--meetup"
          onClick={onNewMeetup}
        >
          <img src={iconMeetupblue} alt="" className="my-group-bar__btn-icon" />
          <span>New meetup point</span>
        </button>
      </div>
    </div>
  )
}

function FriendMarkers({ members, visible, selectedFriendId, onFriendClick }) {
  if (!visible) return null

  const friends = members.filter(member => !member.isCurrentUser)

  return friends.map((member, index) => {
    const position = FRIEND_MARKER_POSITIONS[index % FRIEND_MARKER_POSITIONS.length]
    const initial = member.name.charAt(0).toUpperCase()
    const showName = selectedFriendId === member.id

    return (
      <button
        key={member.id}
        type="button"
        className="friend-marker"
        style={{ left: position.left, top: position.top }}
        onClick={e => onFriendClick(e, member.id)}
        aria-label={`${member.name}, tap to show name`}
        aria-expanded={showName}
      >
        <span className="friend-marker__label">{initial}</span>
        {showName && <span className="friend-marker__name">{member.name}</span>}
      </button>
    )
  })
}

function GroupBanner({ expanded, onExpandedChange, onJoin }) {
  return (
    <div className={`group-banner${expanded ? ' group-banner--expanded' : ''}`}>
      <div className="group-banner__header">
        <button type="button" className="group-banner__join-btn" onClick={onJoin}>
          <img src={ICON_BANNER_GROUP} alt="" className="group-banner__people-icon" />
          <span className="group-banner__text">Join or create group</span>
        </button>
        <button
          type="button"
          className="group-banner__toggle"
          onClick={() => onExpandedChange(prev => !prev)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse group info' : 'Expand group info'}
        >
          <img src={ICON_CHEVRON_DOWN} alt="" className="group-banner__chevron-icon" />
        </button>
      </div>
      <div className="group-banner__panel" aria-hidden={!expanded}>
        <div className="group-banner__panel-inner">
          <p className="group-banner__description">{GROUP_BANNER_DESCRIPTION}</p>
        </div>
      </div>
    </div>
  )
}

// ── Tag sub-components ────────────────────────────────────────────────────────

// Paths extracted from assets/person.svg (viewBox 0 0 7 12)
const PERSON_BODY = 'M2.71399 2.54924C3.16326 2.42151 3.64186 2.44311 4.0778 2.61079C4.51374 2.77848 4.88345 3.08318 5.13131 3.47906L5.44939 3.98722L5.46079 4.00547L5.47106 4.02372L6.49786 5.84914C6.55664 5.95362 6.59426 6.06864 6.60858 6.18765C6.62291 6.30667 6.61365 6.42733 6.58133 6.54277C6.54902 6.6582 6.49429 6.76614 6.42026 6.86042C6.34624 6.9547 6.25436 7.03348 6.14989 7.09226C6.04542 7.15103 5.93039 7.18866 5.81138 7.20298C5.69237 7.2173 5.5717 7.20804 5.45627 7.17573C5.34083 7.14342 5.2329 7.08868 5.13861 7.01466C5.04433 6.94063 4.96556 6.84876 4.90678 6.74429L4.56155 6.13026V7.07902L5.66524 10.8319C5.73291 11.0639 5.70577 11.3133 5.58978 11.5254C5.47379 11.7374 5.27842 11.8948 5.04653 11.963C4.81464 12.0312 4.56517 12.0046 4.35285 11.8891C4.14053 11.7736 3.98269 11.5786 3.91398 11.3469L3.30657 9.28139L2.69893 11.3469C2.63022 11.5786 2.47239 11.7736 2.26007 11.8891C2.04774 12.0046 1.79827 12.0312 1.56638 11.963C1.33449 11.8948 1.13912 11.7374 1.02313 11.5254C0.907139 11.3133 0.880001 11.0639 0.94767 10.8319L2.05159 7.07902L2.05159 6.13026L1.70613 6.74406C1.58683 6.95387 1.38929 7.10789 1.15672 7.17241C0.924143 7.23693 0.675482 7.20671 0.465138 7.08836C0.254793 6.97 0.0998916 6.77314 0.0343252 6.54086C-0.0312411 6.30858 -0.00213394 6.05979 0.115278 5.84892L1.14208 4.02441L1.1512 4.00798L1.16124 3.99201L1.47362 3.48682C1.75572 3.03053 2.19809 2.69629 2.71399 2.54924Z'
const PERSON_HEAD = 'M2.8851 2.33541C3.03142 2.40904 3.19094 2.45279 3.35435 2.46411C3.51776 2.47543 3.68179 2.45409 3.83686 2.40133C3.99194 2.34857 4.13495 2.26546 4.25756 2.15684C4.38017 2.04822 4.47991 1.91627 4.55098 1.76869C4.62204 1.6211 4.663 1.46084 4.67146 1.29726C4.67993 1.13368 4.65572 0.970047 4.60027 0.815918C4.54481 0.661789 4.45922 0.520248 4.34847 0.399555C4.23773 0.278863 4.10406 0.181435 3.95525 0.112959C3.66145 -0.0222457 3.3263 -0.0366522 3.02197 0.0728421C2.71765 0.182336 2.4685 0.406972 2.32819 0.698371C2.18787 0.989769 2.16762 1.32462 2.27178 1.63081C2.37595 1.937 2.5962 2.19003 2.8851 2.33541Z'

function QueueTag({ level }) {
  const bg     = { short: 'var(--green)', medium: 'var(--orange)', long: 'var(--red)' }[level]
  const filled = { short: 1,             medium: 2,                long: 3            }[level]
  return (
    <div className="queue-tag" style={{ background: bg }} aria-label={`${level} queue`}>
      {[0, 1, 2].map(i => (
        <svg key={i} className="queue-tag__person" width="7" height="12" viewBox="0 0 7 12" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d={PERSON_BODY} fill={i < filled ? 'var(--dark-blue)' : 'white'} />
          <path d={PERSON_HEAD} fill={i < filled ? 'var(--dark-blue)' : 'white'} />
        </svg>
      ))}
    </div>
  )
}

function ArtistTag({ now, inset = 2 }) {
  return (
    <div
      className="artist-tag"
      style={{ bottom: `calc(100% - ${inset}px)` }}
      aria-label={`Now playing: ${now}`}
    >
      <span className="artist-tag__note" aria-hidden="true">♪</span>
      <span className="artist-tag__label">NOW:</span>
      <span className="artist-tag__name">{now}</span>
    </div>
  )
}

// ── Filter bar ────────────────────────────────────────────────────────────────

const FILTER_PILLS = [
  { id: 'stages',  label: 'Scener'    },
  { id: 'toilets', label: 'Toiletter' },
  { id: 'bars',    label: 'Barer'     },
]

function FilterBar({ activeFilters, onToggle, onReset }) {
  const anyActive = Object.values(activeFilters).some(Boolean)

  return (
    <div className="filter-bar">
      <button
        type="button"
        className={`filter-bar__label${anyActive ? ' filter-bar__label--active' : ''}`}
        onClick={onReset}
        aria-label={anyActive ? 'Clear all filters' : 'Filters'}
      >
        {anyActive ? (
          <>
            <span className="filter-bar__clear-x" aria-hidden="true">×</span>
            <span className="filter-bar__ryd-text">Ryd</span>
          </>
        ) : (
          <>
            <img src={ICON_FILTER} alt="" className="filter-bar__filter-icon" />
            <span className="filter-bar__filter-text">Filter</span>
          </>
        )}
      </button>

      {FILTER_PILLS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`filter-pill${activeFilters[id] ? ' filter-pill--active' : ''}`}
          onClick={() => onToggle(id)}
          aria-pressed={activeFilters[id]}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Map item components ───────────────────────────────────────────────────────

function MapItem({ type, icon, label, left, top, multiLine = false, hidden = false, queue = null, highlighted = false }) {
  if (hidden) return null
  return (
    <div
      className={`map-item map-item--${type}${highlighted ? ' map-item--highlighted' : ''}`}
      style={{ left, top, zIndex: 11 }}
    >
      {highlighted && queue && <QueueTag level={queue} />}
      <img src={icon} alt="" className="map-item__icon" />
      <span
        className="map-item__label"
        style={multiLine ? { whiteSpace: 'pre-line' } : undefined}
      >
        {label}
      </span>
    </div>
  )
}

const MEETUP_HINT_TEXT =
  'Click where you want to create your meet up point.'

function MeetupHint() {
  return (
    <div className="meetup-hint" role="status">
      <p className="meetup-hint__text">{MEETUP_HINT_TEXT}</p>
    </div>
  )
}

const MEETUP_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MEETUP_MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

function MeetupTimeField({ time, onTimeChange }) {
  const [hour, minute] = time ? time.split(':') : ['', '']

  const handleHourChange = e => {
    const nextHour = e.target.value
    if (!nextHour) {
      onTimeChange('')
      return
    }
    onTimeChange(`${nextHour}:${minute || '00'}`)
  }

  const handleMinuteChange = e => {
    const nextMinute = e.target.value
    if (!nextMinute) {
      onTimeChange(hour ? `${hour}:00` : '')
      return
    }
    onTimeChange(`${hour || '00'}:${nextMinute}`)
  }

  return (
    <div className="meetup-modal__time-field">
      <img src={iconTime} alt="" className="meetup-modal__time-icon" />
      <div className="meetup-modal__time-selects">
        <select
          className="meetup-modal__time-select"
          value={hour}
          onChange={handleHourChange}
          aria-label="Hour"
        >
          <option value="" disabled>
            HH
          </option>
          {MEETUP_HOURS.map(h => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="meetup-modal__time-separator">:</span>
        <select
          className="meetup-modal__time-select"
          value={minute}
          onChange={handleMinuteChange}
          aria-label="Minute"
        >
          <option value="" disabled>
            MM
          </option>
          {MEETUP_MINUTES.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function MeetupModal({ time, onTimeChange, onCancel, onCreate }) {
  const [hour, minute] = time ? time.split(':') : ['', '']
  const canCreate = Boolean(hour && minute)

  return (
    <div className="meetup-modal-overlay" role="presentation">
      <div className="meetup-modal" role="dialog" aria-labelledby="meetup-modal-title">
        <h2 id="meetup-modal-title" className="meetup-modal__title">New meetup point</h2>
        <p className="meetup-modal__description">
          The meetup point will be visible on the map and your friends will be notified.
        </p>
        <MeetupTimeField time={time} onTimeChange={onTimeChange} />
        <div className="meetup-modal__actions">
          <button type="button" className="meetup-modal__btn meetup-modal__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="meetup-modal__btn meetup-modal__btn--create"
            onClick={onCreate}
            disabled={!canCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

function MeetupMarker({ left, top, time, preview = false, showTime = false, onClick }) {
  const MarkerTag = preview ? 'div' : 'button'

  return (
    <MarkerTag
      type={preview ? undefined : 'button'}
      className={`meetup-marker${preview ? ' meetup-marker--preview' : ''}`}
      style={{ left, top }}
      onClick={preview ? undefined : onClick}
      aria-label={preview ? undefined : `Meetup point at ${time || 'selected time'}`}
    >
      <img src={iconMeetup} alt="" className="meetup-marker__icon" />
      {!preview && showTime && time && (
        <span className="meetup-marker__time">{time}</span>
      )}
    </MarkerTag>
  )
}

function StageItem({ bg, label, left, top, width, height, rotate, hidden = false, nowPlaying = null, highlighted = false, tagInset = 2 }) {
  if (hidden) return null
  return (
    <div
      className="stage-item"
      style={{
        left, top, width, height, zIndex: 10,
        ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
      }}
    >
      {highlighted && nowPlaying && <ArtistTag now={nowPlaying} inset={tagInset} />}
      <img src={bg} alt="" className="stage-item__bg" />
      <div className="stage-item__content">
        <img src={iconStage} alt="" className="stage-item__icon" />
        <span className="stage-item__label">{label}</span>
      </div>
    </div>
  )
}

// ── Map Page ──────────────────────────────────────────────────────────────────

const ALL_FILTERS_OFF = { stages: false, toilets: false, bars: false }

export default function MapPage({
  onNavigate,
  group,
  hasCreatedGroup,
  groupBannerExpanded,
  onGroupBannerExpandedChange,
  onJoinGroup,
}) {
  const [activeFilters, setActiveFilters] = useState(ALL_FILTERS_OFF)
  const anyFilterActive = Object.values(activeFilters).some(Boolean)

  const [friendsVisible, setFriendsVisible] = useState(true)
  const [meetupMode, setMeetupMode] = useState(null)
  const [pendingMeetupPosition, setPendingMeetupPosition] = useState(null)
  const [meetupPoint, setMeetupPoint] = useState(() => loadMeetupPoint())
  const [meetupTime, setMeetupTime] = useState('')
  const [meetupTimeVisible, setMeetupTimeVisible] = useState(false)
  const [selectedFriendId, setSelectedFriendId] = useState(null)
  const mapContainerRef = useRef(null)
  const meetupModeRef = useRef(meetupMode)

  useEffect(() => {
    meetupModeRef.current = meetupMode
  }, [meetupMode])

  useEffect(() => {
    saveMeetupPoint(meetupPoint)
  }, [meetupPoint])

  const handleNewMeetup = () => {
    if (meetupMode === 'placing') {
      setMeetupMode(null)
      setPendingMeetupPosition(null)
      setMeetupTime('')
      setMeetupTimeVisible(false)
      return
    }
    setMeetupMode('placing')
    setPendingMeetupPosition(null)
    setMeetupTime('')
    setMeetupTimeVisible(false)
  }

  const handlePlacingMapClick = e => {
    if (meetupModeRef.current !== 'placing' || !mapContainerRef.current) return
    const rect = mapContainerRef.current.getBoundingClientRect()
    setPendingMeetupPosition({
      left: e.clientX - rect.left,
      top: e.clientY - rect.top,
    })
    setMeetupTime('')
    setMeetupMode('modal')
  }

  const handleMeetupCancel = () => {
    setMeetupMode('placing')
    setPendingMeetupPosition(null)
    setMeetupTime('')
  }

  const handleMeetupCreate = () => {
    if (!meetupTime || !pendingMeetupPosition) return

    setMeetupPoint({ ...pendingMeetupPosition, time: meetupTime })
    setMeetupMode(null)
    setPendingMeetupPosition(null)
    setMeetupTimeVisible(false)
  }

  const handleMeetupMarkerClick = e => {
    e.stopPropagation()
    setMeetupTimeVisible(prev => !prev)
  }

  const handleFriendClick = (e, memberId) => {
    e.stopPropagation()
    setSelectedFriendId(prev => (prev === memberId ? null : memberId))
  }

  return (
    <div className="screen map-screen">
      <StatusBar />

      <div ref={mapContainerRef} className="map-container">
        {/*
          Map.svg already contains:
          - Map background + path fills
          - North compass sign
          - "You" location marker
          - AID / first-aid icon
          - Entrance signs (INDGANG)
        */}
        <img src={mapSvg} alt="Festival map" className="map-bg-layer" />

        {/* ── Stages ── */}
        <StageItem bg={stageBgVidunderbla} label="VIDUNDERBLÅ" left={221} top={89}  width={123} height={56}                   hidden={anyFilterActive && !activeFilters.stages} highlighted={anyFilterActive && activeFilters.stages} nowPlaying={'Saveus'} />
        <StageItem bg={stageBgBirkelunden} label="BIRKELUNDEN" left={-12} top={383} width={130} height={97}  rotate={23.46}  hidden={anyFilterActive && !activeFilters.stages} highlighted={anyFilterActive && activeFilters.stages} nowPlaying={'Marie'} tagInset={14} />
        <StageItem bg={stageBgByfesten}   label="BYFESTEN"    left={58}  top={560} width={105} height={80}                   hidden={anyFilterActive && !activeFilters.stages} highlighted={anyFilterActive && activeFilters.stages} nowPlaying={'Natural Born..'} />
        <StageItem bg={stageBgDragonen}   label="DRAGONEN"    left={329} top={391} width={96}  height={59}  rotate={-12.69} hidden={anyFilterActive && !activeFilters.stages} highlighted={anyFilterActive && activeFilters.stages} nowPlaying={'Galopderby'} />

        {/* ── Bars ── */}
        <MapItem type="bar" icon={iconBar}       label="BAR"             left={226} top={278} hidden={anyFilterActive && !activeFilters.bars} highlighted={anyFilterActive && activeFilters.bars} queue="short" />
        <MapItem type="bar" icon={iconBar}       label="BAR"             left={169} top={103} hidden={anyFilterActive && !activeFilters.bars} highlighted={anyFilterActive && activeFilters.bars} queue="medium" />
        <MapItem type="bar" icon={iconBar}       label="BAR"             left={82}  top={316} hidden={anyFilterActive && !activeFilters.bars} highlighted={anyFilterActive && activeFilters.bars} queue="long" />
        <MapItem type="bar" icon={iconBar}       label="BAR"             left={123} top={510} hidden={anyFilterActive && !activeFilters.bars} highlighted={anyFilterActive && activeFilters.bars} queue="short" />
        <MapItem type="bar" icon={iconBlasolBar} label={'BLÅ SOL\nBAR'} left={206} top={546} multiLine hidden={anyFilterActive && !activeFilters.bars} highlighted={anyFilterActive && activeFilters.bars} queue="medium" />

        {/* ── Toilets ── */}
        <MapItem type="wc" icon={iconWC} label="WC" left={16}  top={173} hidden={anyFilterActive && !activeFilters.toilets} highlighted={anyFilterActive && activeFilters.toilets} queue="short" />
        <MapItem type="wc" icon={iconWC} label="WC" left={204} top={228} hidden={anyFilterActive && !activeFilters.toilets} highlighted={anyFilterActive && activeFilters.toilets} queue="medium" />
        <MapItem type="wc" icon={iconWC} label="WC" left={101} top={655} hidden={anyFilterActive && !activeFilters.toilets} highlighted={anyFilterActive && activeFilters.toilets} queue="long" />
        <MapItem type="wc" icon={iconWC} label="WC" left={353} top={323} hidden={anyFilterActive && !activeFilters.toilets} highlighted={anyFilterActive && activeFilters.toilets} queue="short" />

        {/* ── Other – hidden when any filter is active (no matching category) ── */}
        <MapItem type="merch" icon={iconMerch} label="MERCH"           left={253} top={338} hidden={anyFilterActive} />
        <MapItem type="vand"  icon={iconVand}  label="VAND"            left={164} top={155} hidden={anyFilterActive} />
        <MapItem type="food"  icon={iconFood}  label={'SPISE\nOMRÅDE'} left={278} top={484} multiLine hidden={anyFilterActive} />

        {hasCreatedGroup && group && (
          <FriendMarkers
            members={group.members}
            visible={friendsVisible}
            selectedFriendId={selectedFriendId}
            onFriendClick={handleFriendClick}
          />
        )}

        {pendingMeetupPosition && meetupMode === 'modal' && (
          <MeetupMarker
            left={pendingMeetupPosition.left}
            top={pendingMeetupPosition.top}
            preview
          />
        )}

        {meetupPoint && (
          <MeetupMarker
            left={meetupPoint.left}
            top={meetupPoint.top}
            time={meetupPoint.time}
            showTime={meetupTimeVisible}
            onClick={handleMeetupMarkerClick}
          />
        )}

        {meetupMode === 'placing' && (
          <div
            className="map-placing-overlay"
            onClick={handlePlacingMapClick}
            aria-hidden="true"
          />
        )}
      </div>

      {meetupMode === 'modal' && (
        <MeetupModal
          time={meetupTime}
          onTimeChange={setMeetupTime}
          onCancel={handleMeetupCancel}
          onCreate={handleMeetupCreate}
        />
      )}

      <div className="map-overlays">
        {hasCreatedGroup && group ? (
          <MyGroupBar
            group={group}
            onOpenMyGroup={() => onNavigate('my-group')}
            friendsVisible={friendsVisible}
            onToggleFriends={() => setFriendsVisible(prev => !prev)}
            onNewMeetup={handleNewMeetup}
          />
        ) : (
          <GroupBanner
            expanded={groupBannerExpanded}
            onExpandedChange={onGroupBannerExpandedChange}
            onJoin={onJoinGroup}
          />
        )}
        <div className="map-filter-bar">
          <FilterBar
            activeFilters={activeFilters}
            onToggle={id =>
              setActiveFilters(prev => ({ ...prev, [id]: !prev[id] }))
            }
            onReset={() => setActiveFilters(ALL_FILTERS_OFF)}
          />
        </div>
        {meetupMode === 'placing' && <MeetupHint />}
      </div>

      <NavigationMenu activeTab="map" onNavigate={onNavigate} />
    </div>
  )
}
