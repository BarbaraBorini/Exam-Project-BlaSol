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
import iconTime from '../assets/time.svg'


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
  ICON_FILTER, ICON_BANNER_GROUP, ICON_CHEVRON_DOWN, BACK_ARROW, MAP_SVG
} from '../assets'

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
          <img src={iconMeetup} alt="" className="my-group-bar__btn-icon" />
          <span>New meetup point</span>
        </button>
      </div>
    </div>
  )
}

function FriendMarkers({ members, visible, selectedFriendId, onFriendClick }) {
  if (!visible) return null

  const friends = members.filter(member => !member.isAdmin)

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

// ── Mock live data ────────────────────────────────────────────────────────────

const STAGE_PROGRAMS = {
  'VIDUNDERBLÅ': { now: 'Saveus',       next: 'Billie Marten' },
  'BIRKELUNDEN':  { now: 'Phlake',       next: 'Soleima' },
  'BYFESTEN':     { now: 'MØ',           next: 'Goss' },
  'DRAGONEN':     { now: 'Lukas Graham', next: null },
}

// ── Tag sub-components ────────────────────────────────────────────────────────

const PERSON_PATH = 'M3.5 0C2.12 0 1 1.12 1 2.5S2.12 5 3.5 5 6 3.88 6 2.5 4.88 0 3.5 0zm0 6C1.5 6 0 7.5 0 9v3h7V9C7 7.5 5.5 6 3.5 6z'

function QueueTag({ level }) {
  const bg = { short: 'var(--green)', medium: 'var(--orange)', long: 'var(--red)' }[level]
  return (
    <div className="queue-tag" style={{ background: bg }} aria-label={`${level} queue`}>
      {[0, 1, 2].map(i => (
        <svg key={i} className="queue-tag__person" width="7" height="12" viewBox="0 0 7 12" aria-hidden="true">
          <path d={PERSON_PATH} fill="white" />
        </svg>
      ))}
    </div>
  )
}

function ArtistTag({ now }) {
  return (
    <div className="artist-tag" aria-label={`Now playing: ${now}`}>
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
  'Double click where you want to create your meet up point.'

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

function StageItem({ bg, label, left, top, width, height, rotate, hidden = false, nowPlaying = null, highlighted = false }) {
  if (hidden) return null
  return (
    <div
      className="stage-item"
      style={{
        left, top, width, height, zIndex: 10,
        ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
      }}
    >
      {highlighted && nowPlaying && <ArtistTag now={nowPlaying} />}
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
  const lastMapClickRef = useRef(null)

  useEffect(() => {
    meetupModeRef.current = meetupMode
    if (meetupMode !== 'placing') {
      lastMapClickRef.current = null
    }
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

    const now = Date.now()
    const click = { time: now, x: e.clientX, y: e.clientY }
    const last = lastMapClickRef.current

    if (last && now - last.time < 500) {
      const distance = Math.hypot(click.x - last.x, click.y - last.y)
      if (distance < 40) {
        const rect = mapContainerRef.current.getBoundingClientRect()
        setPendingMeetupPosition({
          left: click.x - rect.left,
          top: click.y - rect.top,
        })
        setMeetupTime('')
        setMeetupMode('modal')
        lastMapClickRef.current = null
        return
      }
    }

    lastMapClickRef.current = click
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
        <img src={MAP_SVG} alt="Festival map" className="map-bg-layer" />

        {/* ── Stages ── */}
        <StageItem bg={stageBgVidunderbla} label="VIDUNDERBLÅ" left={221} top={89}  width={123} height={56}                   hidden={anyFilterActive && !activeFilters.stages} highlighted={anyFilterActive && activeFilters.stages} nowPlaying={STAGE_PROGRAMS['VIDUNDERBLÅ'].now} />
        <StageItem bg={stageBgBirkelunden} label="BIRKELUNDEN" left={-12} top={383} width={130} height={97}  rotate={23.46}  hidden={anyFilterActive && !activeFilters.stages} highlighted={anyFilterActive && activeFilters.stages} nowPlaying={STAGE_PROGRAMS['BIRKELUNDEN'].now} />
        <StageItem bg={stageBgByfesten}   label="BYFESTEN"    left={58}  top={560} width={105} height={80}                   hidden={anyFilterActive && !activeFilters.stages} highlighted={anyFilterActive && activeFilters.stages} nowPlaying={STAGE_PROGRAMS['BYFESTEN'].now} />
        <StageItem bg={stageBgDragonen}   label="DRAGONEN"    left={329} top={391} width={96}  height={59}  rotate={-12.69} hidden={anyFilterActive && !activeFilters.stages} highlighted={anyFilterActive && activeFilters.stages} nowPlaying={STAGE_PROGRAMS['DRAGONEN'].now} />

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
            onDoubleClick={e => {
              e.preventDefault()
              if (meetupModeRef.current !== 'placing' || !mapContainerRef.current) return
              const rect = mapContainerRef.current.getBoundingClientRect()
              setPendingMeetupPosition({
                left: e.clientX - rect.left,
                top: e.clientY - rect.top,
              })
              setMeetupTime('')
              setMeetupMode('modal')
              lastMapClickRef.current = null
            }}
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
