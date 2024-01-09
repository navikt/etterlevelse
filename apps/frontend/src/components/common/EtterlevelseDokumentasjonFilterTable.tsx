import { gql, useQuery } from '@apollo/client'
import { Loader } from '@navikt/ds-react'
import { EtterlevelseDokumentasjonFilter } from '../../api/EtterlevelseDokumentasjonApi'
import { IEtterlevelseDokumentasjon, IPageResponse } from '../../constants'
import { ListName } from '../../services/Codelist'
import { DotTags } from './DotTag'
import RouteLink from './RouteLink'
import { Cell, Row, Table } from './Table'

// eslint-disable-next-line @typescript-eslint/ban-types
const query = gql`
  query getEtterlevelsedokumentasjon($relevans: [String!]) {
    etterlevelseDokumentasjon(filter: { relevans: $relevans }) {
      content {
        id
        title
        etterlevelseNummer
        irrelevansFor {
          code
          shortName
        }
      }
    }
  }
`
// eslint-enable-next-line @typescript-eslint/ban-types

export const EtterlevelseDokumentasjonFilterTable = (props: {
  filter: EtterlevelseDokumentasjonFilter
  emptyText?: string
}) => {
  const { data, loading } = useQuery<{
    etterlevelseDokumentasjon: IPageResponse<IEtterlevelseDokumentasjon>
  }>(query, { variables: props.filter })

  return loading && !data ? (
    <Loader size={'large'} />
  ) : (
    <Table
      data={data!.etterlevelseDokumentasjon.content}
      emptyText={props.emptyText || 'etterlevelseDokumentasjoner'}
      headers={[
        { title: 'Etterlevelsenummer', column: 'etterlevelseNummer', small: true },
        { title: 'Tittel', column: 'title' },
        { title: 'Irrelevant for', column: 'irrelevansFor' },
      ]}
      config={{
        initialSortColumn: 'etterlevelseNummer',
        useDefaultStringCompare: true,
        sorting: {
          title: (a, b) => a.title.localeCompare(b.title),
          etterlevelseNummer: (a, b) => a.etterlevelseNummer - b.etterlevelseNummer,
          irrelevansFor: (a, b) => a.irrelevansFor.length - b.irrelevansFor.length,
        },
      }}
      render={(state) => {
        return state.data.map((etterlevelseDokumentasjon, i) => {
          return (
            <Row key={i}>
              <Cell small>E{etterlevelseDokumentasjon.etterlevelseNummer}</Cell>
              <Cell>
                <RouteLink href={`/dokumentasjon/${etterlevelseDokumentasjon.id}`}>
                  {etterlevelseDokumentasjon.title}
                </RouteLink>
              </Cell>
              <Cell>
                <DotTags
                  list={ListName.RELEVANS}
                  codes={etterlevelseDokumentasjon.irrelevansFor}
                  linkCodelist
                />
              </Cell>
            </Row>
          )
        })
      }}
    />
  )
}
