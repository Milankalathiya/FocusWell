import React from 'react';
import {
  FaChartPie,
  FaClock,
  FaPlus,
  FaTasks,
  FaThLarge,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', icon: <FaChartPie />, text: 'Dashboard' },
  { path: '/projects', icon: <FaThLarge />, text: 'Projects' },
  { path: '/tasks', icon: <FaTasks />, text: 'Tasks' },
  { path: '/timelog', icon: <FaClock />, text: 'Time log' },
  { path: '/resources', icon: <FaUsers />, text: 'Resource mgnt' },
  { path: '/users', icon: <FaUser />, text: 'Users' },
  { path: '/templates', icon: <FaThLarge />, text: 'Project template' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-bg-main font-sans">
      {/* Sidebar */}
      <aside className="glass flex flex-col justify-between w-64 p-6 m-4 rounded-2xl bg-sidebar-dark text-white shadow-glass">
        <div>
          <div className="flex items-center mb-10">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-xl font-bold mr-3 shadow-lg">
              F
            </div>
            <span className="text-2xl font-bold tracking-wide">FocusWell</span>
          </div>
          <Link to="/projects">
            <button className="w-full flex items-center gap-2 bg-primary text-white font-semibold py-3 px-4 rounded-xl mb-8 shadow-lg hover:bg-opacity-90 transition">
              <FaPlus /> Create new project
            </button>
          </Link>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-lg ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-primary'
                    : 'hover:bg-white/5 text-white'
                }`}
              >
                {item.icon} {item.text}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 mt-10 p-3 rounded-xl bg-white/10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            A
          </div>
          <div>
            <div className="font-semibold">Alex meian</div>
            <div className="text-xs text-text-muted">Product manager</div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
