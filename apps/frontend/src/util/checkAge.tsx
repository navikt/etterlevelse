import moment from 'moment'

export const getNumberOfDaysBetween = (startDate: string, endDate: Date) => {
  const startDateTime = moment(startDate).toDate().getTime()
  const diff = Math.abs(startDateTime - endDate.getTime())
  return diff / (1000 * 60 * 60 * 24)
}
