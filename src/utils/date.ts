export const dateToUnixTime = (date: Date) =>
  parseInt((date.getTime() / 1000).toFixed(0));

export const unixTimeToDate = (unixTime: number) => new Date(unixTime * 1000.0);
