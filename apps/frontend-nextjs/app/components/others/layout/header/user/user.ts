import { user } from '@/services/user/user'

export const getUserRole = () => {
  if (user.isAdmin()) return 'Admin'
  else if (user.isKraveier()) return 'Kraveier'
  else if (user.isPersonvernombud()) return 'Personverombud'
  else if (user.canWrite()) return 'Etterlever'
  else return 'Gjest'
}
