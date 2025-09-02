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
import { useAuth } from '../auth.tsx';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', current: true },
    { name: 'Inventory', icon: Package, href: '/inventory', current: false },
    { name: 'Suppliers', icon: ShoppingCart, href: '/suppliers', current: false },
    { name: 'Vendors', icon: TrendingUp, href: '/vendors', current: false },
    { name: 'Purchase Orders', icon: ShoppingCart, href: '/purchaseorders', current: false },
    { name: 'Sales Orders', icon: TrendingUp, href: '/salesorders', current: false },
    { name: 'Employees', icon: Users, href: '/employees', current: false },
    { name: 'Payrolls', icon: Users, href: '/payrolls', current: false },
    { name: 'Invoices', icon: FileText, href: '/invoices', current: false },
    { name: 'Payments', icon: FileText, href: '/payments', current: false },
    { name: 'Settings', icon: Settings, href: '/settings', current: false },
  ];

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
                  <Link
                    to={item.href}
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
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
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
