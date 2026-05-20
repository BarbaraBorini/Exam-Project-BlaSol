import './NavigationMenu.css'
import { NAV_HOME, NAV_PROGRAM, NAV_MAP, NAV_ARTISTER, NAV_MENU } from '../assets'

const TABS = [
  { id: 'start',    label: 'Start',    icon: NAV_HOME },
  { id: 'program',  label: 'Program',  icon: NAV_PROGRAM },
  { id: 'map',      label: 'Map',      icon: NAV_MAP },
  { id: 'artister', label: 'Artister', icon: NAV_ARTISTER },
  { id: 'menu',     label: 'Menu',     icon: NAV_MENU },
]

export default function NavigationMenu({ activeTab = 'map', onNavigate }) {
  return (
    <nav className="nav-menu">
      <div className="nav-menu__tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${activeTab === tab.id ? ' nav-tab--active' : ''}`}
            onClick={() => onNavigate?.(tab.id)}
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
