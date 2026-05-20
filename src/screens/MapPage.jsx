import './MapPage.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'

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

// Figma CDN – stage banner backgrounds only
import {
  ICON_FILTER, ICON_BANNER_GROUP, ICON_CHEVRON_DOWN,
  STAGE_BIRKELUNDEN, STAGE_BYFESTEN,
  STAGE_VIDUNDERBLA, STAGE_DRAGONEN,
} from '../assets'

// ── Sub-components ────────────────────────────────────────────────────────────

const GROUP_BANNER_DESCRIPTION =
  'When you and your friends join a group, you are able to see each other\u2019s location on the map and set a meetup point for the group.'

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
  groupBannerExpanded,
  onGroupBannerExpandedChange,
  onJoinGroup,
}) {
  return (
    <div className="screen map-screen">
      <StatusBar />

      <div className="map-container">
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
        <StageItem bg={STAGE_VIDUNDERBLA} label="VIDUNDERBLÅ" left={221} top={89}  width={123} height={56} />
        <StageItem bg={STAGE_BIRKELUNDEN} label="BIRKELUNDEN" left={-12} top={383} width={130} height={97}  rotate={23.46} />
        <StageItem bg={STAGE_BYFESTEN}   label="BYFESTEN"    left={58}  top={560} width={105} height={80} />
        <StageItem bg={STAGE_DRAGONEN}   label="DRAGONEN"    left={329} top={391} width={96}  height={59}  rotate={-12.69} />

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
      </div>

      <div className="map-overlays">
        <GroupBanner
          expanded={groupBannerExpanded}
          onExpandedChange={onGroupBannerExpandedChange}
          onJoin={onJoinGroup}
        />
        <div className="map-filter-bar">
          <FilterBar />
        </div>
      </div>

      <NavigationMenu activeTab="map" onNavigate={onNavigate} />
    </div>
  )
}
