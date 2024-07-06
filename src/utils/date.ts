export function dateToUnixTime(date: Date) {
  return Number.parseInt((date.getTime() / 1000).toFixed(0));
}

export function unixTimeToDate(unixTime: number) {
  return new Date(unixTime * 1000.0);
}
