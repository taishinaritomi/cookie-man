export const alphabetSort = <T, K extends keyof T>(k: K) => {
  return (a: T, b: T) => (a[k] > b[k] ? 1 : b[k] > a[k] ? -1 : 0);
};

export const booleanSort = <T, K extends keyof T>(k: K) => {
  return (a: T, b: T) => Number(b[k]) - Number(a[k]);
};
