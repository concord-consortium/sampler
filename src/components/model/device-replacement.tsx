import React, { useCallback, useMemo } from "react";
import { tr } from "../../utils/localeManager";
import WithReplacementIcon from "../../assets/with-replacement-icon.svg";
import WithoutReplacementIcon from "../../assets/without-replacement-icon.svg";
import { IDevice } from "../../types";
import { useGlobalStateContext } from "../../hooks/useGlobalState";

import "./device-replacement.scss";

interface IProps {
  device: IDevice;
  columnIndex: number;
}

export const DeviceReplacement = ({device, columnIndex }: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { isRunning } = globalState;

  const ReplacementIcon = useMemo(() => device.replacement ? WithReplacementIcon : WithoutReplacementIcon, [device.replacement]);

  const disabled = useMemo(() => isRunning || device.viewType === "spinner", [isRunning, device.viewType]);
  const title = useMemo(() => {
    const withReplacementLabel = tr("DG.Plugin.Sampler.device-icon.with-replacement");
    const withoutReplacementLabel = tr("DG.Plugin.Sampler.device-icon.without-replacement");
    const spinnerReplacementLabel = tr("DG.Plugin.Sampler.device-icon.spinner.replacement");
    if (disabled) {
      if (isRunning) {
        return undefined; // No tooltip when running
      }
      return spinnerReplacementLabel;
    }
    return device.replacement ? withReplacementLabel : withoutReplacementLabel;
  }, [disabled, device.replacement, isRunning]);

  const handleToggle = useCallback(() => {
    if (disabled) {
      return;
    }
    setGlobalState(draft => {
      const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === device.id);
      if (deviceToUpdate) {
        deviceToUpdate.replacement = !deviceToUpdate.replacement;
      }
    });
  }, [columnIndex, device.id, disabled, setGlobalState]);

  return (
    <div className="device-replacement">
      <div className={`device-replacement-icon-wrapper ${disabled ? "disabled" : ""}`} title={title}>
        <ReplacementIcon className="device-replacement-icon" onClick={handleToggle} />
      </div>
    </div>
  );
};
