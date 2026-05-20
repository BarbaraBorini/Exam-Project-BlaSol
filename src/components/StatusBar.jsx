import './StatusBar.css'
import { ICON_SIGNAL, ICON_WIFI, ICON_BATTERY } from '../assets'

export default function StatusBar() {
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
