export const cls = (...classNames: unknown[]) => {
  return classNames
    .filter((className) => typeof className === 'string')
    .join(' ')
    .trim();
};
