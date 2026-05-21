import './NavigationMenu.css'
import { NAV_HOME, NAV_PROGRAM, NAV_MAP, NAV_ARTISTER, NAV_MENU } from '../assets'

const TABS = [
  { id: 'start',    label: 'Start',    icon: NAV_HOME },
  { id: 'program',  label: 'Program',  icon: NAV_PROGRAM },
  { id: 'map',      label: 'Map',      icon: NAV_MAP },
  { id: 'artister', label: 'Artister', icon: NAV_ARTISTER },
  { id: 'menu',     label: 'Menu',     icon: NAV_MENU },
]

const NAV_BAR_PATH =
  'M44 13.5H0V94H430V0L390 7.5L279 4.5L229.5 10L134 4.5L44 13.5Z'

export default function NavigationMenu({ activeTab = 'map', onNavigate }) {
  return (
    <nav className="nav-menu" aria-label="Main navigation">
      <svg
        className="nav-menu__shape"
        viewBox="0 0 430 94"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={NAV_BAR_PATH} fill="var(--pink)" />
      </svg>
      <div className="nav-menu__tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${activeTab === tab.id ? ' nav-tab--active' : ''}`}
            onClick={() => onNavigate?.(tab.id)}
            aria-label={tab.label}
          >
            <img
              src={tab.icon}
              className="nav-tab__icon"
              alt=""
              aria-hidden="true"
            />
            <span className="nav-tab__label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
