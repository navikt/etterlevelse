import {AxiosResponse} from "axios";
import {UserInfo} from "../constants";
import {getUserInfo} from "../api/userApi";

export enum Group {
  READ = "READ",
  WRITE = "WRITE",
  ADMIN = "ADMIN"
}

class UserService {
  loaded = false;
  userInfo: UserInfo = {loggedIn: false, groups: []};
  error?: string;
  promise: Promise<any>;

  constructor() {
    this.promise = this.fetchData();
  }

  private fetchData = async () => {
    return getUserInfo()
    .then(this.handleGetResponse)
    .catch(err => {
      this.error = err.message;
      this.loaded = true;
    });
  };

  handleGetResponse = (response: AxiosResponse<UserInfo>) => {
    if (typeof response.data === "object" && response.data !== null) {
      this.userInfo = response.data;
    } else {
      this.error = response.data;
    }
    this.loaded = true;
  };

  isLoggedIn(): boolean {
    return this.userInfo.loggedIn;
  }

  public getIdent(): string {
    return this.userInfo.ident ?? "";
  }

  public getEmail(): string {
    return this.userInfo.email ?? "";
  }

  public getName(): string {
    return this.userInfo.name ?? "";
  }

  public getGivenName(): string {
    return this.userInfo.givenName ?? "";
  }

  public getFamilyName(): string {
    return this.userInfo.familyName ?? "";
  }

  public getGroups(): string[] {
    return this.userInfo.groups;
  }

  // public getGroupsHumanReadable(): string[] {
  //   return this.userInfo.groups.map(group => (intl as any)[group] || group)
  // }

  public hasGroup(group: string): boolean {
    return this.getGroups().indexOf(group) >= 0;
  }

  public canRead(): boolean {
    return this.hasGroup(Group.READ);
  }

  public canWrite(): boolean {
    return this.hasGroup(Group.WRITE);
  }

  public isAdmin(): boolean {
    return this.hasGroup(Group.ADMIN);
  }

  async wait() {
    await this.promise;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

export const user = new UserService();
