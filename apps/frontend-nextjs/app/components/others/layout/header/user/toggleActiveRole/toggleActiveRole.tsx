import { EGroup, UserContext } from '@/provider/user/userProvider'
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import { Button, Switch } from '@navikt/ds-react'
import { ChangeEvent, useContext, useEffect, useState } from 'react'

export const ToggleActiveRole = () => {
  const [viewRoller, setViewRoller] = useState(true)
  const { getAvailableGroups, updateCurrentGroups, toggleGroup, getGroups, hasGroup } =
    useContext(UserContext)
  const isAdmin: boolean =
    getAvailableGroups().filter((role) => role.group === 'ADMIN').length !== 0

  useEffect(() => {
    if (isAdmin) {
      const roles: string | null = sessionStorage.getItem('activeRoles')
      if (roles) {
        const parsedRoles = JSON.parse(roles)
        if (parsedRoles.length !== 0) {
          updateCurrentGroups(parsedRoles)
        }
      }
    }
  }, [])

  const onRoleChange = (group: EGroup, isChecked: boolean): void => {
    toggleGroup(group, isChecked)
    if (isAdmin) {
      sessionStorage.setItem('activeRoles', JSON.stringify(getGroups()))
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
        {getAvailableGroups().map((availableGroup: { name: string; group: EGroup }) => (
          <Switch
            size='small'
            key={availableGroup.group}
            checked={hasGroup(availableGroup.group)}
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
