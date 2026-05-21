
import iconCopy from './assets/copy.svg'
import iconBackArrow from './assets/back-arrow.svg'
import iconSignal from './assets/signal.svg'
import iconWifi from './assets/wifi.svg'
import iconBattery from './assets/battery.svg'
import iconLogo from './assets/Logo.svg'
import createGroupClosed from './assets/create-group-closed.svg'
import createGroupOpened from './assets/create-group-opened.svg'
import joinGroupClosed from './assets/join-group-closed.svg'
import joinGroupOpened from './assets/join-group-opened.svg'
import iconFilter from './assets/filter.svg'
import iconJoinGroup from './assets/joingroup.svg'
import iconChevronDown from './assets/chevron-down.svg'
import iconDelete from './assets/delete.svg'
import iconAdd from './assets/add.svg'
import iconLeave from './assets/leave.svg'
import iconAdmin from './assets/admin.svg'
import iconMember from './assets/member.svg'
import iconEdit from './assets/edit.svg'

// ── Status Bar ────────────────────────────────────────────────────────────────
export const ICON_SIGNAL  = iconSignal
export const ICON_WIFI    = iconWifi
export const ICON_BATTERY = iconBattery

// ── Navigation tab icons (background rendered with CSS) ───────────────────────
export { default as NAV_HOME } from './assets/home.svg'
export { default as NAV_PROGRAM } from './assets/program.svg'
export { default as NAV_MAP } from './assets/mapicon.svg'
export { default as NAV_ARTISTER } from './assets/artister.svg'
export { default as NAV_MENU } from './assets/menu.svg'

// ── Loading Screen ────────────────────────────────────────────────────────────
export const LOGO = iconLogo

// ── Shared UI ─────────────────────────────────────────────────────────────────
export const BACK_ARROW = iconBackArrow

// ── Create Group Screen ───────────────────────────────────────────────────────
export const BTN_CREATE_BG_CLOSED = createGroupClosed
export const BTN_CREATE_BG_OPEN   = createGroupOpened
export const BTN_JOIN_BG_CLOSED   = joinGroupClosed
export const BTN_JOIN_BG_OPEN     = joinGroupOpened

// ── My Group Screen ───────────────────────────────────────────────────────────
export const ICON_EDIT     = iconEdit
export const ICON_COPY     = iconCopy
export const AVATAR_ADMIN  = iconAdmin
export const AVATAR_MEMBER = iconMember
export const ICON_LEAVE    = iconLeave
export const ICON_DELETE   = iconDelete
export const ICON_ADD      = iconAdd

// ── Map Page – header UI ──────────────────────────────────────────────────────
export const ICON_FILTER       = iconFilter
export const ICON_BANNER_GROUP = iconJoinGroup
export const ICON_CHEVRON_DOWN = iconChevronDown

// Stage banner backgrounds are imported locally in MapPage.jsx from src/assets/Background-*.svg
