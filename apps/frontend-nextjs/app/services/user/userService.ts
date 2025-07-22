import { getUserInfo } from '@/api/userApi/userApi'
import { IUserInfo } from '@/constants/user/userConstants'
import { updateUser } from '@/util/hooks/customHooks/customHooks'
import { AxiosResponse } from 'axios'

export enum EGroup {
  READ = 'READ',
  WRITE = 'WRITE',
  KRAVEIER = 'KRAVEIER',
  PERSONVERNOMBUD = 'PERSONVERNOMBUD',
  ADMIN = 'ADMIN',
}

class UserService {
  private loaded: boolean = false
  private userInfo: IUserInfo = { loggedIn: false, groups: [] }
  private currentGroups = [EGroup.READ]
  private error?: string
  private readonly promise: Promise<any>

  constructor() {
    this.promise = this.fetchData()
  }

  private fetchData = async () => {
    return getUserInfo()
      .then((response: AxiosResponse<IUserInfo, any>) => {
        if (response.status === 200) {
          this.handleGetResponse(response)
        }
      })
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

export const user = new UserService()

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
