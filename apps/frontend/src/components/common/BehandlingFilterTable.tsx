import { Spinner } from './Spinner'
import { theme } from '../../util'
import { Cell, Row, Table } from './Table'
import RouteLink from './RouteLink'
import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { Behandling, PageResponse } from '../../constants'

const query = gql`
  query getBehandling($relevans: [String!]) {
    behandling(filter: { relevans: $relevans }) {
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

export const BehandlingFilterTable = (props: {emptyText?: string }) => {
  const { data, loading } = useQuery<{ behandling: PageResponse<Behandling> }>(query)

  return loading && !data ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : (
    <Table
      data={data!.behandling.content}
      emptyText={props.emptyText || 'behandlinger'}
      headers={[
        { title: 'Nummer', column: 'nummer', small: true },
        { title: 'Navn', column: 'navn' },
        { title: 'Overordnet formål', column: 'overordnetFormaal' },
      ]}
      config={{
        initialSortColumn: 'nummer',
        useDefaultStringCompare: true,
        sorting: {
          nummer: (a, b) => a.nummer - b.nummer,
          overordnetFormaal: (a, b) => a.overordnetFormaal.shortName.localeCompare(b.overordnetFormaal.shortName),
        },
      }}
      render={(state) => {
        return state.data.map((behnandling, i) => {
          return (
            <Row key={i}>
              <Cell small>{behnandling.nummer}</Cell>
              <Cell>
                <RouteLink href={`/behandling/${behnandling.id}`}>{behnandling.navn}</RouteLink>
              </Cell>
              <Cell>{behnandling.overordnetFormaal?.shortName}</Cell>
            </Row>
          )
        })
      }}
    />
  )
}
