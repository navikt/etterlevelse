import { AxiosResponse } from 'axios'
import { getUserInfo } from '../api/UserApi'
import { IUserInfo } from '../constants'
import { updateUser } from '../util/hooks/customHooks'

export enum EGroup {
  READ = 'READ',
  WRITE = 'WRITE',
  KRAVEIER = 'KRAVEIER',
  RISIKOEIER = 'RISIKOEIER',
  ADMIN = 'ADMIN',
}

class UserService {
  private loaded = false
  private userInfo: IUserInfo = { loggedIn: false, groups: [] }
  private currentGroups = [EGroup.READ]
  private error?: string
  private readonly promise: Promise<any>

  constructor() {
    this.promise = this.fetchData()
  }

  private fetchData = async () => {
    return getUserInfo()
      .then(this.handleGetResponse)
      .catch((err) => {
        this.error = err.message
        this.loaded = true
      })
  }

  handleGetResponse = (response: AxiosResponse<IUserInfo>) => {
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
    return this.userInfo.loggedIn
  }

  public getIdent(): string {
    return this.userInfo.ident ?? ''
  }

  public getEmail(): string {
    return this.userInfo.email ?? ''
  }

  public getName(): string {
    return this.userInfo.name ?? ''
  }

  public getFirstNameThenLastName(): string {
    const splittedName = this.userInfo.name?.split(', ') ?? ''

    return splittedName[1] + ' ' + splittedName[0]
  }

  public getAvailableGroups(): { name: string; group: EGroup }[] {
    return this.userInfo.groups
      .filter((g) => g !== EGroup.READ)
      .map((group) => ({ name: nameFor(group), group }))
  }

  public toggleGroup(group: EGroup, active: boolean) {
    if (active && !this.hasGroup(group) && this.userInfo.groups.indexOf(group) >= 0) {
      this.currentGroups = [...this.currentGroups, group]
      updateUser()
    } else {
      this.currentGroups = this.currentGroups.filter((g) => g !== group)
      updateUser()
    }
  }

  public getGroups(): string[] {
    return this.currentGroups
  }

  public hasGroup(group: string): boolean {
    return this.getGroups().indexOf(group) >= 0
  }

  public canWrite(): boolean {
    return this.hasGroup(EGroup.WRITE)
  }

  public isAdmin(): boolean {
    return this.hasGroup(EGroup.ADMIN)
  }

  public isKraveier(): boolean {
    return this.hasGroup(EGroup.KRAVEIER)
  }

  public isRisikoeier(): boolean {
    return this.hasGroup(EGroup.RISIKOEIER)
  }

  public getError(): string {
    return this.error || ''
  }

  async wait() {
    await this.promise
  }

  isLoaded(): boolean {
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
    case EGroup.RISIKOEIER:
      return 'Risikoeier'
  }
}
