import {
  BodyShort,
  Heading,
  Link,
  Loader,
  Pagination,
  Select,
  SortState,
  Spacer,
  Table,
} from '@navikt/ds-react'
import moment from 'moment'
import { ReactNode, useEffect, useState } from 'react'
import { getAllKrav, kravMapToFormVal } from '../api/KravApi'
import { getTilbakemeldingForKrav } from '../api/TilbakemeldingApi'
import { PersonName } from '../components/common/PersonName'
import { getMelderInfo } from '../components/krav/tilbakemelding/Tilbakemelding'
import { PageLayout } from '../components/scaffold/Page'
import { ETilbakemeldingMeldingStatus, IKrav, IPageResponse, ITilbakemelding } from '../constants'
import { ampli } from '../services/Amplitude'
import { EListName, codelist } from '../services/Codelist'
import { handleSort } from '../util/handleTableSort'

type TSporsmaalOgSvarKrav = {
  kravNavn: string
  tidForSporsmaal: string
  tidForSvar?: string
  melderNavn: ReactNode
  tema?: string
}

type TKravMessage = ITilbakemelding & TSporsmaalOgSvarKrav

export const QuestionAndAnswerLogPage = () => {
  const [tableContent, setTableContent] = useState<IKrav[]>([])
  const [kravMessages, setKravMessages] = useState<TKravMessage[]>([])
  const [isloading, setIsLoading] = useState<boolean>(false)

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sort, setSort] = useState<SortState>()

  let sortedData = kravMessages.sort((a, b) =>
    (b.tidForSporsmaal || '').localeCompare(a.tidForSporsmaal || '')
  )

  const comparator = (a: TKravMessage, b: TKravMessage, orderBy: string) => {
    switch (orderBy) {
      case 'kravNummer':
        return a.kravNummer - b.kravNummer
      case 'kravNavn':
        return (a.kravNavn || '').localeCompare(b.kravNavn || '')
      case 'tema':
        return (a.tema || '').localeCompare(b.tema || '')
      case 'tidForSporsmaal':
        return (a.tidForSporsmaal || '').localeCompare(b.tidForSporsmaal || '')
      case 'tidForSvar':
        return (a.tidForSvar || '').localeCompare(b.tidForSvar || '')
      default:
        return 0
    }
  }

  sortedData = sortedData
    .sort((a, b) => {
      if (sort) {
        return sort.direction === 'ascending'
          ? comparator(b, a, sort.orderBy)
          : comparator(a, b, sort.orderBy)
      }
      return 1
    })
    .slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    ;(async () => {
      const kraver = await getAllKrav()
      const mappedKraver = kraver.map((krav) => kravMapToFormVal(krav))
      setTableContent([...mappedKraver])
      ampli.logEvent('sidevisning', {
        side: 'Log side for spørsmål og svar',
        sidetittel: 'Spørsmål og svar',
      })
    })()
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const kravMessages: TKravMessage[] = []
    const tilbakeMeldinger: ITilbakemelding[] = []

    const getTilbakeMeldingerPromise: Promise<any>[] = []
    tableContent.forEach((k) => {
      getTilbakeMeldingerPromise.push(
        (async () => await getTilbakemeldingForKrav(k.kravNummer, k.kravVersjon))()
      )
    })

    try {
      Promise.all(getTilbakeMeldingerPromise).then((res: IPageResponse<ITilbakemelding>[]) => {
        res.forEach((t) => {
          if (t.content) {
            tilbakeMeldinger.push(...t.content)
          }
        })

        tilbakeMeldinger.forEach((t) => {
          const kravNavn = tableContent.filter(
            (k) => k.kravNummer === t.kravNummer && k.kravVersjon === t.kravVersjon
          )[0].navn
          const kravTema = tableContent.filter(
            (k) => k.kravNummer === t.kravNummer && k.kravVersjon === t.kravVersjon
          )[0].tema
          const { status, sistMelding } = getMelderInfo(t)
          kravMessages.push({
            ...t,
            kravNavn: kravNavn,
            tidForSporsmaal: t.meldinger[0].tid,
            tidForSvar:
              status === ETilbakemeldingMeldingStatus.UBESVART ? undefined : sistMelding.tid,
            melderNavn: <PersonName ident={t.melderIdent} />,
            tema: kravTema,
          })
        })
        setKravMessages(kravMessages)
      })
    } catch (e: any) {
      console.error(e)
    }
    setIsLoading(false)
  }, [tableContent])

  return (
    <PageLayout pageTitle="Spørsmål og svar" currentPage="Spørsmål og svar">
      <Heading size="medium" level="1">
        Spørsmål og svar
      </Heading>

      <div>
        {!isloading && kravMessages.length ? (
          <div>
            <Table
              size="large"
              zebraStripes
              sort={sort}
              onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
            >
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader className="w-[6%]" sortKey="kravNummer" sortable>
                    Krav ID
                  </Table.ColumnHeader>
                  <Table.ColumnHeader className="w-[25%]" sortKey="kravNavn" sortable>
                    Kravtittel
                  </Table.ColumnHeader>
                  <Table.ColumnHeader sortKey="tema" sortable>
                    Tema
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>Fra</Table.ColumnHeader>
                  <Table.ColumnHeader sortKey="tidForSporsmaal" sortable>
                    Mottatt
                  </Table.ColumnHeader>
                  <Table.ColumnHeader sortKey="tidForSvar" sortable>
                    Besvart
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedData.map((message: TKravMessage) => {
                  return (
                    <Table.Row key={message.id}>
                      <Table.HeaderCell className="w-[6%]" scope="row">
                        {' '}
                        K{message.kravNummer}.{message.kravVersjon}
                      </Table.HeaderCell>

                      <Table.DataCell className="w-[25%]">
                        <Link
                          href={`/krav/${message.kravNummer}/${message.kravVersjon}?tilbakemeldingId=${message.id}`}
                        >
                          {message.kravNavn}
                        </Link>
                      </Table.DataCell>
                      <Table.DataCell>
                        {codelist.getCode(EListName.TEMA, message.tema)?.shortName}
                      </Table.DataCell>
                      <Table.DataCell>{message.melderNavn}</Table.DataCell>
                      <Table.DataCell>
                        {moment(message.tidForSporsmaal).format('lll')}
                      </Table.DataCell>
                      <Table.DataCell>
                        {message.tidForSvar ? (
                          moment(message.tidForSvar).format('lll')
                        ) : (
                          <BodyShort>Ikke besvart</BodyShort>
                        )}
                      </Table.DataCell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>

            <div className="flex w-full justify-center items-center mt-3">
              <Select
                label="Antall rader:"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                size="small"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
              <Spacer />
              <div>
                <Pagination
                  page={page}
                  onPageChange={setPage}
                  count={Math.ceil(kravMessages.length / rowsPerPage)}
                  prevNextTexts
                  size="small"
                />
              </div>
              <Spacer />
              <BodyShort>Totalt antall rader: {kravMessages.length}</BodyShort>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Loader size={'large'} />
          </div>
        )}
      </div>
    </PageLayout>
  )
}
export default QuestionAndAnswerLogPage
