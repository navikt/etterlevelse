export const getNumberOfDaysBetween = (startDate: Date, endDate: Date) => {
  const diff = Math.abs(startDate.getTime() - endDate.getTime())
  return (diff / (1000 * 60 * 60 * 24))
}