import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import { Button, Switch } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { EGroup, user } from '../../services/User'

export const ToggleActiveRole = () => {
  const [viewRoller, setViewRoller] = useState(false)
  const isAdmin = user.getAvailableGroups().filter((role) => role.group === 'ADMIN').length !== 0

  useEffect(() => {
    if (isAdmin) {
      const roles = localStorage.getItem('activeRoles')
      if (roles) {
        const parsedRoles = JSON.parse(roles)
        if (parsedRoles.length !== 0) {
          user.updateCurrentGroups(parsedRoles)
        }
      }
    }
  }, [])

  const onRoleChange = (group: EGroup, isChecked: boolean) => {
    user.toggleGroup(group, isChecked)
    if (isAdmin) {
      localStorage.setItem('activeRoles', JSON.stringify(user.getGroups()))
    }
  }

  return (
    <div>
      <Button
        size={'xsmall'}
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
        {user.getAvailableGroups().map((availableGroup) => {
          return (
            <Switch
              size='small'
              key={availableGroup.group}
              checked={user.hasGroup(availableGroup.group)}
              onChange={(event) =>
                onRoleChange(availableGroup.group, (event.target as HTMLInputElement).checked)
              }
            >
              {availableGroup.name}
            </Switch>
          )
        })}
      </div>
    </div>
  )
}
export default ToggleActiveRole
