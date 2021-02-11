import {Spinner} from './Spinner'
import {theme} from '../../util'
import {Cell, Row, Table} from './Table'
import RouteLink from './RouteLink'
import React from 'react'
import {ListName} from '../../services/Codelist'
import {DotTags} from './DotTag'
import {BehandlingFilters} from '../../api/BehandlingApi'
import {gql, useQuery} from '@apollo/client'
import {Behandling, PageResponse} from '../../constants'


const query = gql`
  query getBehandling($relevans: [String!]){
    behandling(filter: {relevans: $relevans}) {
      content {
        id
        navn
        nummer
        relevansFor {
          code
          shortName
        }
        overordnetFormaal {
          shortName
        }
      }

    }
  }
`

export const BehandlingFilterTable = (props: {filter: BehandlingFilters, emptyText?: string}) => {
  const {data, loading} = useQuery<{behandling: PageResponse<Behandling>}>(query, {variables: props.filter})

  return (
    loading && !data ?
      <Spinner size={theme.sizing.scale2400}/> :
      <Table
        data={data!.behandling.content}
        emptyText={props.emptyText || 'behandlinger'}
        headers={[
          {title: 'Nummer', column: 'nummer', small: true},
          {title: 'Navn', column: 'navn'},
          {title: 'Overordnet formål', column: 'overordnetFormaal'},
          {title: 'Relevans for', column: 'relevansFor'},
        ]}
        config={{
          initialSortColumn: 'nummer',
          useDefaultStringCompare: true,
          sorting: {
            nummer: (a, b) => a.nummer - b.nummer,
            overordnetFormaal: (a, b) => a.overordnetFormaal.shortName.localeCompare(b.overordnetFormaal.shortName),
            relevansFor: (a, b) => a.relevansFor.length - b.relevansFor.length
          }
        }}
        render={state => {
          return state.data.map((behnandling, i) => {
            return (
              <Row key={i}>
                <Cell small>{behnandling.nummer}</Cell>
                <Cell>
                  <RouteLink href={`/behandling/${behnandling.id}`}>{behnandling.navn}</RouteLink>
                </Cell>
                <Cell>{behnandling.overordnetFormaal?.shortName}</Cell>
                <Cell><DotTags list={ListName.RELEVANS} codes={behnandling.relevansFor} linkCodelist/></Cell>
              </Row>
            )
          })
        }}
      />
  )
}
