import { useState, useEffect } from 'react'
import './App.css'
import LoadingScreen    from './screens/LoadingScreen'
import MapPage          from './screens/MapPage'
import CreateGroupScreen from './screens/CreateGroupScreen'
import MyGroupScreen    from './screens/MyGroupScreen'
import { createGroupFromForm, isEmailInMembers, nameFromEmail } from './groupUtils'
import { loadGroupState, saveGroupState, joinGroupFromInviteCode } from './groupStorage'

const savedGroupState = loadGroupState()

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
  const [groupBannerExpanded, setGroupBannerExpanded] = useState(
    savedGroupState.groupBannerExpanded,
  )
  const [group, setGroup] = useState(savedGroupState.group)
  const [hasCreatedGroup, setHasCreatedGroup] = useState(savedGroupState.hasCreatedGroup)

  useEffect(() => {
    saveGroupState({ group, hasCreatedGroup, groupBannerExpanded })
  }, [group, hasCreatedGroup, groupBannerExpanded])

  function handleNavigate(target) {
    setScreen(ROUTE_MAP[target] ?? target)
  }

  function handleJoinGroup() {
    setGroupBannerExpanded(false)
    handleNavigate('create-group')
  }

  function handleCreateGroup(groupName, emails) {
    setGroup(createGroupFromForm(groupName, emails))
    setHasCreatedGroup(true)
    setGroupBannerExpanded(false)
    handleNavigate('my-group')
  }

  function handleJoinWithCode(inviteCode) {
    const result = joinGroupFromInviteCode(inviteCode)
    if (!result.ok) return result

    setGroup(result.group)
    setHasCreatedGroup(true)
    setGroupBannerExpanded(false)
    handleNavigate('my-group')
    return { ok: true }
  }

  function handleGroupNameChange(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    setGroup(prev => ({ ...prev, name: trimmed }))
  }

  function handleAddMember(email) {
    const trimmed = email.trim()
    if (!trimmed) return
    setGroup(prev => {
      if (isEmailInMembers(trimmed, prev.members)) return prev
      return {
        ...prev,
        members: [
          ...prev.members,
          {
            id: Date.now(),
            name: nameFromEmail(trimmed),
            email: trimmed,
            isAdmin: false,
          },
        ],
      }
    })
  }

  function handleRemoveMember(memberId) {
    setGroup(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId),
    }))
  }

  return (
    <div className="phone-frame">
      {screen === 'loading'      && <LoadingScreen     onDone={() => setScreen('map')} />}
      {screen === 'map'          && (
        <MapPage
          onNavigate={handleNavigate}
          group={group}
          hasCreatedGroup={hasCreatedGroup}
          groupBannerExpanded={groupBannerExpanded}
          onGroupBannerExpandedChange={setGroupBannerExpanded}
          onJoinGroup={handleJoinGroup}
        />
      )}
      {screen === 'create-group' && (
        <CreateGroupScreen
          onNavigate={handleNavigate}
          onCreateGroup={handleCreateGroup}
          onJoinGroup={handleJoinWithCode}
        />
      )}
      {screen === 'my-group'     && group && (
        <MyGroupScreen
          onNavigate={handleNavigate}
          group={group}
          onGroupNameChange={handleGroupNameChange}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  )
}
