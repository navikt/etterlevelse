import {HeadingLarge, HeadingSmall, LabelLarge} from 'baseui/typography'
import {Block} from 'baseui/block'
import React from 'react'
import {user} from '../services/User'
import {useMyBehandlinger} from '../api/BehandlingApi'
import {ListItem, ListItemLabel} from 'baseui/list'
import {TeamName} from '../components/common/TeamName'
import {useMyTeams} from '../api/TeamApi'
import {ChevronRight} from 'baseui/icon'
import RouteLink from '../components/common/RouteLink'


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
          <React.Fragment key={t.id}>
            <ListItem key={t.id}>
              <ListItemLabel><TeamName id={t.id} link/></ListItemLabel>
            </ListItem>
            {behandlinger.filter(b => b.teams.indexOf(t.id) >= 0).map(b =>
              <ListItem sublist key={b.id} artwork={ChevronRight}>
                <ListItemLabel sublist>
                  <RouteLink href={`/behandling/${b.id}`}>
                    {b.navn}
                  </RouteLink>
                </ListItemLabel>
              </ListItem>
            )}
          </React.Fragment>
        )}
      </ul>
    </Block>
  )
}
