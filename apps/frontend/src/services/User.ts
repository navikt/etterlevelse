import { AxiosResponse } from 'axios'
import { getUserInfo } from '../api/UserApi'
import { IUserInfo } from '../constants'
import { updateUser } from '../util/hooks/customHooks'

export enum EGroup {
  READ = 'READ',
  WRITE = 'WRITE',
  KRAVEIER = 'KRAVEIER',
  ADMIN = 'ADMIN',
}

const UserService = () => {
  let loaded: boolean
  let userInfo: IUserInfo = { loggedIn: false, groups: [] }
  let currentGroups: EGroup[] = [EGroup.READ]
  let error: string

  const fetchData = async (): Promise<any> => {
    return getUserInfo()
      .then(handleGetResponse)
      .catch((error) => {
        error = error.message
        loaded = true
      })
  }

  const promise: Promise<any> = fetchData()

  const handleGetResponse = (response: AxiosResponse<IUserInfo>) => {
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

  const getError = (): string => {
    return error || ''
  }

  const wait = async (): Promise<any> => {
    await promise
  }

  const isLoaded = (): boolean => {
    return loaded
  }

  return {
    isLoggedIn: isLoggedIn(),
    getIdent: getIdent(),
    getEmail: getEmail(),
    getName: getName(),
    getFirstNameThenLastName: getFirstNameThenLastName(),
    getAvailableGroups: getAvailableGroups(),
    toggleGroup: toggleGroup,
    getGroups: getGroups(),
    canWrite: canWrite(),
    isAdmin: isAdmin(),
    isKraveier: isKraveier(),
    getError: getError(),
    wait: wait(),
    isLoaded: isLoaded(),
  }
}

// class UserService {
//   private loaded = false
//   private userInfo: IUserInfo = { loggedIn: false, groups: [] }
//   private currentGroups = [EGroup.READ]
//   private error?: string
//   private readonly promise: Promise<any>

//   constructor() {
//     this.promise = this.fetchData()
//   }

//   private fetchData = async () => {
//     return getUserInfo()
//       .then(this.handleGetResponse)
//       .catch((err) => {
//         this.error = err.message
//         this.loaded = true
//       })
//   }

//   handleGetResponse = (response: AxiosResponse<IUserInfo>) => {
//     if (typeof response.data === 'object' && response.data !== null) {
//       const groups =
//         response.data.groups.indexOf(EGroup.ADMIN) >= 0
//           ? (Object.keys(EGroup) as EGroup[])
//           : response.data.groups
//       this.userInfo = { ...response.data, groups }
//       this.currentGroups = this.userInfo.groups
//     } else {
//       this.error = response.data
//     }
//     this.loaded = true
//   }

//   isLoggedIn(): boolean {
//     return this.userInfo.loggedIn
//   }

//   public getIdent(): string {
//     return this.userInfo.ident ?? ''
//   }

//   public getEmail(): string {
//     return this.userInfo.email ?? ''
//   }

//   public getName(): string {
//     return this.userInfo.name ?? ''
//   }

//   public getFirstNameThenLastName(): string {
//     const splittedName = this.userInfo.name?.split(', ') ?? ''

//     return splittedName[1] + ' ' + splittedName[0]
//   }

//   public getAvailableGroups(): { name: string; group: EGroup }[] {
//     return this.userInfo.groups
//       .filter((g) => g !== EGroup.READ)
//       .map((group) => ({ name: nameFor(group), group }))
//   }

//   public toggleGroup(group: EGroup, active: boolean) {
//     if (active && !this.hasGroup(group) && this.userInfo.groups.indexOf(group) >= 0) {
//       this.currentGroups = [...this.currentGroups, group]
//       updateUser()
//     } else {
//       this.currentGroups = this.currentGroups.filter((g) => g !== group)
//       updateUser()
//     }
//   }

//   public getGroups(): string[] {
//     return this.currentGroups
//   }

//   public hasGroup(group: string): boolean {
//     return this.getGroups().indexOf(group) >= 0
//   }

//   public canWrite(): boolean {
//     return this.hasGroup(EGroup.WRITE)
//   }

//   public isAdmin(): boolean {
//     return this.hasGroup(EGroup.ADMIN)
//   }

//   public isKraveier(): boolean {
//     return this.hasGroup(EGroup.KRAVEIER)
//   }

//   public getError(): string {
//     return this.error || ''
//   }

//   async wait() {
//     await this.promise
//   }

//   isLoaded(): boolean {
//     return this.loaded
//   }
// }

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
  }
}
