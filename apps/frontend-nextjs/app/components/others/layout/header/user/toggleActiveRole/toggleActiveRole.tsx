import { EGroup, user } from '@/services/user/user'
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import { Button, Switch } from '@navikt/ds-react'
import { ChangeEvent, useEffect, useState } from 'react'

export const ToggleActiveRole = () => {
  const [viewRoller, setViewRoller] = useState(true)
  const isAdmin: boolean =
    user.getAvailableGroups().filter((role) => role.group === 'ADMIN').length !== 0

  useEffect(() => {
    if (isAdmin) {
      const roles: string | null = sessionStorage.getItem('activeRoles')
      if (roles) {
        const parsedRoles = JSON.parse(roles)
        if (parsedRoles.length !== 0) {
          user.updateCurrentGroups(parsedRoles)
        }
      }
    }
  }, [])

  const onRoleChange = (group: EGroup, isChecked: boolean): void => {
    user.toggleGroup(group, isChecked)
    if (isAdmin) {
      sessionStorage.setItem('activeRoles', JSON.stringify(user.getGroups()))
    }
  }

  return (
    <div>
      <Button
        size='xsmall'
        variant='tertiary'
        onClick={() => setViewRoller(!viewRoller)}
        icon={
          viewRoller ? (
            <ChevronUpIcon area-label='' aria-hidden />
          ) : (
            <ChevronDownIcon area-label='' aria-hidden />
          )
        }
      >
        Endre aktive roller
      </Button>
      <div className={`mt-2 ${viewRoller ? 'block' : 'hidden'}`}>
        {user.getAvailableGroups().map((availableGroup) => (
          <Switch
            size='small'
            key={availableGroup.group}
            checked={user.hasGroup(availableGroup.group)}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onRoleChange(availableGroup.group, (event.target as HTMLInputElement).checked)
            }
          >
            {availableGroup.name}
          </Switch>
        ))}
      </div>
    </div>
  )
}
