import { getUserInfo } from '@/api/user/userApi'
import { IUserInfo } from '@/constants/user/userConstants'
import { AxiosResponse } from 'axios'
import { EGroup } from './userProvider'

const UserService = async (): Promise<IUserProps> => {
  let loaded: boolean
  let userInfo: IUserInfo = { loggedIn: false, groups: [] }
  let currentGroups: EGroup[] = [EGroup.READ]
  let error: string

  const fetchData: () => Promise<any> = async (): Promise<any> => {
    return await getUserInfo()
      .then((response: AxiosResponse<IUserInfo, any>) => {
        if (response.status === 200) {
          handleGetResponse(response)
        }
      })
      .catch((error) => {
        error = error.message
        console.debug({ error })
        loaded = true
      })
  }

  const promise: Promise<any> = fetchData()

  const handleGetResponse = (response: AxiosResponse<IUserInfo>): void => {
    if (typeof response.data === 'object' && response.data !== null) {
      const groups =
        response.data.groups.indexOf(EGroup.ADMIN) >= 0
          ? (Object.keys(EGroup) as EGroup[])
          : response.data.groups
      userInfo = { ...response.data, groups }
      currentGroups = userInfo.groups
    } else {
      error = response.data
    }
    loaded = true
  }

  const isLoggedIn = (): boolean => {
    return userInfo.loggedIn
  }

  const getIdent = (): string => {
    return userInfo.ident ?? ''
  }

  const getEmail = (): string => {
    return userInfo.email ?? ''
  }

  const getName = (): string => {
    return userInfo.name ?? ''
  }

  const getFirstNameThenLastName = (): string => {
    const splittedName = userInfo.name?.split(', ') ?? ''

    return splittedName[1] + ' ' + splittedName[0]
  }

  const getAvailableGroups = (): { name: string; group: EGroup }[] => {
    return userInfo.groups
      .filter((group) => group !== EGroup.READ)
      .map((group) => ({ name: nameFor(group), group }))
  }

  const toggleGroup = (group: EGroup, active: boolean) => {
    if (active && !hasGroup(group) && userInfo.groups.indexOf(group) >= 0) {
      currentGroups = [...currentGroups, group]
    } else {
      currentGroups = currentGroups.filter((currentGroup) => currentGroup !== group)
    }
  }

  const updateCurrentGroups = (groups: EGroup[]) => {
    currentGroups = groups
  }

  const getGroups = (): string[] => {
    return currentGroups
  }

  const hasGroup = (group: string): boolean => {
    return getGroups().indexOf(group) >= 0
  }

  const canWrite = (): boolean => {
    return hasGroup(EGroup.WRITE)
  }

  const isAdmin = (): boolean => {
    return hasGroup(EGroup.ADMIN)
  }

  const isKraveier = (): boolean => {
    return hasGroup(EGroup.KRAVEIER)
  }

  const isPersonvernombud = (): boolean => {
    return hasGroup(EGroup.PERSONVERNOMBUD)
  }

  const getError = (): string => {
    return error || ''
  }

  const wait = async (): Promise<any> => {
    return await promise
  }

  const isLoaded = (): boolean => {
    return loaded
  }

  return {
    isLoggedIn,
    getIdent,
    getEmail,
    getName,
    getFirstNameThenLastName,
    getAvailableGroups,
    toggleGroup,
    updateCurrentGroups,
    getGroups,
    canWrite,
    isAdmin,
    isKraveier,
    isPersonvernombud,
    getError,
    wait,
    isLoaded,
    hasGroup,
  }
}

interface IUserProps {
  isLoggedIn: () => boolean
  getIdent: () => string
  getEmail: () => string
  getName: () => string
  getFirstNameThenLastName: () => string
  getAvailableGroups: () => { name: string; group: EGroup }[]
  toggleGroup: (group: EGroup, active: boolean) => void
  updateCurrentGroups: (groups: EGroup[]) => void
  hasGroup: (group: string) => boolean
  getGroups: () => string[]
  canWrite: () => boolean
  isAdmin: () => boolean
  isKraveier: () => boolean
  isPersonvernombud: () => boolean
  getError: () => string
  wait: () => Promise<any>
  isLoaded: () => boolean
}

export const user: IUserProps = await UserService().then((response: IUserProps) => {
  return response
})

const nameFor = (group: EGroup) => {
  switch (group) {
    case EGroup.READ:
      return 'Les'
    case EGroup.WRITE:
      return 'Skriv'
    case EGroup.ADMIN:
      return 'Admin'
    case EGroup.KRAVEIER:
      return 'Kraveier'
    case EGroup.PERSONVERNOMBUD:
      return 'Personvernombud'
  }
}
