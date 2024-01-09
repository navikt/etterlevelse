import { AxiosResponse } from 'axios'
import { IUserInfo } from '../constants'
import { getUserInfo } from '../api/UserApi'
import { updateUser } from '../util/hooks'

export enum Group {
  READ = 'READ',
  WRITE = 'WRITE',
  KRAVEIER = 'KRAVEIER',
  ADMIN = 'ADMIN',
}

class UserService {
  private loaded = false
  private userInfo: IUserInfo = { loggedIn: false, groups: [] }
  private currentGroups = [Group.READ]
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
      const groups = response.data.groups.indexOf(Group.ADMIN) >= 0 ? (Object.keys(Group) as Group[]) : response.data.groups
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

  public getAvailableGroups(): { name: string; group: Group }[] {
    return this.userInfo.groups.filter((g) => g !== Group.READ).map((group) => ({ name: nameFor(group), group }))
  }

  public toggleGroup(group: Group, active: boolean) {
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
    return this.hasGroup(Group.WRITE)
  }

  public isAdmin(): boolean {
    return this.hasGroup(Group.ADMIN)
  }

  public isKraveier(): boolean {
    return this.hasGroup(Group.KRAVEIER)
  }

  async wait() {
    await this.promise
  }

  isLoaded(): boolean {
    return this.loaded
  }
}

export const user = new UserService()

const nameFor = (group: Group) => {
  switch (group) {
    case Group.READ:
      return 'Les'
    case Group.WRITE:
      return 'Skriv'
    case Group.ADMIN:
      return 'Admin'
    case Group.KRAVEIER:
      return 'Kraveier'
  }
}
