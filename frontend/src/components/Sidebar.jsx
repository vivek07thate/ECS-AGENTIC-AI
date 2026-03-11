import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, Database, ShieldCheck, FileText, Settings, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  
  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'auditor'] },
    { name: 'Upload Evidence', path: '/upload-evidence', icon: Upload, roles: ['admin'] },
    { name: 'Evidence Repository', path: '/evidence-review', icon: Database, roles: ['admin', 'auditor'] },
    { name: 'Compliance Controls', path: '/controls', icon: ShieldCheck, roles: ['admin', 'auditor'] },
    { name: 'Audit Reports', path: '/audit-reports', icon: FileText, roles: ['admin', 'auditor'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`w-64 bg-primary-blue h-full flex flex-col text-white shadow-lg fixed left-0 top-0 z-30 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-blue-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-accent-red" />
            <h1 className="text-2xl font-bold tracking-wider">ECS</h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-md text-blue-200 hover:bg-blue-800 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                    isActive
                      ? 'bg-blue-800 text-white shadow-inner'
                      : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-blue-800 space-y-2">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-blue-200 hover:bg-red-900/30 hover:text-red-300 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
          <div className="text-[10px] text-blue-400 text-center pt-2 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} ECS Platform
          </div>
        </div>
      </aside>
    </>
  );
}
