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

const UserService = async () => {
  let loaded: boolean
  let userInfo: IUserInfo = { loggedIn: false, groups: [] }
  let currentGroups: EGroup[] = [EGroup.READ]
  let error: string

  console.log('userService')

  const fetchData = async (): Promise<any> => {
    console.log('getUserInfo', getUserInfo())

    return await getUserInfo()
      .then(handleGetResponse)
      .catch((error) => {
        error = error.message
        loaded = true
      })
  }

  console.log('fetchData', fetchData())

  // const [data, setData] = useState<any>()

  // console.log('setData', setData)

  // useEffect(() => {
  //   console.log('useEffect')

  //   const fetchData = async (): Promise<any> => {
  //     console.log('getUserInfo', getUserInfo)

  //     return getUserInfo()
  //       .then(handleGetResponse)
  //       .catch((error) => {
  //         error = error.message
  //         loaded = true
  //       })
  //   }

  //   setData(fetchData)
  // }, [data])

  let promise = await fetchData()

  const handleGetResponse = (response: AxiosResponse<IUserInfo>) => {
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
  console.log('handleGetResponse')

  const isLoggedIn = (): boolean => {
    return userInfo.loggedIn
  }
  console.log('isLoggedIn')

  const getIdent = (): string => {
    return userInfo.ident ?? ''
  }
  console.log('getIdent')

  const getEmail = (): string => {
    return userInfo.email ?? ''
  }
  console.log('getEmail')

  const getName = (): string => {
    return userInfo.name ?? ''
  }
  console.log('getName')

  const getFirstNameThenLastName = (): string => {
    const splittedName = userInfo.name?.split(', ') ?? ''

    return splittedName[1] + ' ' + splittedName[0]
  }
  console.log('getFirstNameThenLastName')

  const getAvailableGroups = (): { name: string; group: EGroup }[] => {
    return userInfo.groups
      .filter((group) => group !== EGroup.READ)
      .map((group) => ({ name: nameFor(group), group }))
  }
  console.log('getAvailableGroups')

  const toggleGroup = (group: EGroup, active: boolean) => {
    if (active && !hasGroup(group) && userInfo.groups.indexOf(group) >= 0) {
      currentGroups = [...currentGroups, group]
      updateUser()
    } else {
      currentGroups = currentGroups.filter((currentGroup) => currentGroup !== group)
      updateUser()
    }
  }
  console.log('toggleGroup')

  const getGroups = (): string[] => {
    return currentGroups
  }
  console.log('getGroups')

  const hasGroup = (group: string): boolean => {
    return getGroups().indexOf(group) >= 0
  }
  console.log('hasGroup')

  const canWrite = (): boolean => {
    return hasGroup(EGroup.WRITE)
  }
  console.log('canWrite')

  const isAdmin = (): boolean => {
    return hasGroup(EGroup.ADMIN)
  }
  console.log('isAdmin')

  const isKraveier = (): boolean => {
    return hasGroup(EGroup.KRAVEIER)
  }
  console.log('isKraveier')

  const getError = (): string => {
    return error || ''
  }
  console.log('getError')

  const wait = async (): Promise<any> => {
    await promise
  }

  const isLoaded = (): boolean => {
    return loaded
  }

  console.log('isLoaded')

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
  }
}

class UserServic {
  private loaded = false
  private userInfo: IUserInfo = { loggedIn: false, groups: [] }
  private currentGroups = [EGroup.READ]
  private error?: string
  private readonly promise: Promise<any>

  constructor() {
    console.log('constructor')

    this.promise = this.fetchData()
    console.log('this.promise', this.promise)
    console.log('this.fetchData()', this.fetchData())
  }

  private fetchData = async () => {
    console.log('fetchData')
    return getUserInfo()
      .then(this.handleGetResponse)
      .catch((err) => {
        this.error = err.message
        this.loaded = true
      })
  }

  handleGetResponse = (response: AxiosResponse<IUserInfo>) => {
    console.log('handleGetResponse')

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

  isLoggedIn(): boolean {
    console.log('isLoggedIn')
    return this.userInfo.loggedIn
  }

  public getIdent(): string {
    console.log('getEmail')
    return this.userInfo.ident ?? ''
  }

  public getEmail(): string {
    console.log('getEmail')
    return this.userInfo.email ?? ''
  }

  public getName(): string {
    console.log('getName')
    return this.userInfo.name ?? ''
  }

  public getFirstNameThenLastName(): string {
    console.log('getFirstNameThenLastName')

    const splittedName = this.userInfo.name?.split(', ') ?? ''

    return splittedName[1] + ' ' + splittedName[0]
  }

  public getAvailableGroups(): { name: string; group: EGroup }[] {
    console.log('getAvailableGroups')

    return this.userInfo.groups
      .filter((g) => g !== EGroup.READ)
      .map((group) => ({ name: nameFor(group), group }))
  }

  public toggleGroup(group: EGroup, active: boolean) {
    console.log('toggleGroup')

    if (active && !this.hasGroup(group) && this.userInfo.groups.indexOf(group) >= 0) {
      this.currentGroups = [...this.currentGroups, group]
      updateUser()
    } else {
      this.currentGroups = this.currentGroups.filter((g) => g !== group)
      updateUser()
    }
  }

  public getGroups(): string[] {
    console.log('getGroups')
    return this.currentGroups
  }

  public hasGroup(group: string): boolean {
    console.log('hasGroup')
    return this.getGroups().indexOf(group) >= 0
  }

  public canWrite(): boolean {
    console.log('canWrite')
    return this.hasGroup(EGroup.WRITE)
  }

  public isAdmin(): boolean {
    console.log('isAdmin')
    return this.hasGroup(EGroup.ADMIN)
  }

  public isKraveier(): boolean {
    console.log('isKraveier')
    return this.hasGroup(EGroup.KRAVEIER)
  }

  public getError(): string {
    console.log('getError')
    return this.error || ''
  }

  async wait() {
    console.log('wait')
    await this.promise
  }

  isLoaded(): boolean {
    console.log('isLoaded')
    return this.loaded
  }
}

// export const user = new UserService()

export const user = UserService()

// export const user = {
//   isLoggedIn,
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
