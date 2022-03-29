import { Block } from 'baseui/block'
import { Pagination } from 'baseui/pagination'

import { HeadingXXLarge, Paragraph2 } from 'baseui/typography'
import moment from 'moment'
import { ReactElement, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { getKravPage, kravMapToFormVal } from '../api/KravApi'
import { getTilbakemeldingForKrav } from '../api/TilbakemeldingApi'
import { PersonName } from '../components/common/PersonName'
import RouteLink from '../components/common/RouteLink'
import { Cell, Row, Table } from '../components/common/Table'
import { tilbakeMeldingStatus } from '../components/krav/tilbakemelding/Tilbakemelding'
import { Layout2 } from '../components/scaffold/Page'
import { emptyPage, Krav, PageResponse, Tilbakemelding } from '../constants'
import { ColumnCompares } from '../util/hooks'
import { intl } from '../util/intl/intl'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { codelist, ListName } from '../services/Codelist'
import { ampli } from '../services/Amplitude'

type SporsmaalOgSvarKrav = {
  kravNavn: string
  tidForSpørsmål: string
  tidForSvar?: string
  melderNavn: ReactElement
  tema?: string
}

type KravMessage = Tilbakemelding & SporsmaalOgSvarKrav

const kravSorting: ColumnCompares<KravMessage> = {
  kravNummer: (a, b) => a.kravNummer - b.kravNummer,
  kravNavn: (a, b) => (a.kravNavn || '').localeCompare(b.kravNavn || ''),
  tidForSpørsmål: (a, b) => (a.tidForSpørsmål || '').localeCompare(b.tidForSpørsmål || ''),
  tidForSvar: (a, b) => (a.tidForSvar || '').localeCompare(b.tidForSvar || ''),
}

export const SpørsmålOgSvarLogPage = () => {
  const [tableContent, setTableContent] = useState<PageResponse<Krav>>(emptyPage)
  const [kravMessages, setKravMessages] = useState<KravMessage[]>([])
  const [page, setPage] = useState(1)

  ampli.logEvent('sidevisning', { side: 'Log side for spørsmål og svar', sidetittel: 'Spørsmål og svar' })

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) {
      return
    }
    if (nextPage > tableContent.pages) {
      return
    }
    setPage(nextPage)
  }

  useEffect(() => {
    ;(async () => {
      const kraver = await getKravPage(page - 1, 20)
      const mappedKraver = kraver.content.map((k) => kravMapToFormVal(k))
      setTableContent({ ...kraver, content: mappedKraver })
    })()
  }, [page])

  useEffect(() => {
    const kravMessages: KravMessage[] = []
    const tilbakeMeldinger: Tilbakemelding[] = []

    const getTilbakeMeldingerPromise: Promise<any>[] = []
    tableContent.content.forEach((k) => {
      getTilbakeMeldingerPromise.push((async () => await getTilbakemeldingForKrav(k.kravNummer, k.kravVersjon))())
    })

    try {
      Promise.all(getTilbakeMeldingerPromise).then((res: PageResponse<Tilbakemelding>[]) => {
        res.forEach((t) => {
          if (t.content) {
            tilbakeMeldinger.push(...t.content)
          }
        })

        tilbakeMeldinger.forEach((t) => {
          const kravNavn = tableContent.content.filter((k) => k.kravNummer === t.kravNummer && k.kravVersjon === t.kravVersjon)[0].navn
          const kravTema = tableContent.content.filter((k) => k.kravNummer === t.kravNummer && k.kravVersjon === t.kravVersjon)[0].tema
          const { ubesvart, sistMelding } = tilbakeMeldingStatus(t)
          kravMessages.push({
            ...t,
            kravNavn: kravNavn,
            tidForSpørsmål: t.meldinger[0].tid,
            tidForSvar: ubesvart ? undefined : sistMelding.tid,
            melderNavn: <PersonName ident={t.melderIdent} />,
            tema: kravTema,
          })
        })
        setKravMessages(kravMessages)
      })
    } catch (e: any) {
      console.log(e)
    }
  }, [tableContent])

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey25}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage="Spørsmål og svar"
      mainHeader={
        <Block maxWidth={maxPageWidth} width="100%" display={'flex'} justifyContent="flex-start">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Spørsmål og svar</title>
          </Helmet>
          <HeadingXXLarge marginTop="0">Spørsmål og svar</HeadingXXLarge>
        </Block>
      }
    >
      <Block>
        {/* <H2 $style={{lineHeight: '24px'}}>{kravMessages.length} spørsmål</H2> */}
        <Table
          emptyText=""
          data={kravMessages}
          config={{
            initialSortColumn: 'kravNummer',
            sorting: kravSorting,
          }}
          headers={[
            { $style: { maxWidth: '6%' }, title: 'Krav ID', column: 'kravNummer' },
            { $style: { maxWidth: '25%', minWidth: '25%' }, title: 'Kravnavn', column: 'kravNavn' },
            { title: 'Tema', column: 'tema' },
            { title: 'Fra', column: 'melderIdent' },
            { title: 'Tid for spørsmål', column: 'tidForSpørsmål' },
            { title: 'Tid for svar', column: 'tidForSvar' },
          ]}
          render={(tableData) =>
            tableData.data.map((t, index) => {
              const length = window.innerWidth > 1000 ? (window.innerWidth > 1200 ? 40 : 30) : 20
              const rowNum = tableContent.pageNumber * tableContent.pageSize + index + 1
              return (
                <Row key={t.id}>
                  <Cell $style={{ maxWidth: '6%' }}>
                    {t.kravNummer}.{t.kravVersjon}
                  </Cell>
                  <Cell $style={{ maxWidth: '25%', minWidth: '25%' }}>
                    <RouteLink href={`/krav/${t.kravNummer}/${t.kravVersjon}?tilbakemeldingId=${t.id}`}>{t.kravNavn}</RouteLink>
                  </Cell>
                  <Cell>{codelist.getCode(ListName.TEMA, t.tema)?.shortName}</Cell>
                  <Cell>{t.melderNavn}</Cell>
                  <Cell>{moment(t.tidForSpørsmål).format('lll')}</Cell>
                  <Cell>
                    {t.tidForSvar ? (
                      moment(t.tidForSpørsmål).format('lll')
                    ) : (
                      <Paragraph2 $style={{ fontSize: '16px', lineHeight: '22px', marginTop: '0px', marginBottom: '0px', color: ettlevColors.red600 }}>Ikke besvart</Paragraph2>
                    )}
                  </Cell>
                </Row>
              )
            })
          }
        />
      </Block>
      <Block display="flex" justifyContent="flex-end" marginTop="1rem" marginBottom="40px">
        <Pagination
          currentPage={page}
          numPages={tableContent.pages}
          onPageChange={({ nextPage }) => handlePageChange(nextPage)}
          labels={{ nextButton: intl.nextButton, prevButton: intl.prevButton }}
        />
      </Block>
    </Layout2>
  )
}
export default SpørsmålOgSvarLogPage
