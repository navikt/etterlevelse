import { Block } from 'baseui/block'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { HeadingXXLarge } from 'baseui/typography'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Krav } from '../constants'
import { getAllKrav, kravMapToFormVal } from '../api/KravApi'
import { Cell, Row, Table } from '../components/common/Table'
import { ColumnCompares } from '../util/hooks'
import moment from 'moment'
import { codelist, ListName } from '../services/Codelist'
import { kravStatus } from './KravPage'
import { Layout2 } from '../components/scaffold/Page'
import RouteLink from '../components/common/RouteLink'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'

const kravSorting: ColumnCompares<Krav> = {
  kravNummer: (a, b) => a.kravNummer - b.kravNummer,
  navn: (a, b) => (a.navn || '').localeCompare(b.navn || ''),
  avdeling: (a, b) => (a.underavdeling?.shortName || '').localeCompare(b.underavdeling?.shortName || ''),
  tema: (a, b) => (codelist.getCode(ListName.TEMA, a.tema)?.shortName || '').localeCompare(codelist.getCode(ListName.TEMA, b.tema)?.shortName || ''),
  status: (a, b) => (a.status || '').localeCompare(b.status || ''),
  changeStamp: (a, b) => (a.changeStamp.lastModifiedDate || '').localeCompare(b.changeStamp.lastModifiedDate || ''),
}

export const KravTablePage = () => {
  const [tableContent, setTableContent] = useState<Krav[]>([])

  useEffect(() => {
    ;(async () => {
      const kraver = await getAllKrav()
      const mappedKraver = kraver.map((k) => kravMapToFormVal(k))
      setTableContent(mappedKraver)
      ampli.logEvent('sidevisning', { side: 'Krav admin side', sidetittel: 'Administere Krav' })
    })()
  }, [])

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey25}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage="Administere Krav"
      mainHeader={
        <Block maxWidth={maxPageWidth} width="100%" display={'flex'} justifyContent="flex-start">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Administere Krav</title>
          </Helmet>
          <HeadingXXLarge marginTop="0">Administere Krav</HeadingXXLarge>
        </Block>
      }
    >
      <Block>
        {tableContent.length && (
          <Table
            emptyText=""
            data={tableContent}
            config={{
              initialSortColumn: 'kravNummer',
              sorting: kravSorting,
              pageSizes: [5, 10, 20, 50, 100],
              defaultPageSize: 20,
            }}
            headers={[
              { $style: { maxWidth: '6%' }, title: 'Krav ID', column: 'kravNummer' },
              { $style: { maxWidth: '25%', minWidth: '25%' }, title: 'Kravnavn', column: 'navn' },
              { title: 'Ansvarlig', column: 'underavdeling' },
              { title: 'Tema', column: 'tema' },
              { title: 'Status', column: 'status' },
              { title: 'Siste endret', column: 'changeStamp' },
            ]}
            render={(tableData) => {
              return tableData.data.slice((tableData.page - 1) * tableData.limit, (tableData.page - 1) * tableData.limit + tableData.limit).map((krav, index) => {
                return (
                  <Row key={krav.id}>
                    <Cell $style={{ maxWidth: '6%' }}>
                      {krav.kravNummer}.{krav.kravVersjon}
                    </Cell>
                    <Cell $style={{ maxWidth: '25%', minWidth: '25%' }}>
                      <RouteLink href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>{krav.navn}</RouteLink>
                    </Cell>
                    <Cell>{krav.underavdeling && krav.underavdeling.shortName}</Cell>
                    <Cell>
                      <RouteLink href={`/tema/${krav.tema}`}>{codelist.getCode(ListName.TEMA, krav.tema)?.shortName}</RouteLink>
                    </Cell>
                    <Cell>{kravStatus(krav.status)}</Cell>
                    <Cell>{moment(krav.changeStamp.lastModifiedDate).format('ll')}</Cell>
                  </Row>
                )
              })
            }}
          />
        )}
      </Block>
    </Layout2>
  )
}
