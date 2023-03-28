import {KravFilters, useKravFilter} from '../../api/KravGraphQLApi'
import {Spinner} from './Spinner'
import {theme} from '../../util'
import {Cell, Table} from './Table'
import {Code, codelistCompareField, codelistsCompareField} from '../../services/Codelist'
import RouteLink from './RouteLink'
import {kravNumView, kravStatus} from '../../pages/KravPage'
import React from 'react'
import {KravQL, PageResponse} from '../../constants'
import {QueryResult} from '@apollo/client'
import {Notification} from 'baseui/notification'

type KravFilterTableProps = {
  emptyText?: string
  exclude?: (keyof KravQL)[]
  filter: KravFilters
}

type KravTableProps = {
  emptyText?: string
  exclude?: (keyof KravQL)[]
  queryResult: QueryResult<{ krav: PageResponse<KravQL> }, KravFilters>
}

export const KravFilterTable = (props: KravFilterTableProps) => {
  const res = useKravFilter(props.filter)
  return <KravTable queryResult={res} exclude={props.exclude} emptyText={props.emptyText} />
}

export const KravTable = (props: KravTableProps) => {
  const { variables, data, loading, error } = props.queryResult

  return loading && !data?.krav?.numberOfElements ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : error ? (
    <Notification kind={'negative'}>{JSON.stringify(error, null, 2)}</Notification>
  ) : (
    <Table
      data={data?.krav?.content || []}
      emptyText={props.emptyText || 'krav'}
      headers={[
        { title: 'Nummer', column: 'kravNummer', small: true },
        { title: 'Navn', column: 'navn' },
        { title: 'Etterlevelser', column: 'etterlevelser' },
        { title: 'Avdeling', column: 'avdeling' },
        { title: 'Underavdeling', column: 'underavdeling' },
        { title: 'Lover', column: 'regelverk' },
        { title: 'Status', column: 'status' },
      ]}
      config={{
        initialSortColumn: 'kravNummer',
        useDefaultStringCompare: true,
        sorting: {
          kravNummer: (a, b) => (a.kravNummer === b.kravNummer ? a.kravVersjon - b.kravVersjon : a.kravNummer - b.kravNummer),
          avdeling: codelistCompareField('avdeling'),
          underavdeling: codelistCompareField('underavdeling'),
          regelverk: codelistsCompareField<KravQL>((k) => k.regelverk.map((r) => r.lov as Code), variables?.lov),
        },
        exclude: props.exclude,
      }}
      renderRow={(krav) => [
        <Cell small>{kravNumView(krav)}</Cell>,
        <Cell>
          <RouteLink href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>{krav.navn}</RouteLink>
        </Cell>,
        <Cell>{krav.etterlevelser.length}</Cell>,
        <Cell>{krav.avdeling?.shortName}</Cell>,
        <Cell>{krav.underavdeling?.shortName}</Cell>,
        <Cell>{krav.regelverk.map((r) => r.lov?.shortName).join(', ')}</Cell>,
        <Cell>{kravStatus(krav.status)}</Cell>,
      ]}
    />
  )
}
