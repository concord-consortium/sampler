import React, { useCallback, useMemo, useState } from "react";
import VisibilityIconOn from "../../assets/visibility-on-icon.svg";
import VisibilityIconOff from "../../assets/visibility-off-icon.svg";
import LockedIcon from "../../assets/locked-icon.svg";
import UnlockedIcon from "../../assets/unlocked-icon.svg";
import { IDevice } from "../../types";
import { useGlobalStateContext } from "../../hooks/useGlobalState";

import "./device-visibility.scss";

interface IProps {
  device: IDevice;
  columnIndex: number;
}

export const DeviceVisibility = ({device, columnIndex }: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { selectedDeviceId } = globalState;
  const { hidden, lockPassword } = device;
  const [ showDialog, setShowDialog ] = useState(false);
  const [ password, setPassword ] = useState("");
  const isSelectedDevice = useMemo(() => device.id === selectedDeviceId, [device, selectedDeviceId]);
  const validPassword = useMemo(() => password.length > 0, [password]);
  const matchingPassword = useMemo(() => password === lockPassword, [password, lockPassword]);
  const VisibilityIcon = useMemo(() => {
    if (hidden) {
      if (showDialog) {
        return UnlockedIcon;
      } else {
        if (lockPassword.length > 0) {
          return LockedIcon;
        }
        return VisibilityIconOff;
      }
    } else if (showDialog) {
      if (password.length > 0) {
        return LockedIcon;
      }
      return VisibilityIconOff;
    }
    return VisibilityIconOn;
  }, [hidden, lockPassword, password, showDialog]);

  const handleToggleVisibility = useCallback(() => {
    if (!hidden || lockPassword.length > 0) {
      setShowDialog(true);
    } else {
      setGlobalState(draft => {
        const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
        if (deviceToUpdate) {
          deviceToUpdate.hidden = !deviceToUpdate.hidden;
        }
      });
    }
  }, [columnIndex, hidden, lockPassword.length, selectedDeviceId, setGlobalState]);

  const handleCloseDialog = () => {
    setShowDialog(false);
    setPassword("");
  };

  const handleHide = useCallback(() => {
    setGlobalState(draft => {
      const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
      if (deviceToUpdate) {
        deviceToUpdate.hidden = true;
        deviceToUpdate.lockPassword = validPassword ? password : "";
      }
    });

    handleCloseDialog();
  }, [columnIndex, password, selectedDeviceId, setGlobalState, validPassword]);

  const handleShow = useCallback(() => {
    setGlobalState(draft => {
      const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
      if (deviceToUpdate) {
        deviceToUpdate.hidden = false;
        deviceToUpdate.lockPassword = "";
      }
    });

    handleCloseDialog();
  }, [columnIndex, selectedDeviceId, setGlobalState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hidden) {
      if (matchingPassword) {
        handleShow();
      }
    } else {
      handleHide();
    }
  };

  const renderDialog = () => {
    return (
      <div className="device-visibility-dialog">
        <div className="device-visibility-title">{hidden ? "Show/Unlock" : "Hide/Lock"} Device</div>
        <div className="device-visibility-contents">
          <div className="device-visibility-input">
            <label>{hidden ? "Unlock with password" : "Lock with optional password"}</label>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus={true}
              />
            </form>
          </div>
          <div className="device-visibility-buttons">
            <button className="cancel" onClick={handleCloseDialog}>Cancel</button>
            {hidden && <button className="ok" onClick={handleShow} disabled={!matchingPassword}>Show/Unlock</button>}
            {!hidden && <button className="ok" onClick={handleHide}>{validPassword ? "Hide/Lock" : "Hide"}</button>}
          </div>
        </div>
      </div>
    );
  };

  if (!isSelectedDevice) {
    return null;
  }

  return (
    <div className="device-visibility">
      <div className={`device-visibility-icon-wrapper ${showDialog ? "active" : "clickable"}`}>
        <VisibilityIcon className="device-visibility-icon" onClick={handleToggleVisibility} />
      </div>
      {showDialog && renderDialog()}
    </div>
  );
};
