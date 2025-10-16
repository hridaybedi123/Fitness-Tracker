
import React from 'react';
import type { Page } from '../types';
import { CloseIcon } from './IconComponents';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavLink: React.FC<{
    page: Page;
    currentPage: Page;
    onClick: () => void;
    children: React.ReactNode
}> = ({ page, currentPage, onClick, children }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 text-lg font-orbitron rounded-lg transition-all duration-300 ${
                isActive
                ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold'
                : 'text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/10'
            }`}
        >
            {children}
        </button>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, setCurrentPage }) => {

  const handleNav = (page: Page) => {
    setCurrentPage(page);
    onClose();
  }

  const handleSignOut = () => {
    signOut(auth);
    onClose();
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-72 glass-card p-6 z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-orbitron font-bold text-white">
                <span className="text-[var(--accent-primary)]">NEON</span>
                <span>FIT</span>
            </h2>
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-[var(--accent-primary)] hover:bg-white/10 transition-colors duration-300">
                <CloseIcon className="h-6 w-6" />
            </button>
        </div>
        <nav className="flex flex-col gap-4 flex-grow">
            <NavLink page="dashboard" currentPage={currentPage} onClick={() => handleNav('dashboard')}>
                Dashboard
            </NavLink>
            <NavLink page="calorie-tracker" currentPage={currentPage} onClick={() => handleNav('calorie-tracker')}>
                Calorie Tracker
            </NavLink>
            <NavLink page="workout-logger" currentPage={currentPage} onClick={() => handleNav('workout-logger')}>
                Workout Logger
            </NavLink>
            <NavLink page="weight-tracker" currentPage={currentPage} onClick={() => handleNav('weight-tracker')}>
                Weight Tracker
            </NavLink>
        </nav>
        <div className="mt-auto">
            <button 
                onClick={handleSignOut}
                className="w-full text-left p-4 text-lg font-orbitron rounded-lg text-[var(--text-secondary)] hover:bg-[var(--danger)]/20 hover:text-[var(--danger)] transition-colors duration-300"
            >
                Sign Out
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;