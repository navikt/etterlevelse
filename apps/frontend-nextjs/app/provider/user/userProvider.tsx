'use client'

import { getUserInfo } from '@/api/user/userApi'
import { IUserInfo } from '@/constants/user/userConstants'
import { AxiosResponse } from 'axios'
import { FunctionComponent, ReactNode, createContext, useEffect, useState } from 'react'

interface IUserContext {
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
  isLoaded: () => boolean
  getUserRoleText: () => string
  wait: () => Promise<any>
}

export const UserContext = createContext<IUserContext>({
  isLoggedIn: () => false,
  getIdent: () => '',
  getEmail: () => '',
  getName: () => '',
  getFirstNameThenLastName: () => '',
  getAvailableGroups: () => [],
  toggleGroup: () => {},
  updateCurrentGroups: () => {},
  hasGroup: () => false,
  getGroups: () => [],
  canWrite: () => false,
  isAdmin: () => false,
  isKraveier: () => false,
  isPersonvernombud: () => false,
  getError: () => '',
  isLoaded: () => false,
  getUserRoleText: () => 'Gjest',
  wait: async () => {},
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

type TProps = {
  children: ReactNode
}

export const UserProvider: FunctionComponent<TProps> = ({ children }) => {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [userInfo, setUserInfo] = useState<IUserInfo>({ loggedIn: false, groups: [] })
  const [currentGroups, setCurrentGroups] = useState<EGroup[]>([EGroup.READ])
  const [error, setError] = useState<string>('')

  const handleGetResponse = (response: AxiosResponse<IUserInfo>): void => {
    if (typeof response.data === 'object' && response.data !== null) {
      const groups =
        response.data.groups.indexOf(EGroup.ADMIN) >= 0
          ? (Object.keys(EGroup) as EGroup[])
          : response.data.groups

      setUserInfo({ ...response.data, groups })
      setCurrentGroups(groups)
    } else {
      setError(response.data)
    }
    setLoaded(true)
  }

  const fetchUserInfo = async () => {
    await getUserInfo()
      .then((response: AxiosResponse<IUserInfo, any>) => {
        if (response.status === 200) {
          handleGetResponse(response)
        }
      })
      .catch((error) => {
        error = error.message
        console.debug({ error })
        setLoaded(true)
      })
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
      setCurrentGroups([...currentGroups, group])
    } else {
      setCurrentGroups(currentGroups.filter((currentGroup) => currentGroup !== group))
    }
  }

  const updateCurrentGroups = (groups: EGroup[]) => {
    setCurrentGroups(groups)
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

  const isLoaded = (): boolean => {
    return loaded
  }

  const getUserRoleText = () => {
    if (isAdmin()) return 'Admin'
    else if (isKraveier()) return 'Kraveier'
    else if (isPersonvernombud()) return 'Personverombud'
    else if (canWrite()) return 'Etterlever'
    else return 'Gjest'
  }

  const wait = async (): Promise<any> => {
    return await fetchUserInfo()
  }

  useEffect(() => {
    ;(async () => {
      await fetchUserInfo()
    })()
  }, [])

  return (
    <UserContext.Provider
      value={{
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
        isLoaded,
        hasGroup,
        getUserRoleText,
        wait,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export enum EGroup {
  READ = 'READ',
  WRITE = 'WRITE',
  KRAVEIER = 'KRAVEIER',
  PERSONVERNOMBUD = 'PERSONVERNOMBUD',
  ADMIN = 'ADMIN',
}
