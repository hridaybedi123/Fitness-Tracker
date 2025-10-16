
import React from 'react';
import { MenuIcon } from './IconComponents';
import type { Page } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: Page;
}

const pageTitles: Record<Page, string> = {
    'dashboard': 'Dashboard',
    'calorie-tracker': 'Calorie Tracker',
    'workout-logger': 'Workout Logger'
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, currentPage }) => {
  return (
    <header className="sticky top-0 z-20 bg-[#0b0b0b]/80 backdrop-blur-sm p-4 flex items-center justify-between border-b border-gray-800">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-full text-gray-400 hover:text-[#39FF14] hover:bg-gray-800 transition-colors duration-300"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-orbitron font-bold text-white">
          <span className="text-[#39FF14] neon-glow">NEON</span>
          <span>FIT</span>
        </h1>
      </div>
       <h2 className="text-lg md:text-xl font-orbitron font-semibold text-gray-300 capitalize">
        {pageTitles[currentPage]}
      </h2>
    </header>
  );
};

export default Header;
