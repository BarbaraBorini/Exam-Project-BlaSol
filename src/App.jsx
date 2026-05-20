import { useState, useEffect } from 'react'
import './App.css'

/* ──────────────────────────────────────────────
   FIGMA ASSET URLS  (expire after 7 days)
   ────────────────────────────────────────────── */

// Status bar icons (shared across all screens – from Loading screen export)
const ICON_SIGNAL  = 'https://www.figma.com/api/mcp/asset/47ec0461-fca4-4001-8edf-672961389633'
const ICON_WIFI    = 'https://www.figma.com/api/mcp/asset/bdc48cb5-63ce-4d7d-bfc2-6e7049a284a6'
const ICON_BATTERY = 'https://www.figma.com/api/mcp/asset/8c4f777a-8920-45d0-85ea-07bfe6da1f53'

// Navigation tab icons (no separate background image – nav uses CSS)
const NAV_HOME     = 'https://www.figma.com/api/mcp/asset/f8d69d7f-1710-4ef6-bda3-e91380431f24'
const NAV_PROGRAM  = 'https://www.figma.com/api/mcp/asset/3993ac21-263d-4b24-bdab-6a3005ccb7ca'
const NAV_MAP      = 'https://www.figma.com/api/mcp/asset/79bda032-de7e-4c95-8b17-c45d8a71ee0c'
const NAV_ARTISTER = 'https://www.figma.com/api/mcp/asset/e6e1979d-9276-4b78-80ee-eb42d17240bd'
const NAV_MENU     = 'https://www.figma.com/api/mcp/asset/a3d0583a-e625-4bf8-ad2d-3cac6c1a7df6'

// Loading screen
const LOGO         = 'https://www.figma.com/api/mcp/asset/ac4dff9c-36f7-4719-9df0-e0ad32901c67'

// Create Group screen
const BACK_ARROW        = 'https://www.figma.com/api/mcp/asset/4d796188-123e-484c-ad70-41337f764009'
const BTN_CREATE_BG     = 'https://www.figma.com/api/mcp/asset/e9bb3cfb-ba46-483f-a526-0e542554ae4c'
const BTN_JOIN_BG       = 'https://www.figma.com/api/mcp/asset/f196e89d-f4be-4f3d-a41a-041f31f124b3'

// My Group screen
const ICON_EDIT         = 'https://www.figma.com/api/mcp/asset/85b3d4b6-ba27-4237-8dae-f94b05618b89'
const ICON_COPY         = 'https://www.figma.com/api/mcp/asset/32f44e1e-5c4f-402c-8832-55028a207975'
const AVATAR_ADMIN      = 'https://www.figma.com/api/mcp/asset/cc4adce5-796b-446e-9c5e-78eee9970c0f'
const AVATAR_MEMBER     = 'https://www.figma.com/api/mcp/asset/0443ee1d-df75-4c21-a8e9-f913a6e67ef9'
const ICON_LEAVE        = 'https://www.figma.com/api/mcp/asset/f610e0d6-ee7b-47e7-b56e-de2dd4651408'
const ICON_DELETE       = 'https://www.figma.com/api/mcp/asset/b50f4440-346c-4819-934d-548f7bf20e82'
const ICON_ADD          = 'https://www.figma.com/api/mcp/asset/2decccbd-c3ba-4911-ac8b-bdbbc65e238c'

// Map page
const MAP_BASE          = 'https://www.figma.com/api/mcp/asset/d5b89d7c-5de6-4d86-b1e6-4c34e89c6b78'
const MAP_OVERLAY       = 'https://www.figma.com/api/mcp/asset/bd9569cc-4c2e-4a0f-bbb4-02bc62ba00de'
const MAP_PATHS         = 'https://www.figma.com/api/mcp/asset/9a49c2c6-2aee-4944-9c6f-81f8a85cae04'
const MAP_PATHS2        = 'https://www.figma.com/api/mcp/asset/714b6466-7eba-490a-99c5-2f62112e5495'
const ICON_FILTER       = 'https://www.figma.com/api/mcp/asset/52cd29ce-c00b-474d-8c84-44c430c063ea'
const ICON_BANNER_GROUP = 'https://www.figma.com/api/mcp/asset/4535003c-613b-46b2-aa88-62c0868e27ce'
const ICON_CHEVRON_DOWN = 'https://www.figma.com/api/mcp/asset/53a10818-cda8-4d2c-8296-97b6d30a6046'

// Map item icons
const MAP_ICON_BAR    = 'https://www.figma.com/api/mcp/asset/5efaf569-71ae-4369-a453-c7143695b194'
const MAP_ICON_WC     = 'https://www.figma.com/api/mcp/asset/ca1ac45d-3a76-4158-a9c3-8ae29a13d367'
const MAP_ICON_MERCH  = 'https://www.figma.com/api/mcp/asset/b3dea3a7-407b-48d1-8d6f-581bd06cfd08'
const MAP_ICON_VAND   = 'https://www.figma.com/api/mcp/asset/92d126fa-ca30-4105-a48b-1fcb86a8728a'
const MAP_ICON_STAGE  = 'https://www.figma.com/api/mcp/asset/b1662078-6521-4c2a-b803-cc824eb9ae28'
const MAP_ICON_FOOD   = 'https://www.figma.com/api/mcp/asset/4535003c-613b-46b2-aa88-62c0868e27ce'

// Stage backgrounds
const STAGE_BIRKELUNDEN = 'https://www.figma.com/api/mcp/asset/807406a6-0b46-4676-b973-3cd9fde6c233'
const STAGE_BYFESTEN    = 'https://www.figma.com/api/mcp/asset/2810a967-8c8a-46b5-b973-82621de1404b'
const STAGE_VIDUNDERBLA = 'https://www.figma.com/api/mcp/asset/674dda06-047b-4bc5-83f2-64a155bcb49a'
const STAGE_DRAGONEN    = 'https://www.figma.com/api/mcp/asset/1671e867-c4be-4ce5-ae33-b5608a2af687'


/* ──────────────────────────────────────────────
   SHARED COMPONENTS
   ────────────────────────────────────────────── */

function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-bar__time">12:03</span>
      <div className="status-bar__icons">
        <img src={ICON_SIGNAL}  alt="" className="status-bar__icon" />
        <img src={ICON_WIFI}    alt="" className="status-bar__icon" />
        <img src={ICON_BATTERY} alt="" className="status-bar__battery" />
      </div>
    </div>
  )
}

const NAV_TABS = [
  { id: 'start',    label: 'Start',    icon: NAV_HOME },
  { id: 'program',  label: 'Program',  icon: NAV_PROGRAM },
  { id: 'map',      label: 'Map',      icon: NAV_MAP },
  { id: 'artister', label: 'Artister', icon: NAV_ARTISTER },
  { id: 'menu',     label: 'Menu',     icon: NAV_MENU },
]

function NavigationMenu({ activeTab = 'map', onNavigate }) {
  return (
    <nav className="nav-menu">
      {/* Wave SVG drawn in CSS via ::before – no external image needed */}
      <div className="nav-menu__tabs">
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${activeTab === tab.id ? ' nav-tab--active' : ''}`}
            onClick={() => onNavigate && onNavigate(tab.id)}
            aria-label={tab.label}
          >
            <img src={tab.icon} alt="" className="nav-tab__icon" />
            <span className="nav-tab__label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}


/* ──────────────────────────────────────────────
   LOADING SCREEN
   ────────────────────────────────────────────── */

function LoadingScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="screen loading-screen">
      <StatusBar />
      <img src={LOGO} alt="Blå Sol logo" className="loading-screen__logo" />
    </div>
  )
}


/* ──────────────────────────────────────────────
   CREATE GROUP SCREEN
   ────────────────────────────────────────────── */

function CreateGroupScreen({ onNavigate }) {
  return (
    <div className="screen create-group-screen">
      <StatusBar />

      <div className="create-group__content">
        {/* Back arrow */}
        <button className="back-arrow" onClick={() => onNavigate('map')} aria-label="Go back">
          <img src={BACK_ARROW} alt="" className="back-arrow__img" />
        </button>

        {/* Title */}
        <h1 className="create-group__title">
          Create a group or join an existing one
        </h1>

        {/* Subtitle */}
        <p className="create-group__subtitle">
          You and your friends will be able to see each other's location on the
          map and set a meetup point for the group.
        </p>

        {/* Buttons */}
        <div className="join-create-buttons">
          <button
            className="hex-button hex-button--primary"
            onClick={() => onNavigate('my-group')}
          >
            <img src={BTN_CREATE_BG} alt="" className="hex-button__bg" />
            <span className="hex-button__label">Create a new group</span>
          </button>

          <button
            className="hex-button hex-button--secondary"
            onClick={() => onNavigate('my-group')}
          >
            <img src={BTN_JOIN_BG} alt="" className="hex-button__bg" />
            <span className="hex-button__label">Join existing group</span>
          </button>
        </div>
      </div>

      <NavigationMenu activeTab="map" onNavigate={onNavigate} />
    </div>
  )
}


/* ──────────────────────────────────────────────
   MY GROUP SCREEN
   ────────────────────────────────────────────── */

const GROUP_MEMBERS = [
  {
    id: 1,
    name: 'Mette',
    email: 'mette.s@gmail.com',
    isAdmin: true,
    avatar: AVATAR_ADMIN,
  },
  {
    id: 2,
    name: 'Stinne',
    email: 'stinne.s@gmail.com',
    isAdmin: false,
    avatar: AVATAR_MEMBER,
  },
  {
    id: 3,
    name: 'Sofie',
    email: 'sofie.123@gmail.com',
    isAdmin: false,
    avatar: AVATAR_MEMBER,
  },
  {
    id: 4,
    name: 'Maria',
    email: 'maria.gz3@gmail.com',
    isAdmin: false,
    avatar: AVATAR_MEMBER,
  },
]

function MyGroupScreen({ onNavigate }) {
  return (
    <div className="screen my-group-screen">
      <StatusBar />

      <div className="my-group__content">
        {/* Back arrow */}
        <button className="back-arrow" onClick={() => onNavigate('map')} aria-label="Go back">
          <img src={BACK_ARROW} alt="" className="back-arrow__img" />
        </button>

        {/* Header */}
        <div className="my-group__header">
          <h1 className="my-group__title">My Group</h1>
          <img src={ICON_EDIT} alt="Edit group name" className="my-group__edit-icon" />
        </div>

        {/* Invitation Code */}
        <div className="invitation-section">
          <span className="section-label">Invitation code</span>
          <div className="invitation-code-box">
            <span className="invitation-code-box__code">ABC123</span>
            <button
              className="invitation-code-box__copy"
              onClick={() => navigator.clipboard?.writeText('ABC123')}
              aria-label="Copy invitation code"
            >
              <img src={ICON_COPY} alt="" className="invitation-code-box__copy-icon" />
            </button>
          </div>
        </div>

        {/* Group Members */}
        <div className="members-section">
          <span className="section-label">Group members</span>

          {GROUP_MEMBERS.map(member => (
            <div
              key={member.id}
              className={`member-card ${member.isAdmin ? 'member-card--admin' : 'member-card--member'}`}
            >
              <div className="member-card__info">
                <img
                  src={member.avatar}
                  alt=""
                  className="member-card__avatar"
                />
                <div className="member-card__details">
                  <span className="member-card__name">{member.name}</span>
                  <span className="member-card__email">{member.email}</span>
                </div>
              </div>

              {member.isAdmin ? (
                <>
                  <span className="member-card__admin-badge">ADMIN</span>
                  <button className="member-card__action" aria-label="Leave group">
                    <img src={ICON_LEAVE} alt="" className="member-card__action-icon" />
                  </button>
                </>
              ) : (
                <img
                  src={ICON_DELETE}
                  alt="Remove member"
                  className="member-card__delete-icon"
                />
              )}
            </div>
          ))}

          {/* Add More */}
          <button className="add-more-btn">
            <img src={ICON_ADD} alt="" className="add-more-btn__icon" />
            <span className="add-more-btn__label">Add more</span>
          </button>
        </div>
      </div>

      <NavigationMenu activeTab="map" onNavigate={onNavigate} />
    </div>
  )
}


/* ──────────────────────────────────────────────
   MAP PAGE
   ────────────────────────────────────────────── */

function MapPage({ onNavigate }) {
  return (
    <div className="screen map-screen">
      <StatusBar />

      {/* Top section: Group Banner + Filter Bar */}
      <div className="map-section-header">
        <div className="group-banner">
          <button
            className="group-banner__join-btn"
            onClick={() => onNavigate('create-group')}
          >
            <img src={ICON_BANNER_GROUP} alt="" className="group-banner__people-icon" />
            <span className="group-banner__text">Join or create group</span>
          </button>
          <div className="group-banner__chevron">
            <img src={ICON_CHEVRON_DOWN} alt="" className="group-banner__chevron-icon" />
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-bar__label">
            <img src={ICON_FILTER} alt="" className="filter-bar__filter-icon" />
            <span className="filter-bar__filter-text">Filter</span>
          </div>
          <button className="filter-pill"><span className="filter-pill__text">Scener</span></button>
          <button className="filter-pill"><span className="filter-pill__text">Toiletter</span></button>
          <button className="filter-pill"><span className="filter-pill__text">Barer</span></button>
        </div>
      </div>

      {/* MAP */}
      <div className="map-container">
        {/* Base map layers */}
        <img src={MAP_BASE}    alt="Festival map" className="map-bg-layer" style={{ zIndex: 0 }} />
        <img src={MAP_OVERLAY} alt=""             className="map-bg-layer" style={{ zIndex: 1 }} />
        <img src={MAP_PATHS2}  alt=""             className="map-bg-layer" style={{ zIndex: 2, opacity: 0.8 }} />
        <img src={MAP_PATHS}   alt=""             className="map-bg-layer" style={{ zIndex: 3, opacity: 0.6 }} />

        {/* ── Stage Items ── */}
        {/* VIDUNDERBLÅ */}
        <div className="stage-item" style={{ left: 221, top: 89, width: 123, height: 56, zIndex: 10 }}>
          <img src={STAGE_VIDUNDERBLA} alt="" className="stage-item__bg" />
          <div className="stage-item__content">
            <img src={MAP_ICON_STAGE} alt="" className="stage-item__icon" />
            <span className="stage-item__label">VIDUNDERBLÅ</span>
          </div>
        </div>

        {/* BIRKELUNDEN */}
        <div
          className="stage-item"
          style={{
            left: -12, top: 383, width: 130, height: 97,
            transform: 'rotate(23.46deg)', zIndex: 10,
          }}
        >
          <img src={STAGE_BIRKELUNDEN} alt="" className="stage-item__bg" />
          <div className="stage-item__content">
            <img src={MAP_ICON_STAGE} alt="" className="stage-item__icon" />
            <span className="stage-item__label">BIRKELUNDEN</span>
          </div>
        </div>

        {/* BYFESTEN */}
        <div className="stage-item" style={{ left: 58, top: 560, width: 105, height: 80, zIndex: 10 }}>
          <img src={STAGE_BYFESTEN} alt="" className="stage-item__bg" />
          <div className="stage-item__content">
            <img src={MAP_ICON_STAGE} alt="" className="stage-item__icon" />
            <span className="stage-item__label">BYFESTEN</span>
          </div>
        </div>

        {/* DRAGONEN */}
        <div
          className="stage-item"
          style={{
            left: 329, top: 391, width: 96, height: 59,
            transform: 'rotate(-12.69deg)', zIndex: 10,
          }}
        >
          <img src={STAGE_DRAGONEN} alt="" className="stage-item__bg" />
          <div className="stage-item__content">
            <img src={MAP_ICON_STAGE} alt="" className="stage-item__icon" />
            <span className="stage-item__label">DRAGONEN</span>
          </div>
        </div>

        {/* ── BAR items ── */}
        <div className="map-item map-item--bar" style={{ left: 226, top: 278, zIndex: 11 }}>
          <img src={MAP_ICON_BAR} alt="" className="map-item__icon" />
          <span className="map-item__label">BAR</span>
        </div>
        <div className="map-item map-item--bar" style={{ left: 169, top: 103, zIndex: 11 }}>
          <img src={MAP_ICON_BAR} alt="" className="map-item__icon" />
          <span className="map-item__label">BAR</span>
        </div>
        <div className="map-item map-item--bar" style={{ left: 82, top: 316, zIndex: 11 }}>
          <img src={MAP_ICON_BAR} alt="" className="map-item__icon" />
          <span className="map-item__label">BAR</span>
        </div>
        <div className="map-item map-item--bar" style={{ left: 123, top: 510, zIndex: 11 }}>
          <img src={MAP_ICON_BAR} alt="" className="map-item__icon" />
          <span className="map-item__label">BAR</span>
        </div>

        {/* BLÅ SOL BAR */}
        <div className="map-item map-item--bar" style={{ left: 206, top: 546, zIndex: 11 }}>
          <img src={MAP_ICON_BAR} alt="" className="map-item__icon" />
          <span className="map-item__label" style={{ whiteSpace: 'pre-line' }}>{'BLÅ SOL\nBAR'}</span>
        </div>

        {/* SPISE OMRÅDE */}
        <div className="map-item map-item--food" style={{ left: 278, top: 484, zIndex: 11 }}>
          <img src={MAP_ICON_FOOD} alt="" className="map-item__icon" />
          <span className="map-item__label" style={{ whiteSpace: 'pre-line' }}>{'SPISE\nOMRÅDE'}</span>
        </div>

        {/* ── WC items ── */}
        <div className="map-item map-item--wc" style={{ left: 16, top: 173, zIndex: 11 }}>
          <img src={MAP_ICON_WC} alt="" className="map-item__icon" />
          <span className="map-item__label">WC</span>
        </div>
        <div className="map-item map-item--wc" style={{ left: 204, top: 228, zIndex: 11 }}>
          <img src={MAP_ICON_WC} alt="" className="map-item__icon" />
          <span className="map-item__label">WC</span>
        </div>
        <div className="map-item map-item--wc" style={{ left: 101, top: 655, zIndex: 11 }}>
          <img src={MAP_ICON_WC} alt="" className="map-item__icon" />
          <span className="map-item__label">WC</span>
        </div>
        <div className="map-item map-item--wc" style={{ left: 353, top: 323, zIndex: 11 }}>
          <img src={MAP_ICON_WC} alt="" className="map-item__icon" />
          <span className="map-item__label">WC</span>
        </div>

        {/* ── MERCH ── */}
        <div className="map-item map-item--merch" style={{ left: 253, top: 338, zIndex: 11 }}>
          <img src={MAP_ICON_MERCH} alt="" className="map-item__icon" />
          <span className="map-item__label">MERCH</span>
        </div>

        {/* ── VAND ── */}
        <div className="map-item map-item--vand" style={{ left: 164, top: 155, zIndex: 11 }}>
          <img src={MAP_ICON_VAND} alt="" className="map-item__icon" />
          <span className="map-item__label">VAND</span>
        </div>

        {/* ── YOU (user's own location) ── */}
        <div
          className="you-marker"
          style={{ left: 215, top: 200, zIndex: 12 }}
        >
          You
        </div>
      </div>

      <NavigationMenu activeTab="map" onNavigate={onNavigate} />
    </div>
  )
}


/* ──────────────────────────────────────────────
   ROOT APP COMPONENT
   ────────────────────────────────────────────── */

export default function App() {
  const [screen, setScreen] = useState('loading')

  function handleNavigate(target) {
    const routeMap = {
      start:          'map',
      program:        'map',
      map:            'map',
      artister:       'map',
      menu:           'map',
      'create-group': 'create-group',
      'my-group':     'my-group',
    }
    setScreen(routeMap[target] ?? target)
  }

  return (
    <div className="phone-frame">
      {screen === 'loading'       && <LoadingScreen    onDone={() => setScreen('map')} />}
      {screen === 'map'           && <MapPage          onNavigate={handleNavigate} />}
      {screen === 'create-group'  && <CreateGroupScreen onNavigate={handleNavigate} />}
      {screen === 'my-group'      && <MyGroupScreen    onNavigate={handleNavigate} />}
    </div>
  )
}
