import React from 'react';
import { NavLink } from 'react-router-dom';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole: Role;
  setUserRole: (role: Role) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, setUserRole }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-primary text-white flex-shrink-0">
        <div className="p-6 border-b border-teal-800">
          <h1 className="text-2xl font-bold tracking-wider">REGU-AI</h1>
          <p className="text-xs text-teal-200 mt-1">BLU Compliance & Clinical Ops</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <NavLink 
            to="/financial"
            className={({ isActive }) => 
              `block px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-teal-800 text-white' : 'text-teal-100 hover:bg-teal-700'}`
            }
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              Financial Engine (BLU)
            </div>
          </NavLink>

          <NavLink 
            to="/clinical"
            className={({ isActive }) => 
              `block px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-teal-800 text-white' : 'text-teal-100 hover:bg-teal-700'}`
            }
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.761 2.156 17.2 4.384 18.846A9.011 9.011 0 0010 20c2.72 0 5.228-.962 7.15-2.585 1.55-1.332 1.636-3.766.246-5.071l-2.68-2.513a1 1 0 01-.29-.707V4.414l.707-.707A1 1 0 0014 2H7zm3 4a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V7a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Clinical Gateway (FHIR)
            </div>
          </NavLink>
        </nav>

        <div className="p-4 mt-auto border-t border-teal-800">
          <label className="text-xs uppercase text-teal-300 font-bold mb-2 block">Simulate Role</label>
          <select 
            value={userRole} 
            onChange={(e) => setUserRole(e.target.value as Role)}
            className="w-full bg-teal-900 text-white p-2 rounded text-sm border border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-400"
          >
            <option value="admin">Administrator (Full)</option>
            <option value="accountant">Accountant (Finance Only)</option>
            <option value="doctor">Doctor (Clinical Only)</option>
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            {window.location.hash.includes('financial') ? 'Financial Compliance & Reporting' : 'Clinical Documentation & Intelligence'}
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-gray-500 font-medium">System Secure • BLU Standard</span>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;