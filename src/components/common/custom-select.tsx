import React, { useState, useRef, useEffect } from "react";
import "./custom-select.scss";

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<Array<HTMLLIElement | null>>([]);

  const selected = options.find((opt) => opt.value === value) || null;
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  const toggleOpen = () => {
    if (!disabled) setOpen((prev) => !prev);
  };

  const handleOptionClick = (option: CustomSelectOption) => {
    onChange(option.value);
    setOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (!open && ["ArrowDown", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    const max = options.length - 1;
    let newIndex = selectedIndex;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        newIndex = selectedIndex < max ? selectedIndex + 1 : 0;
        listRef.current[newIndex]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        newIndex = selectedIndex > 0 ? selectedIndex - 1 : max;
        listRef.current[newIndex]?.focus();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (selectedIndex !== -1) onChange(options[selectedIndex].value);
        setOpen(false);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  return (
    <div
      className={`custom-select-wrapper ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls="custom-select-listbox"
      aria-disabled={disabled}
      aria-activedescendant={
        selectedIndex !== -1 ? `custom-select-option-${selectedIndex}` : undefined
      }
    >
      <div
        className="custom-select-display"
        onClick={toggleOpen}
        id="custom-select-button"
        role="button"
        aria-label="Select an option"
        aria-disabled={disabled}
      >
        <div className="custom-select-label">
          {selected?.icon && <span className="icon">{selected.icon}</span>}
          <span className={selected?.icon ? "" : "no-icon"}>{selected ? selected.label : placeholder}</span>
        </div>
        <img
          src="/assets/dropdown-arrow-icon.svg"
          alt=""
          className="dropdown-arrow"
          aria-hidden="true"
        />
      </div>

      {open && !disabled && (
        <ul
          className="custom-select-options"
          role="listbox"
          id="custom-select-listbox"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`custom-select-option-${index}`}
              role="option"
              aria-selected={value === option.value}
              tabIndex={0}
              ref={(el) => (listRef.current[index] = el)}
              className={`custom-select-option ${
                value === option.value ? "selected" : ""
              }`}
              onClick={() => handleOptionClick(option)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleOptionClick(option);
                }
              }}
            >
              {option.icon && <span className="icon">{option.icon}</span>}
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
