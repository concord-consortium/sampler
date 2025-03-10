import "@testing-library/jest-dom";
import ResizeObserver from "resize-observer-polyfill";
import { render } from '@testing-library/react';
import React from 'react';

// Mock ResizeObserver
window.ResizeObserver = ResizeObserver;

// Suppress React 18 warnings about ReactDOM.render in testing-library
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ReactDOM.render is no longer supported in React 18')
  ) {
    return;
  }
  originalError(...args);
};
