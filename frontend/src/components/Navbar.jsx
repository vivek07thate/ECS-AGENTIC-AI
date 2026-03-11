import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 border-b border-gray-200 lg:ml-64 fixed top-0 left-0 right-0 z-10 transition-all duration-300">
      <div className="flex items-center gap-4 w-full max-w-md">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-blue focus:border-primary-blue sm:text-sm transition-colors"
            placeholder="Search..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <button className="text-gray-500 hover:text-primary-blue relative transition-colors p-2">
          <Bell className="h-6 w-6" />
          <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-accent-red ring-2 ring-white"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l pl-3 md:pl-6 border-gray-200">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary-blue border border-blue-200 shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-gray-700 truncate max-w-[120px] md:max-w-none">
              {user?.full_name || 'Auditor Admin'}
            </p>
            <p className="text-xs text-gray-500 font-medium tracking-wide first-letter:uppercase">
              {user?.role === 'admin' ? 'Security Architect' : 
               user?.role === 'auditor' ? 'Compliance Officer' : 'System Agent'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
