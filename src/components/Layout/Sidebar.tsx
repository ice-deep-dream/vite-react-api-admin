import { GroupSidebar } from '../ApiExplorer/GroupSidebar'
import './Sidebar.css'

interface SidebarProps {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <GroupSidebar />
    </aside>
  )
}
