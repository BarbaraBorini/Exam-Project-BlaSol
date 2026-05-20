import './MapPage.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'
import {
  MAP_BASE, MAP_OVERLAY, MAP_PATHS, MAP_PATHS2,
  ICON_FILTER, ICON_BANNER_GROUP, ICON_CHEVRON_DOWN,
  MAP_ICON_BAR, MAP_ICON_WC, MAP_ICON_MERCH,
  MAP_ICON_VAND, MAP_ICON_STAGE, MAP_ICON_FOOD,
  STAGE_BIRKELUNDEN, STAGE_BYFESTEN,
  STAGE_VIDUNDERBLA, STAGE_DRAGONEN,
} from '../assets'

// ── Sub-components ────────────────────────────────────────────────────────────

function GroupBanner({ onJoin }) {
  return (
    <div className="group-banner">
      <button className="group-banner__join-btn" onClick={onJoin}>
        <img src={ICON_BANNER_GROUP} alt="" className="group-banner__people-icon" />
        <span className="group-banner__text">Join or create group</span>
      </button>
      <div className="group-banner__chevron">
        <img src={ICON_CHEVRON_DOWN} alt="" className="group-banner__chevron-icon" />
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
        <img src={MAP_ICON_STAGE} alt="" className="stage-item__icon" />
        <span className="stage-item__label">{label}</span>
      </div>
    </div>
  )
}

// ── Map Page ──────────────────────────────────────────────────────────────────

export default function MapPage({ onNavigate }) {
  return (
    <div className="screen map-screen">
      <StatusBar />

      <div className="map-section-header">
        <GroupBanner onJoin={() => onNavigate('create-group')} />
        <FilterBar />
      </div>

      <div className="map-container">
        {/* Base layers */}
        <img src={MAP_BASE}    alt="Festival map" className="map-bg-layer" style={{ zIndex: 0 }} />
        <img src={MAP_OVERLAY} alt=""             className="map-bg-layer" style={{ zIndex: 1 }} />
        <img src={MAP_PATHS2}  alt=""             className="map-bg-layer" style={{ zIndex: 2, opacity: 0.8 }} />
        <img src={MAP_PATHS}   alt=""             className="map-bg-layer" style={{ zIndex: 3, opacity: 0.6 }} />

        {/* Stages */}
        <StageItem bg={STAGE_VIDUNDERBLA} label="VIDUNDERBLÅ" left={221} top={89}  width={123} height={56} />
        <StageItem bg={STAGE_BIRKELUNDEN} label="BIRKELUNDEN" left={-12} top={383} width={130} height={97}  rotate={23.46} />
        <StageItem bg={STAGE_BYFESTEN}   label="BYFESTEN"    left={58}  top={560} width={105} height={80} />
        <StageItem bg={STAGE_DRAGONEN}   label="DRAGONEN"    left={329} top={391} width={96}  height={59}  rotate={-12.69} />

        {/* Bars */}
        <MapItem type="bar" icon={MAP_ICON_BAR} label="BAR" left={226} top={278} />
        <MapItem type="bar" icon={MAP_ICON_BAR} label="BAR" left={169} top={103} />
        <MapItem type="bar" icon={MAP_ICON_BAR} label="BAR" left={82}  top={316} />
        <MapItem type="bar" icon={MAP_ICON_BAR} label="BAR" left={123} top={510} />
        <MapItem type="bar" icon={MAP_ICON_BAR} label={'BLÅ SOL\nBAR'} left={206} top={546} multiLine />

        {/* Toilets */}
        <MapItem type="wc" icon={MAP_ICON_WC} label="WC" left={16}  top={173} />
        <MapItem type="wc" icon={MAP_ICON_WC} label="WC" left={204} top={228} />
        <MapItem type="wc" icon={MAP_ICON_WC} label="WC" left={101} top={655} />
        <MapItem type="wc" icon={MAP_ICON_WC} label="WC" left={353} top={323} />

        {/* Other */}
        <MapItem type="merch" icon={MAP_ICON_MERCH} label="MERCH"             left={253} top={338} />
        <MapItem type="vand"  icon={MAP_ICON_VAND}  label="VAND"              left={164} top={155} />
        <MapItem type="food"  icon={MAP_ICON_FOOD}  label={'SPISE\nOMRÅDE'}   left={278} top={484} multiLine />

        {/* User location */}
        <div className="you-marker" style={{ left: 215, top: 200, zIndex: 12 }}>You</div>
      </div>

      <NavigationMenu activeTab="map" onNavigate={onNavigate} />
    </div>
  )
}
