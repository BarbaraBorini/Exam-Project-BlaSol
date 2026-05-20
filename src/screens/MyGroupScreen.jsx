import './MyGroupScreen.css'
import StatusBar from '../components/StatusBar'
import NavigationMenu from '../components/NavigationMenu'
import {
  BACK_ARROW, ICON_EDIT, ICON_COPY,
  AVATAR_ADMIN, AVATAR_MEMBER,
  ICON_LEAVE, ICON_DELETE, ICON_ADD,
} from '../assets'

const GROUP_MEMBERS = [
  { id: 1, name: 'Mette', email: 'mette.s@gmail.com',   isAdmin: true,  avatar: AVATAR_ADMIN  },
  { id: 2, name: 'Stinne', email: 'stinne.s@gmail.com', isAdmin: false, avatar: AVATAR_MEMBER },
  { id: 3, name: 'Sofie',  email: 'sofie.123@gmail.com', isAdmin: false, avatar: AVATAR_MEMBER },
  { id: 4, name: 'Maria',  email: 'maria.gz3@gmail.com', isAdmin: false, avatar: AVATAR_MEMBER },
]

function MemberCard({ member }) {
  return (
    <div className={`member-card ${member.isAdmin ? 'member-card--admin' : 'member-card--member'}`}>
      <div className="member-card__info">
        <img src={member.avatar} alt="" className="member-card__avatar" />
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
        <img src={ICON_DELETE} alt="Remove member" className="member-card__delete-icon" />
      )}
    </div>
  )
}

export default function MyGroupScreen({ onNavigate }) {
  return (
    <div className="screen my-group-screen">
      <StatusBar />

      <div className="my-group__content">
        <button
          className="back-arrow"
          onClick={() => onNavigate('map')}
          aria-label="Go back"
        >
          <img src={BACK_ARROW} alt="" className="back-arrow__img" />
        </button>

        <div className="my-group__header">
          <h1 className="my-group__title">My Group</h1>
          <img src={ICON_EDIT} alt="Edit group name" className="my-group__edit-icon" />
        </div>

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

        <div className="members-section">
          <span className="section-label">Group members</span>

          {GROUP_MEMBERS.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}

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
