import { useState, useRef, useEffect } from 'react'
import './MapPage.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'
import { formatMemberList } from '../groupUtils'
import iconGroup from '../assets/group.svg'
import iconArrowRight from '../assets/arrow-right.svg'
import iconEyeOpen from '../assets/eye_open.svg'
import iconEyeClosed from '../assets/eye-closed.svg'
import iconMeetup from '../assets/meetup-point.svg'
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
  ICON_FILTER, ICON_BANNER_GROUP, ICON_CHEVRON_DOWN,
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
          <img src={iconArrowRight} alt="" className="my-group-bar__arrow" />
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

function FriendMarkers({ members, visible }) {
  if (!visible) return null

  const friends = members.filter(member => !member.isAdmin)

  return friends.map((member, index) => {
    const position = FRIEND_MARKER_POSITIONS[index % FRIEND_MARKER_POSITIONS.length]
    const initial = member.name.charAt(0).toUpperCase()

    return (
      <div
        key={member.id}
        className="friend-marker"
        style={{ left: position.left, top: position.top }}
      >
        <span className="friend-marker__label">{initial}</span>
      </div>
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

function FilterBar() {
  return (
    <div className="filter-bar">
      <div className="filter-bar__label">
        <img src={ICON_FILTER} alt="" className="filter-bar__filter-icon" />
        <span className="filter-bar__filter-text">Filter</span>
      </div>
      <button className="filter-pill"><span className="filter-pill__text">Scener</span></button>
      <button className="filter-pill"><span className="filter-pill__text">Toiletter</span></button>
      <button className="filter-pill"><span className="filter-pill__text">Barer</span></button>
    </div>
  )
}

function MapItem({ type, icon, label, left, top, multiLine = false }) {
  return (
    <div className={`map-item map-item--${type}`} style={{ left, top, zIndex: 11 }}>
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

function StageItem({ bg, label, left, top, width, height, rotate }) {
  return (
    <div
      className="stage-item"
      style={{
        left, top, width, height, zIndex: 10,
        ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
      }}
    >
      <img src={bg} alt="" className="stage-item__bg" />
      <div className="stage-item__content">
        <img src={iconStage} alt="" className="stage-item__icon" />
        <span className="stage-item__label">{label}</span>
      </div>
    </div>
  )
}

// ── Map Page ──────────────────────────────────────────────────────────────────

export default function MapPage({
  onNavigate,
  group,
  hasCreatedGroup,
  groupBannerExpanded,
  onGroupBannerExpandedChange,
  onJoinGroup,
}) {
  const [friendsVisible, setFriendsVisible] = useState(true)
  const [meetupMode, setMeetupMode] = useState(null)
  const [pendingMeetupPosition, setPendingMeetupPosition] = useState(null)
  const [meetupPoint, setMeetupPoint] = useState(null)
  const [meetupTime, setMeetupTime] = useState('')
  const [meetupTimeVisible, setMeetupTimeVisible] = useState(false)
  const mapContainerRef = useRef(null)
  const meetupModeRef = useRef(meetupMode)
  const lastMapClickRef = useRef(null)

  useEffect(() => {
    meetupModeRef.current = meetupMode
    if (meetupMode !== 'placing') {
      lastMapClickRef.current = null
    }
  }, [meetupMode])

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
        <StageItem bg={stageBgVidunderbla} label="VIDUNDERBLÅ" left={221} top={89}  width={123} height={56} />
        <StageItem bg={stageBgBirkelunden} label="BIRKELUNDEN" left={-12} top={383} width={130} height={97}  rotate={23.46} />
        <StageItem bg={stageBgByfesten}   label="BYFESTEN"    left={58}  top={560} width={105} height={80} />
        <StageItem bg={stageBgDragonen}   label="DRAGONEN"    left={329} top={391} width={96}  height={59}  rotate={-12.69} />

        {/* ── Bars ── */}
        <MapItem type="bar" icon={iconBar} label="BAR"            left={226} top={278} />
        <MapItem type="bar" icon={iconBar} label="BAR"            left={169} top={103} />
        <MapItem type="bar" icon={iconBar} label="BAR"            left={82}  top={316} />
        <MapItem type="bar" icon={iconBar} label="BAR"            left={123} top={510} />
        <MapItem type="bar" icon={iconBlasolBar} label={'BLÅ SOL\nBAR'} left={206} top={546} multiLine />

        {/* ── Toilets ── */}
        <MapItem type="wc" icon={iconWC} label="WC" left={16}  top={173} />
        <MapItem type="wc" icon={iconWC} label="WC" left={204} top={228} />
        <MapItem type="wc" icon={iconWC} label="WC" left={101} top={655} />
        <MapItem type="wc" icon={iconWC} label="WC" left={353} top={323} />

        {/* ── Other ── */}
        <MapItem type="merch" icon={iconMerch} label="MERCH"           left={253} top={338} />
        <MapItem type="vand"  icon={iconVand}  label="VAND"            left={164} top={155} />
        <MapItem type="food"  icon={iconFood}  label={'SPISE\nOMRÅDE'} left={278} top={484} multiLine />

        {hasCreatedGroup && group && (
          <FriendMarkers members={group.members} visible={friendsVisible} />
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
          <FilterBar />
        </div>
        {meetupMode === 'placing' && <MeetupHint />}
      </div>

      <NavigationMenu activeTab="map" onNavigate={onNavigate} />
    </div>
  )
}
