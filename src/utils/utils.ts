// fills an array from 0 to n
export const fill = (n: number) => {
  return Array.from(Array(n).keys());
};

// shuffles an array in place
export const shuffle = (arr: Array<string|number>) => {
  let j, x, i;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = arr[i];
    arr[i] = arr[j];
    arr[j] = x;
  }
};
