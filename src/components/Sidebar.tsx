import React from 'react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings,
  LogOut
} from 'lucide-react'

interface SidebarProps {
  onLogout: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '#', current: true },
    { name: 'Inventory', icon: Package, href: '#', current: false },
    { name: 'Purchases', icon: ShoppingCart, href: '#', current: false },
    { name: 'Sales', icon: TrendingUp, href: '#', current: false },
    { name: 'Payroll', icon: Users, href: '#', current: false },
    { name: 'Reports', icon: FileText, href: '#', current: false },
    { name: 'Settings', icon: Settings, href: '#', current: false },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-gray-800">
      <div className="flex h-16 shrink-0 items-center px-4">
        <h1 className="text-xl font-semibold text-white">Swaraj ERP</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7 px-6 py-4">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`
                      group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                      ${item.current 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                      }
                    `}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <button
              onClick={onLogout}
              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-900 hover:text-white w-full"
            >
              <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
