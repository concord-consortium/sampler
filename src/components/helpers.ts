import { IVariables, IColumn, IGetNewPcts } from "../types";

export function calcPct (a: number, b: number) {
  return Math.round(100 * (a / b));
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function isOneThirdOrTwoThirds(value: number): boolean {
  return value === 33 || value === 67;
}

export function percentageToFraction (percentage: number) {
  const numerator = percentage;
  const denominator = 100;
  const commonFactor = gcd(numerator, denominator);
  return [numerator / commonFactor, denominator / commonFactor];
}

export function findCommonDenominator (percentages: number[]): number {
  const fractions = percentages.map((p) => percentageToFraction(p));
  const denominators = fractions.map((f) => { return f[1];});
  const lcdDenominator = denominators.reduce((accumulator, currentDenominator) => lcm(accumulator, currentDenominator));
  return lcdDenominator;
}

export function findEquivNum(n: number, lcd: number) {
  return (n * (lcd / 100));
}

export function fewestNumbersToSum (target: number, count: number) {
  const result = [];

  // distribute the target equally among the count of integers
  const initialDistribution = Math.floor(target / count);

  // adjust the initial distribution to ensure the sum matches the target
  let sum = initialDistribution * count;
  for (let i = 0; i < count; i++) {
    result.push(initialDistribution);
  }

  // distribute the remaining difference to the numbers
  let remainder = target - sum;
  let j = 0;
  while (remainder > 0) {
    result[j % count]++;
    remainder--;
    j++;
  }

  return result;
}

export const getNextVariable = (varIdx: number, variables: IVariables) => {
  const uniqueVariables = [...new Set(variables)];
  const index = uniqueVariables.indexOf(variables[varIdx]);
  return uniqueVariables[index + 1];
};

export const getNewVariable = (vars: IVariables): string => {
  const isNumeric = vars.every(v => !isNaN(Number(v)));

  if (isNumeric) {
      const maxKey = Math.max(...vars.map(Number));
      return (maxKey + 1).toString();
  } else {
      const maxChar = vars.reduce((max, v) => {
          if (v >= "a" && v < "z" || v >= "A" && v < "Z") {
              return max < v ? v : max;
          }
          return max;
      }, "0");
      return String.fromCharCode(maxChar.charCodeAt(0) + 1);
  }
};

export const getProportionalVars = (variables: IVariables) => {
  const numUnique = [...new Set(variables)].length;
  const newVariable = getNewVariable( variables);
  const newVariables: IVariables = [];
  const newFraction = 1 / (numUnique + 1);
  const pctMap = [...new Set(variables)].map((v) => {
    const currentPct = (variables.filter((variable) => variable === v).length / variables.length) * 100;
    const amtToSubtract = currentPct * newFraction;
    return {variable: v, pct: Math.round(currentPct - amtToSubtract)};
  });
  pctMap.push({variable: newVariable, pct: Math.round(newFraction * 100)});
  const sumOfNewPcts = pctMap.reduce((sum, v) => sum + v.pct, 0);
  let discrepancy = 100 - sumOfNewPcts;
  while (discrepancy !== 0) {
    const sign = discrepancy > 0 ? 1 : -1;
    const index = Math.floor(Math.random() * pctMap.length);
    pctMap[index].pct += sign;
    discrepancy -= sign;
  }
  const lcd = findCommonDenominator(pctMap.map((v) => v.pct));
  pctMap.forEach((vPct) => {
    const newNum = findEquivNum(vPct.pct, lcd);
    newVariables.push(...Array.from({length: newNum}, () => vPct.variable));
  });
  return newVariables;
};

export const getVariableCount = (variable: string, variables: IVariables) => {
  return variables.filter(v => v === variable).length;
};

export const getPercentOfVar = (variable: string, variables: IVariables) =>{
  return calcPct(getVariableCount(variable, variables), variables.length);
};

export const getFirstAndLastIndexOfVar = (variable: string, variables: IVariables) => {
  const firstIndexOfVar = variables.indexOf(variable);
  const lastIndexOfVar = (variables.filter(v => v === variable).length - 1) + firstIndexOfVar;
  return {firstIndexOfVar, lastIndexOfVar};
};

export const getNewPcts = ({newPct, oldPct, selectedVar, variables, fixedVariables, setFixedVariables, updateNext}: IGetNewPcts) => {
  const diffOfPcts = newPct - oldPct;
  const newPctsMap: Record<string, number> = {};
  let uniqueVariables = [...new Set(variables)];

  // place the selected variable at the beginning of the fixed variables array and ensure
  // the list is smaller than the unique variables list so we have at least 1 degree of freedom
  const currentFixedVariables = [...fixedVariables];
  const index = currentFixedVariables.indexOf(selectedVar);
  if (index !== -1) {
    currentFixedVariables.splice(index, 1);
  }
  // 0 means delete variable
  if (newPct <= 0) {
    newPct = 0;
    uniqueVariables = uniqueVariables.filter(v => v !== selectedVar);
  } else {
    currentFixedVariables.unshift(selectedVar);
  }
  // 100 means delete other variables
  if (newPct >= 100) {
    newPct = 100;
    currentFixedVariables.length = 0;
    uniqueVariables = [selectedVar];
  } else {
    currentFixedVariables.length = Math.min(currentFixedVariables.length, uniqueVariables.length - 1);
  }
  let unfixedVariables = uniqueVariables.filter(v => !currentFixedVariables.includes(v));

  setFixedVariables(currentFixedVariables);

  if (updateNext) {
    // only update adjacent variable (if user is dragging a wedge boundary)
    const unselectedVars = variables.filter(v => v !== selectedVar);
    const { lastIndexOfVar } = getFirstAndLastIndexOfVar(selectedVar, variables);
    const adjacentVar = variables.find((v, i) => i === lastIndexOfVar + 1);

    // update new percents
    const newPcts = unselectedVars.map((v, i) => {
      let pctOfVar = getPercentOfVar(unselectedVars[i], variables);
      if (v === adjacentVar && pctOfVar - diffOfPcts > 0) {
        pctOfVar = pctOfVar - diffOfPcts;
      }
      newPctsMap[unselectedVars[i]] = pctOfVar;
      return pctOfVar;
    });

    return {newPcts, newPctsMap, uniqueVariables};
  } else {
    // get the percentages for all variables and the total fixed percentage
    let fixedPct = 0;
    uniqueVariables.forEach(variable => {
      newPctsMap[variable] = variable === selectedVar ? newPct : getPercentOfVar(variable, variables);
      if (currentFixedVariables.includes(variable)) {
        fixedPct += newPctsMap[variable];
      }
    });

    // remove all the unfixed variables if we have no more room to distribute the remaining percentage
    // with at least 1 percent for each unfixed variable
    let numUnfixed = unfixedVariables.length;
    if (fixedPct >= 100 - numUnfixed) {
      uniqueVariables = uniqueVariables.filter(v => !unfixedVariables.includes(v));
      unfixedVariables.forEach(variable => {
        delete newPctsMap[variable];
      });
      unfixedVariables = [];
      numUnfixed = 0;

      // redistribute the remaining percentage to the non-current fixed variables
      const remainingPct = 100 - newPct;
      const otherVariables = uniqueVariables.filter(v => v !== selectedVar);
      const otherTotal = otherVariables.reduce((sum, v) => sum + newPctsMap[v], 0);
      otherVariables.forEach(v => {
        newPctsMap[v] = Math.max(1, Math.floor(remainingPct * (newPctsMap[v] / otherTotal)));
      });
    }

    if (numUnfixed > 0) {
      // update all variables by distributing difference
      const distributedPct = Math.max(1, Math.floor((100 - fixedPct) / numUnfixed));

      uniqueVariables.forEach((v) => {
        if (unfixedVariables.includes(v)) {
          newPctsMap[v] = distributedPct;
        }
      });
    }
  }
  return {newPcts: Object.values(newPctsMap), newPctsMap, uniqueVariables};
};

export const createNewVarArray = (selectedVar: string, variables: IVariables, fixedVariables: IVariables, setFixedVariables: React.Dispatch<React.SetStateAction<IVariables>>, newPct: number, updateNext?: boolean) => {
  const oldPct = getPercentOfVar(selectedVar, variables);
  const { newPcts, newPctsMap, uniqueVariables } = getNewPcts({newPct, oldPct, selectedVar, variables, fixedVariables, setFixedVariables, updateNext});
  let newVariables: IVariables = [];
  if (uniqueVariables.length === 2 && (newPct === 33 || newPcts.includes(33))) {
    const otherVar = uniqueVariables.filter(v => v !== selectedVar)[0];
    const varWith33 = newPct === 33 ? selectedVar : otherVar;
    const varWith67 = newPct === 33 ? otherVar : selectedVar;
    uniqueVariables.forEach(varName => {
      if (varName === varWith33) {
        newVariables.push(...Array.from({ length: 1 }, () => varWith33));
      } else {
        newVariables.push(...Array.from({ length: 2 }, () => varWith67));
      }
    });
  } else {
    // find new common denominator to distribute whole number of mixer balls to each variable
    const commonDenom = findCommonDenominator(newPcts);
    // add new amounts of variables to new array following order of variables in original array
    uniqueVariables.forEach(varName => {
      if (varName === selectedVar) {
        const newNum = findEquivNum(newPct, commonDenom);
        newVariables.push(...Array.from({ length: newNum }, () => selectedVar));
      } else {
        const newNum = findEquivNum(newPctsMap[varName], commonDenom);
        newVariables.push(...Array.from({ length: newNum }, () => varName));
      }
    });
  }
  return newVariables;
};

export function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export const getNewColumnName = (proposedName: string, columns: IColumn[], columnId?: string) => {
  let name = proposedName;
  const otherColumnsWithSameName = columns.filter(c => c.name.startsWith(proposedName) && c.id !== columnId);
  const isNameUnique = otherColumnsWithSameName.length === 0 || otherColumnsWithSameName.every((col) => col.name !== proposedName);

  if (isNameUnique) {
    return name;
  }

  const indexes = otherColumnsWithSameName.map((col) => Number(col.name.slice(proposedName.length)));
  const highestIndex = Math.max(...indexes);
  if (!highestIndex) {
    name = name + 2;
  } else {
    for (let i = 2; i <= highestIndex; i++) {
      const nameWithIndex = name + i;
      const isNameWithIndexUsed = otherColumnsWithSameName.find((col) => col.name === nameWithIndex);
      if (!isNameWithIndexUsed) {
        name = nameWithIndex;
        break;
      } else if (i === highestIndex) {
        name = name + (highestIndex + 1);
      }
    }
  }

  return name;
};
