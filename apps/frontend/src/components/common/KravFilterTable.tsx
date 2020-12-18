import {KravFilters, useKravFilter} from '../../api/KravGraphQLApi'
import {Spinner} from './Spinner'
import {theme} from '../../util'
import {Cell, Row, Table} from './Table'
import {codelistCompareField} from '../../services/Codelist'
import RouteLink from './RouteLink'
import {kravStatus} from '../../pages/KravPage'
import React from 'react'

export const KravFilterTable = (props: {filter: KravFilters}) => {
  const [data, loading] = useKravFilter(props.filter)

  return (
    loading ?
      <Spinner size={theme.sizing.scale2400}/> :
      <Table
        data={data}
        emptyText='krav'
        headers={[
          {title: 'Nummer', column: 'kravNummer', small: true},
          {title: 'Navn', column: 'navn'},
          {title: 'Etterlevelser', column: 'etterlevelser'},
          {title: 'Avdeling', column: 'avdeling'},
          {title: 'Underavdeling', column: 'underavdeling'},
          {title: 'Status', column: 'status'},
        ]}
        config={{
          initialSortColumn: 'kravNummer',
          useDefaultStringCompare: true,
          sorting: {
            kravNummer: (a, b) => a.kravNummer === b.kravNummer ? a.kravVersjon - b.kravVersjon : a.kravNummer - b.kravNummer,
            avdeling: codelistCompareField('avdeling'),
            underavdeling: codelistCompareField('underavdeling')

          }
        }}
        render={state => {
          return state.data.map((krav, i) => {
            return (
              <Row key={i}>
                <Cell small>{krav.kravNummer}.{krav.kravVersjon}</Cell>
                <Cell>
                  <RouteLink href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>{krav.navn}</RouteLink>
                </Cell>
                <Cell>{krav.etterlevelser.length}</Cell>
                <Cell>{krav.avdeling?.shortName}</Cell>
                <Cell>{krav.underavdeling?.shortName}</Cell>
                <Cell>{kravStatus(krav.status)}</Cell>
              </Row>
            )
          })
        }}
      />
  )
}
