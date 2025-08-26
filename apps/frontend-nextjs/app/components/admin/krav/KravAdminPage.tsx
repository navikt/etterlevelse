'use client'

import { getAllKrav, kravMapToFormVal } from '@/api/krav/kravApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EListName } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, IKrav, TKravQL } from '@/constants/krav/kravConstants'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { ampli, userRoleEventProp } from '@/services/amplitude/amplitudeService'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { handleSort } from '@/util/handleTableSort'
import {
  BodyShort,
  Heading,
  Link,
  Pagination,
  Select,
  SortState,
  Spacer,
  Table,
} from '@navikt/ds-react'
import moment from 'moment'
import { ChangeEvent, useEffect, useState } from 'react'

const kravStatus = (status: EKravStatus | string) => {
  if (!status) return ''
  switch (status) {
    case EKravStatus.UTKAST:
      return 'Utkast'
    case EKravStatus.AKTIV:
      return 'Aktiv'
    case EKravStatus.UTGAATT:
      return 'Utgått'
    default:
      return status
  }
}

const KravAdminPage = () => {
  const [tableContent, setTableContent] = useState<IKrav[]>([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sort, setSort] = useState<SortState>()

  let sortedData: IKrav[] = tableContent

  const comparator = (a: IKrav, b: IKrav, orderBy: string) => {
    switch (orderBy) {
      case 'kravNummer':
        return a.kravNummer - b.kravNummer
      case 'navn':
        return (a.navn || '').localeCompare(b.navn || '')
      case 'avdeling':
        return (a.underavdeling?.shortName || '').localeCompare(b.underavdeling?.shortName || '')
      case 'tema':
        return (codelist.getCode(EListName.TEMA, a.tema)?.shortName || '').localeCompare(
          codelist.getCode(EListName.TEMA, b.tema)?.shortName || ''
        )
      case 'status':
        return (a.status || '').localeCompare(b.status || '')
      case 'changeStamp':
        return (a.changeStamp.lastModifiedDate || '').localeCompare(
          b.changeStamp.lastModifiedDate || ''
        )
      default:
        return 0
    }
  }

  sortedData = sortedData
    .sort((a: IKrav, b: IKrav) => {
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
      setTableContent(mappedKraver)
      ampli().logEvent('sidevisning', {
        side: 'Krav admin side',
        sidetittel: 'Administrere Krav',
        ...userRoleEventProp,
      })
    })()
  }, [])

  return (
    <PageLayout pageTitle='Administrere Krav' currentPage='Administrere Krav'>
      <Heading size='medium' level='1'>
        Administrere Krav
      </Heading>

      {tableContent.length && (
        <div className='w-full'>
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
                <Table.ColumnHeader className='w-[25%]' sortKey='navn' sortable>
                  Kravnavn
                </Table.ColumnHeader>
                <Table.ColumnHeader sortKey='avdeling' sortable>
                  Ansvarlig
                </Table.ColumnHeader>
                <Table.ColumnHeader sortKey='tema' sortable>
                  Tema
                </Table.ColumnHeader>
                <Table.ColumnHeader sortKey='status' sortable>
                  Status
                </Table.ColumnHeader>
                <Table.ColumnHeader className='w-[10%]' sortKey='changeStamp' sortable>
                  Siste endret
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedData.map((krav: IKrav) => (
                <Table.Row key={krav.kravId}>
                  <Table.HeaderCell className='w-[6%] text-end' scope='row'>
                    {krav.kravNummer}.{krav.kravVersjon}
                  </Table.HeaderCell>
                  <Table.DataCell className='w-[25%]'>
                    <Link href={kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon)}>
                      {krav.navn}
                    </Link>
                  </Table.DataCell>
                  <Table.DataCell>
                    {krav.underavdeling && krav.underavdeling.shortName}
                  </Table.DataCell>
                  <Table.DataCell>
                    {' '}
                    {krav.tema && (
                      <Link href={`${temaUrl}/${krav.tema}`}>
                        {codelist.getCode(EListName.TEMA, krav.tema)?.shortName}
                      </Link>
                    )}
                  </Table.DataCell>
                  <Table.DataCell>{kravStatus(krav.status)}</Table.DataCell>
                  <Table.DataCell className='w-[10%] text-end'>
                    {moment(krav.changeStamp.lastModifiedDate).format('LL')}
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
                count={Math.ceil(tableContent.length / rowsPerPage)}
                prevNextTexts
                size='small'
              />
            </div>
            <Spacer />
            <BodyShort>Totalt antall rader: {tableContent.length}</BodyShort>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

export default KravAdminPage
