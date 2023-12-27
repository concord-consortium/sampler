import React, { useEffect, useState } from "react";
import { IVariables } from "../../../../models/device-model";
import { MixerFrame } from "../shared/mixer-frame";

import "./mixer.scss";
import { Balls } from "../shared/balls";

interface IMixer {
  variables: IVariables;
}

export const Mixer = ({variables}: IMixer) => {
  const [ballArray, setBallArray] = useState<Array<string>>([]);

  useEffect(() => {
    function gcd(a: number, b: number): number {
      return b === 0 ? a : gcd(b, a % b);
    }


    function lcm(a: number, b: number): number {
      return (a * b) / gcd(a, b);
    }

    function isOneThirdOrTwoThirds(value: number): boolean {
      return value === 33 || value === 67;
    }

    function extractProportionalKeys(variablesMap: { [key: string]: number }): string[] {
      let result: string[] = [];
      let leastCommonMultiple = 1;
      let scale = 100; // Scale factor since our total percentage is always 100

      // Check if any value is  one third or two thirds
      let hasSpecialCase = Object.values(variablesMap).some(isOneThirdOrTwoThirds);

      if (hasSpecialCase) {
        // Handle the special case where values are  1/3 or 2/3
        for (const key in variablesMap) {
          let proportion = Math.round((variablesMap[key] / scale) * 3);
          for (let i = 0; i < proportion; i++) {
            result.push(key);
          }
        }
      } else {
        // Find the least common multiple of the scale and all values in the map
        for (const value of Object.values(variablesMap)) {
          leastCommonMultiple = lcm(leastCommonMultiple, scale / gcd(scale, value));
        }

        // Add keys to the result array according to their scaled proportion
        for (const key in variablesMap) {
          let proportion = (variablesMap[key] / scale) * leastCommonMultiple;
          for (let i = 0; i < proportion; i++) {
            result.push(key);
          }
        }
      }

      return result;
    }

    const balls = extractProportionalKeys(variables);
    setBallArray(balls);

  }, [variables]);

  return (
    <>
      <MixerFrame withReplacement={false}/>
      <Balls ballsArray={ballArray}/>
    </>
  );
};
