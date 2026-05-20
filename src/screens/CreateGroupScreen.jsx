import './CreateGroupScreen.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'
import { BACK_ARROW, BTN_CREATE_BG, BTN_JOIN_BG } from '../assets'

export default function CreateGroupScreen({ onNavigate }) {
  return (
    <div className="screen create-group-screen">
      <StatusBar />

      <div className="create-group__content">
        <button
          className="back-arrow"
          onClick={() => onNavigate('map')}
          aria-label="Go back"
        >
          <img src={BACK_ARROW} alt="" className="back-arrow__img" />
        </button>

        <h1 className="create-group__title">
          Create a group or join an existing one
        </h1>

        <p className="create-group__subtitle">
          You and your friends will be able to see each other's location on the
          map and set a meetup point for the group.
        </p>

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
