import {useParams} from 'react-router-dom'
import {Block} from 'baseui/block'
import React from 'react'
import {HeadingMedium, ParagraphMedium} from 'baseui/typography'
import {codelist, codelistCompareField, ListName} from '../services/Codelist'
import RouteLink from '../components/common/RouteLink'
import {theme} from '../util'
import {Cell, Row, Table} from '../components/common/Table'
import {useKravFilter} from '../api/KravGraphQLApi'
import {kravStatus} from './KravPage'


export const RelevansPage = () => {
  const {relevans} = useParams()
  const data = useKravFilter({relevans})

  if (!relevans) {
    return <Block>
      <HeadingMedium>Velg relevans</HeadingMedium>
      <Block>
        {codelist.getCodes(ListName.RELEVANS).map((code) =>
          <Block key={code.code} marginBottom={theme.sizing.scale400}>
            <RouteLink href={`/relevans/${code.code}`}>{code.shortName}</RouteLink>
          </Block>
        )}
      </Block>
    </Block>
  }

  let code = codelist.getCode(ListName.RELEVANS, relevans)
  return (
    <Block>
      <HeadingMedium>Relevans: {code?.shortName}</HeadingMedium>
      <ParagraphMedium>{code?.description}</ParagraphMedium>

      <Block marginTop={theme.sizing.scale1200}>
        <Table
          data={data}
          emptyText='krav'
          headers={[
            {title: 'Nummer', column: 'kravNummer', small: true},
            {title: 'Krav', column: 'navn'},
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
      </Block>
    </Block>
  )
}

