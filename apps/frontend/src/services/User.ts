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

const UserService = async (): Promise<IUserProps> => {
  let loaded: boolean
  let userInfo: IUserInfo = { loggedIn: false, groups: [] }
  let currentGroups: EGroup[] = [EGroup.READ]
  let error: string

  console.log('userService')

  const fetchData: () => Promise<any> = async (): Promise<any> => {
    console.log('fetchData')

    return await getUserInfo()
      .then((response: AxiosResponse<IUserInfo, any>) => {
        console.log('response', response)

        // if (response.status === 200) {
        handleGetResponse(response)
        // }
      })
      .catch((error) => {
        error = error.message
        loaded = true
      })
  }

  fetchData()

  console.log('fetchData2', fetchData())

  let promise: Promise<any> = fetchData()

  console.log('promise', promise)

  const handleGetResponse = (response: AxiosResponse<IUserInfo>): void => {
    console.log('handleGetResponse')

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
  console.log('after handleGetResponse')

  const isLoggedIn = (): boolean => {
    return userInfo.loggedIn
  }
  console.log('after isLoggedIn')
  const getIdent = (): string => {
    return userInfo.ident ?? ''
  }
  console.log('after getIdent')

  const getEmail = (): string => {
    return userInfo.email ?? ''
  }

  console.log('after getEmail')

  const getName = (): string => {
    return userInfo.name ?? ''
  }
  console.log('after getName')

  const getFirstNameThenLastName = (): string => {
    const splittedName = userInfo.name?.split(', ') ?? ''

    return splittedName[1] + ' ' + splittedName[0]
  }
  console.log('after getFirstNameThenLastName')

  const getAvailableGroups = (): { name: string; group: EGroup }[] => {
    return userInfo.groups
      .filter((group) => group !== EGroup.READ)
      .map((group) => ({ name: nameFor(group), group }))
  }

  console.log('after getAvailableGroups')

  const toggleGroup = (group: EGroup, active: boolean) => {
    console.log('toggleGroup')

    if (active && !hasGroup(group) && userInfo.groups.indexOf(group) >= 0) {
      currentGroups = [...currentGroups, group]
      updateUser()
    } else {
      currentGroups = currentGroups.filter((currentGroup) => currentGroup !== group)
      updateUser()
    }
  }
  console.log('after toggleGroup')

  const getGroups = (): string[] => {
    return currentGroups
  }

  console.log('after getGroups')

  const hasGroup = (group: string): boolean => {
    console.log('hasGroup', group)
    return getGroups().indexOf(group) >= 0
  }
  console.log('after hasGroup')

  const canWrite = (): boolean => {
    return hasGroup(EGroup.WRITE)
  }

  console.log('after canWrite')

  const isAdmin = (): boolean => {
    return hasGroup(EGroup.ADMIN)
  }

  console.log('after isAdmin')

  const isKraveier = (): boolean => {
    return hasGroup(EGroup.KRAVEIER)
  }

  console.log('after isKraveier')

  const getError = (): string => {
    return error || ''
  }

  console.log('after getError')

  const wait = async (): Promise<any> => {
    return await promise
  }

  const isLoaded = (): boolean => {
    return loaded
  }

  console.log('after isLoaded')

  return {
    isLoggedIn,
    getIdent,
    getEmail,
    getName,
    getFirstNameThenLastName,
    getAvailableGroups,
    toggleGroup,
    getGroups,
    canWrite,
    isAdmin,
    isKraveier,
    getError,
    wait,
    isLoaded,
    hasGroup,
  }
}

// class UserServic {
//   private loaded = false
//   private userInfo: IUserInfo = { loggedIn: false, groups: [] }
//   private currentGroups = [EGroup.READ]
//   private error?: string
//   private readonly promise: Promise<any>

//   constructor() {
//     console.log('UserServic constructor')

//     this.promise = this.fetchData()
//     console.log('UserServic this.promise', this.promise)
//     console.log('UserServic this.fetchData()', this.fetchData())
//   }

//   private fetchData = async (): Promise<void> => {
//     this.getIdent()
//     console.log('UserServic fetchData')
//     return getUserInfo()
//       .then(this.handleGetResponse)
//       .catch((err) => {
//         console.log('error')

//         this.error = err.message
//         this.loaded = true
//       })
//   }

//   handleGetResponse = (response: AxiosResponse<IUserInfo>) => {
//     console.log('handleGetResponse')

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
//     console.log('isLoggedIn')
//     return this.userInfo.loggedIn
//   }

//   public getIdent(): string {
//     console.log('getEmail')
//     return this.userInfo.ident ?? ''
//   }

//   public getEmail(): string {
//     console.log('getEmail')
//     return this.userInfo.email ?? ''
//   }

//   public getName(): string {
//     console.log('getName')
//     return this.userInfo.name ?? ''
//   }

//   public getFirstNameThenLastName(): string {
//     console.log('getFirstNameThenLastName')

//     const splittedName = this.userInfo.name?.split(', ') ?? ''

//     return splittedName[1] + ' ' + splittedName[0]
//   }

//   public getAvailableGroups(): { name: string; group: EGroup }[] {
//     console.log('getAvailableGroups')

//     return this.userInfo.groups
//       .filter((g) => g !== EGroup.READ)
//       .map((group) => ({ name: nameFor(group), group }))
//   }

//   public toggleGroup(group: EGroup, active: boolean) {
//     console.log('toggleGroup')

//     if (active && !this.hasGroup(group) && this.userInfo.groups.indexOf(group) >= 0) {
//       this.currentGroups = [...this.currentGroups, group]
//       updateUser()
//     } else {
//       this.currentGroups = this.currentGroups.filter((g) => g !== group)
//       updateUser()
//     }
//   }

//   public getGroups(): string[] {
//     console.log('getGroups')
//     return this.currentGroups
//   }

//   public hasGroup(group: string): boolean {
//     console.log('hasGroup')
//     return this.getGroups().indexOf(group) >= 0
//   }

//   public canWrite(): boolean {
//     console.log('canWrite')
//     return this.hasGroup(EGroup.WRITE)
//   }

//   public isAdmin(): boolean {
//     console.log('isAdmin')
//     return this.hasGroup(EGroup.ADMIN)
//   }

//   public isKraveier(): boolean {
//     console.log('isKraveier')
//     return this.hasGroup(EGroup.KRAVEIER)
//   }

//   public getError(): string {
//     console.log('getError')
//     return this.error || ''
//   }

//   async wait() {
//     console.log('wait', this.promise)
//     await this.promise
//   }

//   isLoaded(): boolean {
//     console.log('isLoaded')
//     return this.loaded
//   }
// }

// interface IUserProps2 {
//   // currentGroups: EGroup
//   error: any
//   fetchData: () => {}
//   handleGetResponse: () => {}
//   loaded: boolean
//   promise: Promise<any>
//   userInfo: {
//     email: string
//     groups: EGroup
//     ident: string
//     loggedIn: boolean
//     name: string
//   }
// }

// export const user = new UserServic()

interface IUserProps {
  isLoggedIn: () => boolean
  getIdent: () => string
  getEmail: () => string
  getName: () => string
  getFirstNameThenLastName: () => string
  getAvailableGroups: () => { name: string; group: EGroup }[]
  toggleGroup: (group: EGroup, active: boolean) => void
  hasGroup: (group: string) => boolean
  getGroups: () => string[]
  canWrite: () => boolean
  isAdmin: () => boolean
  isKraveier: () => boolean
  getError: () => string
  wait: () => Promise<any>
  isLoaded: () => boolean
}

// export const user: IUserProps = {
//   isLoggedIn,
//   getIdent,
//   getEmail,
//   getName,
//   getFirstNameThenLastName,
//   getAvailableGroups,
//   toggleGroup,
//   hasGroup,
//   getGroups,
//   canWrite,
//   isAdmin,
//   isKraveier,
//   getError,
//   wait,
//   isLoaded,
// }

// export const user = () => {
//   return {
//     currentGroups: Array(4) [ "READ", "WRITE", "KRAVEIER", … ]
//     error: undefined
//     fetchData: function _asyncToGenerator()​,
//     handleGetResponse: function handleGetResponse(response),
//     loaded: true,
//     promise: Promise { <state>: "fulfilled", <value>: undefined },
//     userInfo: {
//       email: "Rebecca.Soraya.Gjerstad@nav.no",
// groups: Array(4) [ "READ", "WRITE", "KRAVEIER", … ],
// ident: "G166656",
// ​​
// loggedIn: true,
// ​​
// name: "Gjerstad, Rebecca Soraya",
//     }
//   }
// }

export const user: IUserProps = await UserService().then((response: IUserProps) => {
  return response
})

export const fetchUserService = async (): Promise<void> => {
  await UserService()
}

// export const user = async (): Promise<IUserProps> => {
//   console.log('user')

//   const userData: IUserProps = await UserService()

//   console.log('userData', userData)

//   const user: IUserProps = {
//     isLoggedIn: userData?.isLoggedIn(),
//     getIdent: userData?.getIdent,
//     getEmail: userData?.getEmail,
//     getName: userData?.getName,
//     getFirstNameThenLastName: userData?.getFirstNameThenLastName,
//     getAvailableGroups: userData?.getAvailableGroups,
//     toggleGroup: userData?.toggleGroup,
//     hasGroup: userData?.hasGroup,
//     getGroups: userData?.getGroups,
//     canWrite: userData?.canWrite,
//     isAdmin: userData?.isAdmin,
//     isKraveier: userData?.isKraveier,
//     getError: userData?.getError,
//     wait: userData?.wait,
//     isLoaded: userData?.isLoaded,
//   }

//   console.log('user', user)

//   return user
// }

// export const user = {
//   getIdent,
//   getEmail,
//   getName,
//   getFirstNameThenLastName,
//   getAvailableGroups,
//   toggleGroup,
//   getGroups,
//   canWrite,
//   isAdmin,
//   isKraveier,
//   getError,
//   wait,
//   isLoaded,
// }

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
