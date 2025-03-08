import React from 'react';
import { IDevice } from '../../types';
import { useGlobalStateContext } from '../../hooks/useGlobalState';

interface DeviceVisibilityProps {
  device: IDevice;
}

export const DeviceVisibility: React.FC<DeviceVisibilityProps> = ({ device }) => {
  const { setGlobalState } = useGlobalStateContext();
  
  // Initialize device.hidden and device.lockPassword if they don't exist
  const isHidden = device.hidden || false;
  const hasPassword = device.lockPassword ? device.lockPassword.length > 0 : false;
  
  const toggleVisibility = () => {
    setGlobalState(draft => {
      const deviceToUpdate = draft.model.columns
        .flatMap(column => column.devices)
        .find(d => d.id === device.id);
      
      if (deviceToUpdate) {
        deviceToUpdate.hidden = !deviceToUpdate.hidden;
      }
    });
  };
  
  const toggleLock = () => {
    // If the device has a password, prompt for it before unlocking
    if (hasPassword) {
      const password = prompt('Enter password to unlock device:');
      if (password !== device.lockPassword) {
        alert('Incorrect password');
        return;
      }
    }
    
    setGlobalState(draft => {
      const deviceToUpdate = draft.model.columns
        .flatMap(column => column.devices)
        .find(d => d.id === device.id);
      
      if (deviceToUpdate) {
        if (deviceToUpdate.lockPassword) {
          // Unlock the device
          deviceToUpdate.lockPassword = '';
        } else {
          // Lock the device
          const newPassword = prompt('Enter a password to lock this device:');
          if (newPassword) {
            deviceToUpdate.lockPassword = newPassword;
          }
        }
      }
    });
  };
  
  return (
    <div className="device-visibility-controls">
      <button 
        className={`visibility-toggle ${isHidden ? 'hidden' : 'visible'}`}
        onClick={toggleVisibility}
        aria-label={isHidden ? 'Show device' : 'Hide device'}
      >
        {isHidden ? 'Show' : 'Hide'}
      </button>
      
      <button 
        className={`lock-toggle ${hasPassword ? 'locked' : 'unlocked'}`}
        onClick={toggleLock}
        aria-label={hasPassword ? 'Unlock device' : 'Lock device'}
      >
        {hasPassword ? 'Unlock' : 'Lock'}
      </button>
    </div>
  );
};

export default DeviceVisibility; 
