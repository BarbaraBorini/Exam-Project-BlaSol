import { useState } from 'react'
import './App.css'
import LoadingScreen    from './screens/LoadingScreen'
import MapPage          from './screens/MapPage'
import CreateGroupScreen from './screens/CreateGroupScreen'
import MyGroupScreen    from './screens/MyGroupScreen'

const ROUTE_MAP = {
  start:          'map',
  program:        'map',
  map:            'map',
  artister:       'map',
  menu:           'map',
  'create-group': 'create-group',
  'my-group':     'my-group',
}

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [groupBannerExpanded, setGroupBannerExpanded] = useState(true)

  function handleNavigate(target) {
    setScreen(ROUTE_MAP[target] ?? target)
  }

  function handleJoinGroup() {
    setGroupBannerExpanded(false)
    handleNavigate('create-group')
  }

  return (
    <div className="phone-frame">
      {screen === 'loading'      && <LoadingScreen     onDone={() => setScreen('map')} />}
      {screen === 'map'          && (
        <MapPage
          onNavigate={handleNavigate}
          groupBannerExpanded={groupBannerExpanded}
          onGroupBannerExpandedChange={setGroupBannerExpanded}
          onJoinGroup={handleJoinGroup}
        />
      )}
      {screen === 'create-group' && <CreateGroupScreen onNavigate={handleNavigate} />}
      {screen === 'my-group'     && <MyGroupScreen     onNavigate={handleNavigate} />}
    </div>
  )
}
