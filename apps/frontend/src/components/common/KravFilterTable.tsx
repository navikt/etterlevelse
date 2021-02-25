import {KravFilters, useKravFilter} from '../../api/KravGraphQLApi'
import {Spinner} from './Spinner'
import {theme} from '../../util'
import {Cell, Table} from './Table'
import {codelistCompareField, codelistsCompareField} from '../../services/Codelist'
import RouteLink from './RouteLink'
import {kravNumView, kravStatus} from '../../pages/KravPage'
import React from 'react'
import {KravQL} from '../../constants'

export const KravFilterTable = (props: {filter: KravFilters, emptyText?: string, exclude?: (keyof KravQL)[]}) => {
  const {data, loading} = useKravFilter(props.filter)

  return (
    loading && !data?.length ?
      <Spinner size={theme.sizing.scale2400}/> :
      <Table
        data={data || []}
        emptyText={props.emptyText || 'krav'}
        headers={[
          {title: 'Nummer', column: 'kravNummer', small: true},
          {title: 'Navn', column: 'navn'},
          {title: 'Etterlevelser', column: 'etterlevelser'},
          {title: 'Avdeling', column: 'avdeling'},
          {title: 'Underavdeling', column: 'underavdeling'},
          {title: 'Lover', column: 'regelverk'},
          {title: 'Status', column: 'status'},
        ]}
        config={{
          initialSortColumn: 'kravNummer',
          useDefaultStringCompare: true,
          sorting: {
            kravNummer: (a, b) => a.kravNummer === b.kravNummer ? a.kravVersjon - b.kravVersjon : a.kravNummer - b.kravNummer,
            avdeling: codelistCompareField('avdeling'),
            underavdeling: codelistCompareField('underavdeling'),
            regelverk: codelistsCompareField<KravQL>(k => k.regelverk.map(r => r.lov), props.filter.lov)
          },
          exclude: props.exclude
        }}
        renderRow={krav => ([
          <Cell small>{kravNumView(krav)}</Cell>,
          <Cell>
            <RouteLink href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>{krav.navn}</RouteLink>
          </Cell>,
          <Cell>{krav.etterlevelser.length}</Cell>,
          <Cell>{krav.avdeling?.shortName}</Cell>,
          <Cell>{krav.underavdeling?.shortName}</Cell>,
          <Cell>{krav.regelverk.map(r => r.lov?.shortName).join(", ")}</Cell>,
          <Cell>{kravStatus(krav.status)}</Cell>,
        ])
        }
      />
  )
}
