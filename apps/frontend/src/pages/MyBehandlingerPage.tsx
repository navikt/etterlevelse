import {HeadingLarge, HeadingSmall, LabelLarge} from 'baseui/typography'
import {Block} from 'baseui/block'
import React from 'react'
import {user} from '../services/User'
import {useMyBehandlinger} from '../api/BehandlingApi'
import {ListItem, ListItemLabel} from 'baseui/list'
import {TeamName} from '../components/common/TeamName'
import {useMyTeams} from '../api/TeamApi'
import RouteLink from '../components/common/RouteLink'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGlassCheers, faUsers} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../util'


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
          <Block key={t.id} marginBottom={theme.sizing.scale800}>
            <ListItem key={t.id} artwork={() => <FontAwesomeIcon icon={faUsers} color={theme.colors.positive300}/>}>
              <ListItemLabel><TeamName id={t.id} link/></ListItemLabel>
            </ListItem>
            <Block paddingLeft={theme.sizing.scale700}>
            {behandlinger.filter(b => b.teams.indexOf(t.id) >= 0).map(b =>
              <ListItem sublist key={b.id} artwork={() => <FontAwesomeIcon icon={faGlassCheers} color={theme.colors.negative400}/>}>
                <ListItemLabel sublist>
                  <RouteLink href={`/behandling/${b.id}`}>
                    {b.navn}
                  </RouteLink>
                </ListItemLabel>
              </ListItem>
            )}
            </Block>
          </Block>
        )}
      </ul>
    </Block>
  )
}
