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
import { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import { getAllKrav, kravMapToFormVal } from '../api/KravApi'
import { getTilbakemeldingForKrav } from '../api/TilbakemeldingApi'
import { PersonName } from '../components/common/PersonName'
import { kravNummerVersjonUrl } from '../components/common/RouteLinkKrav'
import { getMelderInfo } from '../components/krav/tilbakemelding/Tilbakemelding'
import { PageLayout } from '../components/scaffold/Page'
import {
  ETilbakemeldingMeldingStatus,
  IKrav,
  IPageResponse,
  ITilbakemelding,
  TKravQL,
} from '../constants'
import { CodelistService, EListName } from '../services/Codelist'
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
  const [codelistUtils] = CodelistService()
  const [tableContent, setTableContent] = useState<IKrav[]>([])
  const [kravMessages, setKravMessages] = useState<TKravMessage[]>([])
  const [isloading, setIsLoading] = useState<boolean>(false)

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sort, setSort] = useState<SortState>()

  let sortedData: TKravMessage[] = kravMessages.sort((a: TKravMessage, b: TKravMessage) =>
    (b.tidForSporsmaal || '').localeCompare(a.tidForSporsmaal || '')
  )

  const comparator = (a: TKravMessage, b: TKravMessage, orderBy: string): number => {
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
    .sort((a: TKravMessage, b: TKravMessage) => {
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
      const kraver: IKrav[] = await getAllKrav()
      const mappedKraver: TKravQL[] = kraver.map((krav: IKrav) => kravMapToFormVal(krav))
      setTableContent([...mappedKraver])
      // ampli.logEvent('sidevisning', {
      //   side: 'Log side for spørsmål og svar',
      //   sidetittel: 'Spørsmål og svar',
      // })
    })()
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const kravMessages: TKravMessage[] = []
    const tilbakeMeldinger: ITilbakemelding[] = []

    const getTilbakeMeldingerPromise: Promise<any>[] = []
    tableContent.forEach((krav: IKrav) => {
      getTilbakeMeldingerPromise.push(
        (async () => await getTilbakemeldingForKrav(krav.kravNummer, krav.kravVersjon))()
      )
    })

    try {
      Promise.all(getTilbakeMeldingerPromise).then((response: IPageResponse<ITilbakemelding>[]) => {
        response.forEach((tilbakemelding: IPageResponse<ITilbakemelding>) => {
          if (tilbakemelding.content) {
            tilbakeMeldinger.push(...tilbakemelding.content)
          }
        })

        tilbakeMeldinger.forEach((tilbakemelding: ITilbakemelding) => {
          const kravNavn: string = tableContent.filter(
            (krav: IKrav) =>
              krav.kravNummer === tilbakemelding.kravNummer &&
              krav.kravVersjon === tilbakemelding.kravVersjon
          )[0].navn
          const kravTema: string | undefined = tableContent.filter(
            (krav: IKrav) =>
              krav.kravNummer === tilbakemelding.kravNummer &&
              krav.kravVersjon === tilbakemelding.kravVersjon
          )[0].tema
          const { status, sistMelding } = getMelderInfo(tilbakemelding)
          kravMessages.push({
            ...tilbakemelding,
            kravNavn: kravNavn,
            tidForSporsmaal: tilbakemelding.meldinger[0].tid,
            tidForSvar:
              status === ETilbakemeldingMeldingStatus.UBESVART ? undefined : sistMelding.tid,
            melderNavn: <PersonName ident={tilbakemelding.melderIdent} />,
            tema: kravTema,
          })
        })
        setKravMessages(kravMessages)
      })
    } catch (error: any) {
      console.error(error)
    }
    setIsLoading(false)
  }, [tableContent])

  return (
    <PageLayout pageTitle='Spørsmål og svar' currentPage='Spørsmål og svar'>
      <Heading size='medium' level='1'>
        Spørsmål og svar
      </Heading>

      <div>
        {!isloading && kravMessages.length ? (
          <div>
            <Table
              size='large'
              zebraStripes
              sort={sort}
              onSortChange={(sortKey?: string) => handleSort(sort, setSort, sortKey)}
            >
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader className='w-[6%]' sortKey='kravNummer' sortable>
                    Krav ID
                  </Table.ColumnHeader>
                  <Table.ColumnHeader className='w-[25%]' sortKey='kravNavn' sortable>
                    Kravtittel
                  </Table.ColumnHeader>
                  <Table.ColumnHeader sortKey='tema' sortable>
                    Tema
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>Fra</Table.ColumnHeader>
                  <Table.ColumnHeader sortKey='tidForSporsmaal' sortable>
                    Mottatt
                  </Table.ColumnHeader>
                  <Table.ColumnHeader sortKey='tidForSvar' sortable>
                    Besvart
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedData.map((message: TKravMessage) => (
                  <Table.Row key={message.id}>
                    <Table.HeaderCell className='w-[6%]' scope='row'>
                      {' '}
                      K{message.kravNummer}.{message.kravVersjon}
                    </Table.HeaderCell>

                    <Table.DataCell className='w-[25%]'>
                      <Link
                        href={kravNummerVersjonUrl(
                          message.kravNummer,
                          message.kravVersjon,
                          message.id
                        )}
                      >
                        {message.kravNavn}
                      </Link>
                    </Table.DataCell>
                    <Table.DataCell>
                      {codelistUtils.getCode(EListName.TEMA, message.tema)?.shortName}
                    </Table.DataCell>
                    <Table.DataCell>{message.melderNavn}</Table.DataCell>
                    <Table.DataCell>{moment(message.tidForSporsmaal).format('LLL')}</Table.DataCell>
                    <Table.DataCell>
                      {message.tidForSvar ? (
                        moment(message.tidForSvar).format('LLL')
                      ) : (
                        <BodyShort>Ikke besvart</BodyShort>
                      )}
                    </Table.DataCell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <div className='flex w-full justify-center items-center mt-3'>
              <Select
                label='Antall rader:'
                value={rowsPerPage}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setRowsPerPage(parseInt(event.target.value))
                }
                size='small'
              >
                <option value='5'>5</option>
                <option value='10'>10</option>
                <option value='20'>20</option>
                <option value='50'>50</option>
                <option value='100'>100</option>
              </Select>
              <Spacer />
              <div>
                <Pagination
                  page={page}
                  onPageChange={setPage}
                  count={Math.ceil(kravMessages.length / rowsPerPage)}
                  prevNextTexts
                  size='small'
                />
              </div>
              <Spacer />
              <BodyShort>Totalt antall rader: {kravMessages.length}</BodyShort>
            </div>
          </div>
        ) : (
          <div className='flex justify-center'>
            <Loader size={'large'} />
          </div>
        )}
      </div>
    </PageLayout>
  )
}
export default QuestionAndAnswerLogPage
