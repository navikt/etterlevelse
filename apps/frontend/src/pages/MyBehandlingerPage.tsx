import {HeadingLarge, HeadingSmall, LabelLarge, LabelSmall} from 'baseui/typography'
import {Block} from 'baseui/block'
import React, {useState} from 'react'
import {user} from '../services/User'
import {useBehandlingFilter, useMyBehandlinger} from '../api/BehandlingApi'
import {ListItem, ListItemLabel} from 'baseui/list'
import {TeamName} from '../components/common/TeamName'
import {useMyTeams} from '../api/TeamApi'
import RouteLink from '../components/common/RouteLink'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGlassCheers, faUsers} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../util'
import {gql} from 'graphql.macro'
import Button from '../components/common/Button'
import {Spinner} from '../components/common/Spinner'


export const MyBehandlingerPage = () => {
  const behandlinger = useMyBehandlinger()
  const teams = useMyTeams()
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const [allBehandlinger, loadingAll] = useBehandlingFilter({pageNumber, pageSize}, query)

  const prev = () => setPage(Math.max(0, pageNumber - 1))
  const next = () => setPage(Math.min(allBehandlinger?.pages ? allBehandlinger.pages - 1 : 0, pageNumber + 1))

  const loggedIn = user.isLoggedIn()

  return (
    <>
      <HeadingLarge>Mine behandlinger</HeadingLarge>
      {!loggedIn && <LabelLarge>Du må logge inn for å se dine behandlinger</LabelLarge>}

      <Block display='flex' flexWrap flexDirection='row'>

        <Block maxWidth='600px'>
          <HeadingSmall>Alle behandlinger</HeadingSmall>
          {loadingAll && <Spinner size={theme.sizing.scale800}/>}
          {allBehandlinger.content.map(b =>
            <ListItem sublist key={b.id} artwork={() => <FontAwesomeIcon icon={faGlassCheers} color={theme.colors.negative400}/>}>
              <ListItemLabel sublist>
                <RouteLink href={`/behandling/${b.id}`}>
                  {b.overordnetFormaal.shortName} - {b.navn}
                </RouteLink>
              </ListItemLabel>
            </ListItem>
          )}

          <Block display='flex' alignItems='center' marginTop={theme.sizing.scale1000}>
            <LabelSmall marginRight={theme.sizing.scale400}>Side {allBehandlinger.pageNumber + 1}/{allBehandlinger.pages}</LabelSmall>
            <Button onClick={prev} size='compact' disabled={allBehandlinger.pageNumber === 0}>Forrige</Button>
            <Button onClick={next} size='compact' disabled={allBehandlinger.pageNumber >= allBehandlinger.pages - 1}>Neste</Button>
          </Block>
        </Block>

        <Block marginLeft={theme.sizing.scale800} maxWidth='600px'>
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
                          {b.overordnetFormaal.shortName} - {b.navn}
                        </RouteLink>
                      </ListItemLabel>
                    </ListItem>
                  )}
                </Block>
              </Block>
            )}
          </ul>
        </Block>
      </Block>

    </>
  )
}

const query = gql`
  query getBehandling($relevans: [String!], $pageNumber: NonNegativeInt, $pageSize: NonNegativeInt){
    behandling(filter: {relevans: $relevans}, pageNumber: $pageNumber, pageSize: $pageSize) {
      pageNumber
      pageSize
      pages
      content {
        id
        navn
        overordnetFormaal {
          shortName
        }
      }

    }
  }
`
