import {HeadingLarge, HeadingSmall, LabelLarge} from 'baseui/typography'
import {Block} from 'baseui/block'
import React from 'react'
import {user} from '../services/User'
import {useMyBehandlinger} from '../api/BehandlingApi'
import {ListItem, ListItemLabel} from 'baseui/list'
import {TeamName} from '../components/common/TeamName'
import {useMyTeams} from '../api/TeamApi'


export const MyBehandlingerPage = () => {
  const behandlinger = useMyBehandlinger()
  const teams = useMyTeams()

  const loggedIn = user.isLoggedIn()

  return (
    <Block>
      <HeadingLarge>Mine behandlinger</HeadingLarge>
      {!loggedIn && <LabelLarge>Du må logge inn for å se dine behandlinger</LabelLarge>}

      <HeadingSmall>Team</HeadingSmall>
      <ul>
        {teams.map(t =>
          <ListItem key={t.id}>
            <ListItemLabel><TeamName id={t.id} link/></ListItemLabel>
            <ul>
              {behandlinger.filter(b => b.teams.indexOf(t.id) >= 0).map(b =>
                <ListItem key={b.id}>
                  <ListItemLabel sublist>{b.navn}</ListItemLabel>
                </ListItem>
              )}
            </ul>
          </ListItem>
        )}
      </ul>
    </Block>
  )
}
