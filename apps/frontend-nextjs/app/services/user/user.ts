import { getUserInfo } from '@/api/other/userApi/userApi'
import { IUserInfo } from '@/constants/user/constants'
import { updateUser } from '@/util/hooks/customHooks/customHooks'
import { AxiosResponse } from 'axios'

export enum EGroup {
  READ = 'READ',
  WRITE = 'WRITE',
  KRAVEIER = 'KRAVEIER',
  PERSONVERNOMBUD = 'PERSONVERNOMBUD',
  ADMIN = 'ADMIN',
}

class ReUserService {
  private loaded: boolean = false
  private userInfo: IUserInfo = { loggedIn: false, groups: [] }
  private currentGroups = [EGroup.READ]
  private error?: string
  private readonly promise: Promise<any>

  constructor() {
    this.promise = this.fetchData()
  }

  private fetchData = async () => {
    return await getUserInfo()
      .then(this.handleGetResponse)
      .catch((err) => {
        this.error = err.message
        this.loaded = true
      })
  }

  handleGetResponse = (response: AxiosResponse<IUserInfo>): void => {
    if (typeof response.data === 'object' && response.data !== null) {
      const groups =
        response.data.groups.indexOf(EGroup.ADMIN) >= 0
          ? (Object.keys(EGroup) as EGroup[])
          : response.data.groups
      this.userInfo = { ...response.data, groups }
      this.currentGroups = this.userInfo.groups
    } else {
      this.error = response.data
    }
    this.loaded = true
  }

  isLoggedIn = (): boolean => {
    return this.userInfo.loggedIn
  }

  getIdent = (): string => {
    return this.userInfo.ident ?? ''
  }

  getEmail = (): string => {
    return this.userInfo.email ?? ''
  }

  getName = (): string => {
    return this.userInfo.name ?? ''
  }

  getFirstNameThenLastName = (): string => {
    const splittedName = this.userInfo.name?.split(', ') ?? ''

    return splittedName[1] + ' ' + splittedName[0]
  }

  getAvailableGroups = (): { name: string; group: EGroup }[] => {
    return this.userInfo.groups
      .filter((group) => group !== EGroup.READ)
      .map((group) => ({ name: nameFor(group), group }))
  }

  toggleGroup = (group: EGroup, active: boolean) => {
    if (active && !this.hasGroup(group) && this.userInfo.groups.indexOf(group) >= 0) {
      this.currentGroups = [...this.currentGroups, group]
      updateUser()
    } else {
      this.currentGroups = this.currentGroups.filter((currentGroup) => currentGroup !== group)
      updateUser()
    }
  }

  updateCurrentGroups = (groups: EGroup[]) => {
    this.currentGroups = groups
    updateUser()
  }

  getGroups = (): string[] => {
    return this.currentGroups
  }

  hasGroup = (group: string): boolean => {
    return this.getGroups().indexOf(group) >= 0
  }

  canWrite = (): boolean => {
    return this.hasGroup(EGroup.WRITE)
  }

  isAdmin = (): boolean => {
    return this.hasGroup(EGroup.ADMIN)
  }

  isKraveier = (): boolean => {
    return this.hasGroup(EGroup.KRAVEIER)
  }

  isPersonvernombud = (): boolean => {
    return this.hasGroup(EGroup.PERSONVERNOMBUD)
  }

  getError = (): string => {
    return this.error || ''
  }

  wait = async (): Promise<any> => {
    return await this.promise
  }

  isLoaded = (): boolean => {
    return this.loaded
  }
}

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
      updateUser()
    } else {
      currentGroups = currentGroups.filter((currentGroup) => currentGroup !== group)
      updateUser()
    }
  }

  const updateCurrentGroups = (groups: EGroup[]) => {
    currentGroups = groups
    updateUser()
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
