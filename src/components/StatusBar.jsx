import './StatusBar.css'
import { STATUS_ICONS } from '../assets'

export default function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-bar__time">12:03</span>
      <img src={STATUS_ICONS} alt="" className="status-bar__icons" />
    </div>
  )
}
