import React, { useState, useRef, useEffect } from 'react';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import './settings-menu.scss';

export const SettingsMenu: React.FC = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { reduceMotion } = globalState;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleReduceMotionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalState(draft => {
      draft.reduceMotion = e.target.checked;
    });
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      toggleMenu();
      e.preventDefault();
    }
  };
  
  return (
    <div className="settings-menu-container" ref={menuRef}>
      <button 
        className="settings-icon-button"
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        aria-label="Settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="settings-dropdown" role="menu">
          <div className="settings-item" role="menuitem">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={handleReduceMotionChange}
                aria-label="Reduce motion"
              />
              <span>Reduce Motion</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}; 