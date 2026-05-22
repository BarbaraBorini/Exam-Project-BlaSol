/**
 * App.jsx – Root component
 *
 * This is the entry point of the app. It controls which screen is shown
 * (loading → map → create-group → my-group) and holds all group-related state
 * so it can be shared between screens.
 *
 * State is saved to localStorage so it survives a page refresh.
 */

import { useState, useEffect } from 'react'
import './App.css'
import LoadingScreen    from './screens/LoadingScreen'
import MapPage          from './screens/MapPage'
import CreateGroupScreen from './screens/CreateGroupScreen'
import MyGroupScreen    from './screens/MyGroupScreen'
import { createGroupFromForm, isEmailInMembers, nameFromEmail } from './groupUtils'
import { loadGroupState, saveGroupState, joinGroupFromInviteCode } from './groupStorage'

// Load any previously saved group data from localStorage on startup
const savedGroupState = loadGroupState()

// Maps every navigation tab ID to the screen it should show.
// Tabs like "start", "program", "artister", and "menu" are not implemented yet
// and all redirect to the map for now.
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
  // Which screen is currently visible
  const [screen, setScreen] = useState('loading')

  // The group the user belongs to (null if they haven't joined/created one)
  const [group, setGroup] = useState(savedGroupState.group)

  // True once the user has created or joined a group (controls map banner vs. group bar)
  const [hasCreatedGroup, setHasCreatedGroup] = useState(savedGroupState.hasCreatedGroup)

  // Whether the "Join or create group" accordion on the map is open
  const [groupBannerExpanded, setGroupBannerExpanded] = useState(
    savedGroupState.groupBannerExpanded,
  )

  // Save group state to localStorage whenever it changes
  useEffect(() => {
    saveGroupState({ group, hasCreatedGroup, groupBannerExpanded })
  }, [group, hasCreatedGroup, groupBannerExpanded])

  // Navigate to a screen by its tab ID (e.g. 'map', 'my-group')
  function handleNavigate(target) {
    setScreen(ROUTE_MAP[target] ?? target)
  }

  // Called when the user taps "Join or create group" on the map banner
  function handleJoinGroup() {
    setGroupBannerExpanded(false)
    handleNavigate('create-group')
  }

  // Called when the user submits the "Create a new group" form
  function handleCreateGroup(groupName, emails) {
    setGroup(createGroupFromForm(groupName, emails))
    setHasCreatedGroup(true)
    setGroupBannerExpanded(false)
    handleNavigate('my-group')
  }

  // Called when the user submits an invitation code to join an existing group
  function handleJoinWithCode(inviteCode) {
    const result = joinGroupFromInviteCode(inviteCode)
    if (!result.ok) return result // return the error so the form can display it

    setGroup(result.group)
    setHasCreatedGroup(true)
    setGroupBannerExpanded(false)
    handleNavigate('my-group')
    return { ok: true }
  }

  // Update the name of the current group
  function handleGroupNameChange(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    setGroup(prev => ({ ...prev, name: trimmed }))
  }

  // Add a new member to the group by email
  function handleAddMember(email) {
    const trimmed = email.trim()
    if (!trimmed) return
    setGroup(prev => {
      if (isEmailInMembers(trimmed, prev.members)) return prev // skip duplicates
      return {
        ...prev,
        members: [
          ...prev.members,
          {
            id: Date.now(), // unique id based on timestamp
            name: nameFromEmail(trimmed),
            email: trimmed,
            isAdmin: false,
          },
        ],
      }
    })
  }

  // Remove a member from the group by their id
  function handleRemoveMember(memberId) {
    setGroup(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId),
    }))
  }

  return (
    <div className="phone-frame">
      {screen === 'loading'      && <LoadingScreen onDone={() => setScreen('map')} />}

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

      {/* Only render MyGroupScreen if a group actually exists */}
      {screen === 'my-group' && group && (
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
