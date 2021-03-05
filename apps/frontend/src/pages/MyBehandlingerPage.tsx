import {HeadingMedium, HeadingSmall, LabelLarge, LabelSmall, LabelXSmall} from 'baseui/typography'
import {Block} from 'baseui/block'
import React, {useState} from 'react'
import {user} from '../services/User'
import {useMyBehandlinger, useSearchBehandling} from '../api/BehandlingApi'
import {ListItem, ListItemLabel} from 'baseui/list'
import {TeamName} from '../components/common/TeamName'
import {useMyTeams} from '../api/TeamApi'
import RouteLink from '../components/common/RouteLink'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTimesCircle, faUsers} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../util'
import Button from '../components/common/Button'
import {Spinner} from '../components/common/Spinner'
import {Behandling, emptyPage, PageResponse} from '../constants'
import {StatefulInput} from 'baseui/input'
import {gql, useQuery} from '@apollo/client'


export const MyBehandlingerPage = () => {
  const [myBehandlinger, myBehandlingerLoadin] = useMyBehandlinger()
  const [teams, teamsLoading] = useMyTeams()

  const loggedIn = user.isLoggedIn()
  const loading = myBehandlingerLoadin || teamsLoading

  return (
    <>
      <Block display='flex' flexWrap flexDirection='row' justifyContent='space-between' width='100%'>

        {loggedIn && <Block marginLeft={theme.sizing.scale800} maxWidth='600px'>
          <HeadingMedium>Mine behandlinger</HeadingMedium>
          <HeadingSmall>Team</HeadingSmall>
          {loading && <Spinner size={theme.sizing.scale800}/>}
          {!loading && !teams.length && <LabelLarge>Du er ikke medlem av noen team</LabelLarge>}
          <ul>
            {teams.map(t =>
              <Block key={t.id} marginBottom={theme.sizing.scale800}>
                <ListItem key={t.id} artwork={() => <FontAwesomeIcon icon={faUsers} color={theme.colors.positive300}/>}
                          overrides={{Root: {style: {backgroundColor: 'inherit'}}}}>
                  <ListItemLabel><TeamName id={t.id} link/></ListItemLabel>
                </ListItem>
                <Block paddingLeft={theme.sizing.scale700}>
                  {myBehandlinger.filter(b => b.teams.indexOf(t.id) >= 0).map(b =>
                    <BehandlingListItem key={b.id} behandling={b}/>
                  )}
                </Block>
              </Block>
            )}
          </ul>
        </Block>}

        {!loggedIn && <Block display='flex' flexDirection='column'>
          <LabelLarge>Du må logge inn for å se dine behandlinger</LabelLarge>
          <Alle/>
        </Block>
        }
      </Block>

    </>
  )
}

const Alle = () => {
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const {data, loading: loadingAll} = useQuery<{behandlinger: PageResponse<Behandling>}>(query, {variables: {pageNumber, pageSize}})
  const allBehandlinger = data?.behandlinger || emptyPage
  const [search, setSearch, searchLoading, searchTerm] = useSearchBehandling()

  const prev = () => setPage(Math.max(0, pageNumber - 1))
  const next = () => setPage(Math.min(allBehandlinger?.pages ? allBehandlinger.pages - 1 : 0, pageNumber + 1))

  return (
    <Block maxWidth='600px'>
      <HeadingMedium>Alle behandlinger</HeadingMedium>

      <Block maxWidth='500px' marginBottom={theme.sizing.scale1000}>
        <StatefulInput size='compact' placeholder='Søk' onChange={e => setSearch((e.target as HTMLInputElement).value)}
                       endEnhancer={
                         <Button onClick={() => setSearch('')} size='compact' kind='tertiary'><FontAwesomeIcon icon={faTimesCircle}/></Button>
                       }/>
        {searchLoading && <Block marginTop={theme.sizing.scale400}><Spinner size={theme.sizing.scale600}/></Block>}
      </Block>
      {!!searchTerm && <Block>
        <LabelSmall>Søkeresultat</LabelSmall>
        {search.map(b => <BehandlingListItem key={b.id} behandling={b}/>)}
        {!search.length && <LabelXSmall>Ingen treff</LabelXSmall>}
      </Block>}

      {!searchTerm && <Block>
        {allBehandlinger.content.map(b => <BehandlingListItem key={b.id} behandling={b}/>)}
        {loadingAll && !allBehandlinger && <Spinner size={theme.sizing.scale800}/>}

        <Block display='flex' alignItems='center' marginTop={theme.sizing.scale1000}>
          <LabelSmall marginRight={theme.sizing.scale400}>Side {allBehandlinger.pageNumber + 1}/{allBehandlinger.pages}</LabelSmall>
          <Button onClick={prev} size='compact' disabled={allBehandlinger.pageNumber === 0}>Forrige</Button>
          <Button onClick={next} size='compact' disabled={allBehandlinger.pageNumber >= allBehandlinger.pages - 1}>Neste</Button>
        </Block>
      </Block>
      }
    </Block>
  )
}

const BehandlingListItem = (props: {behandling: Behandling}) =>
  <ListItem sublist overrides={{Root: {style: {backgroundColor: 'inherit'}}}}>
    <ListItemLabel sublist>
      <RouteLink href={`/behandling/${props.behandling.id}`}>
        {props.behandling.nummer}: {props.behandling.overordnetFormaal.shortName} - {props.behandling.navn}
      </RouteLink>
    </ListItemLabel>
  </ListItem>

const query = gql`
  query getBehandling($relevans: [String!], $pageNumber: NonNegativeInt, $pageSize: NonNegativeInt){
    behandlinger: behandling(filter: {relevans: $relevans}, pageNumber: $pageNumber, pageSize: $pageSize) {
      pageNumber
      pageSize
      pages
      content {
        id
        navn
        nummer
        overordnetFormaal {
          shortName
        }
      }

    }
  }
`
