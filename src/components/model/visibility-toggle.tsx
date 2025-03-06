import React from "react";
import "./visibility-toggle.scss";

// Simple SVG icons for visibility states
const EyeIcon = () => (
  <svg 
    data-testid="eye-icon"
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeSlashIcon = () => (
  <svg 
    data-testid="eye-slash-icon"
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

interface VisibilityToggleProps {
  isHidden: boolean;
  onToggle: () => void;
  ariaLabel: string;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ 
  isHidden, 
  onToggle, 
  ariaLabel 
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      onToggle();
      event.preventDefault();
    }
  };

  return (
    <button 
      className={`visibility-toggle ${isHidden ? "hidden" : ""}`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-pressed={isHidden}
    >
      <span className="icon">
        {isHidden ? <EyeSlashIcon /> : <EyeIcon />}
      </span>
      <span className="tooltip">
        {isHidden ? "Show model" : "Hide model"}
      </span>
    </button>
  );
};

// Export both as default and named export for backward compatibility
export { VisibilityToggle };
export default VisibilityToggle;


