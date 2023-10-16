import { Block } from 'baseui/block'

import { HeadingXXLarge, ParagraphMedium } from 'baseui/typography'
import moment from 'moment'
import * as React from 'react'
import { ReactNode, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { getAllKrav, kravMapToFormVal } from '../api/KravApi'
import { getTilbakemeldingForKrav } from '../api/TilbakemeldingApi'
import { PersonName } from '../components/common/PersonName'
import RouteLink from '../components/common/RouteLink'
import { Cell, Row, Table } from '../components/common/Table'
import { getMelderInfo } from '../components/krav/tilbakemelding/Tilbakemelding'
import { Layout2 } from '../components/scaffold/Page'
import { Krav, PageResponse, Tilbakemelding, TilbakemeldingMeldingStatus } from '../constants'
import { ColumnCompares } from '../util/hooks'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { codelist, ListName } from '../services/Codelist'
import { ampli } from '../services/Amplitude'
import { Spinner } from '../components/common/Spinner'

type SporsmaalOgSvarKrav = {
  kravNavn: string
  tidForSporsmaal: string
  tidForSvar?: string
  melderNavn: ReactNode
  tema?: string
}

type KravMessage = Tilbakemelding & SporsmaalOgSvarKrav

const kravSorting: ColumnCompares<KravMessage> = {
  kravNummer: (a, b) => a.kravNummer - b.kravNummer,
  kravNavn: (a, b) => (a.kravNavn || '').localeCompare(b.kravNavn || ''),
  tidForSporsmaal: (a, b) => (b.tidForSporsmaal || '').localeCompare(a.tidForSporsmaal || ''),
  tema: (a, b) => (a.tema || '').localeCompare(b.tema || ''),
  tidForSvar: (a, b) => (a.tidForSvar || '').localeCompare(b.tidForSvar || ''),
}

export const QuestionAndAnswerLogPage = () => {
  const [tableContent, setTableContent] = useState<Krav[]>([])
  const [kravMessages, setKravMessages] = useState<KravMessage[]>([])
  const [isloading, setIsLoading] = useState<boolean>(false)
  ampli.logEvent('sidevisning', { side: 'Log side for spørsmål og svar', sidetittel: 'Spørsmål og svar' })

  useEffect(() => {
    ;(async () => {
      const kraver = await getAllKrav()
      const mappedKraver = kraver.map((k) => kravMapToFormVal(k))
      setTableContent([...mappedKraver])
    })()
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const kravMessages: KravMessage[] = []
    const tilbakeMeldinger: Tilbakemelding[] = []

    const getTilbakeMeldingerPromise: Promise<any>[] = []
    tableContent.forEach((k) => {
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
          const kravNavn = tableContent.filter((k) => k.kravNummer === t.kravNummer && k.kravVersjon === t.kravVersjon)[0].navn
          const kravTema = tableContent.filter((k) => k.kravNummer === t.kravNummer && k.kravVersjon === t.kravVersjon)[0].tema
          const { status, sistMelding } = getMelderInfo(t)
          kravMessages.push({
            ...t,
            kravNavn: kravNavn,
            tidForSporsmaal: t.meldinger[0].tid,
            tidForSvar: status === TilbakemeldingMeldingStatus.UBESVART ? undefined : sistMelding.tid,
            melderNavn: <PersonName ident={t.melderIdent} />,
            tema: kravTema,
          })
        })
        setKravMessages(kravMessages)
      })
    } catch (e: any) {
      console.log(e)
    }
    setIsLoading(false)
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
        {!isloading && kravMessages.length ? (
          <Table
            emptyText=""
            data={kravMessages}
            config={{
              initialSortColumn: 'tidForSporsmaal',
              sorting: kravSorting,
              pageSizes: [5, 10, 20, 50, 100],
              defaultPageSize: 20,
            }}
            headers={[
              { $style: { maxWidth: '6%' }, title: 'Krav ID', column: 'kravNummer' },
              { $style: { maxWidth: '25%', minWidth: '25%' }, title: 'Kravtittel', column: 'kravNavn' },
              { title: 'Tema', column: 'tema' },
              { title: 'Fra', column: 'melderNavn' },
              { title: 'Mottatt', column: 'tidForSporsmaal' },
              { title: 'Besvart', column: 'tidForSvar' },
            ]}
            render={(tableData) => {
              return tableData.data.slice((tableData.page - 1) * tableData.limit, (tableData.page - 1) * tableData.limit + tableData.limit).map((krav, index) => {
                return (
                  <Row key={krav.id}>
                    <Cell $style={{ maxWidth: '6%' }}>
                      K{krav.kravNummer}.{krav.kravVersjon}
                    </Cell>
                    <Cell $style={{ maxWidth: '25%', minWidth: '25%' }}>
                      <RouteLink href={`/krav/${krav.kravNummer}/${krav.kravVersjon}?tilbakemeldingId=${krav.id}`}>{krav.kravNavn}</RouteLink>
                    </Cell>
                    <Cell>{codelist.getCode(ListName.TEMA, krav.tema)?.shortName}</Cell>
                    <Cell>{krav.melderNavn}</Cell>
                    <Cell>{moment(krav.tidForSporsmaal).format('lll')}</Cell>
                    <Cell>
                      {krav.tidForSvar ? (
                        moment(krav.tidForSvar).format('lll')
                      ) : (
                        <ParagraphMedium $style={{ fontSize: '16px', lineHeight: '22px', marginTop: '0px', marginBottom: '0px', color: ettlevColors.red600 }}>
                          Ikke besvart
                        </ParagraphMedium>
                      )}
                    </Cell>
                  </Row>
                )
              })
            }}
          />
        ) : (
          <Block display={'flex'} justifyContent={'center'}>
            <Spinner size={'large'} />
          </Block>
        )}
      </Block>
    </Layout2>
  )
}
export default QuestionAndAnswerLogPage
