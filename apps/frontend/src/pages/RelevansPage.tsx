import {useParams} from 'react-router-dom'
import {Block} from 'baseui/block'
import React from 'react'
import {HeadingMedium, HeadingSmall, ParagraphMedium} from 'baseui/typography'
import {codelist, codelistCompareField, ListName} from '../services/Codelist'
import RouteLink from '../components/common/RouteLink'
import {theme} from '../util'
import {Cell, Row, Table} from '../components/common/Table'
import {useKravFilter} from '../api/KravGraphQLApi'
import {kravStatus} from './KravPage'
import {Spinner} from '../components/common/Spinner'

// TODO refactor kravtabell to more generic reusable component
export const RelevansPage = () => {
  const {relevans} = useParams()
  const [data, loading] = useKravFilter({relevans})

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

  const code = codelist.getCode(ListName.RELEVANS, relevans)
  return (
    <Block>
      <HeadingMedium>Relevans: {code?.shortName}</HeadingMedium>
      <ParagraphMedium>{code?.description}</ParagraphMedium>

      <Block marginTop={theme.sizing.scale1200}>
        {loading && <Spinner size={theme.sizing.scale2400}/>}
        {!loading &&
        <Block>
          <HeadingSmall marginBottom={theme.sizing.scale200}>Krav</HeadingSmall>
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
        </Block>
        }
      </Block>
    </Block>
  )
}

