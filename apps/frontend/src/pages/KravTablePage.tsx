import { useEffect, useState } from 'react'
import { Krav } from '../constants'
import { getAllKrav, kravMapToFormVal } from '../api/KravApi'
import moment from 'moment'
import { codelist, ListName } from '../services/Codelist'
import { kravStatus } from './KravPage'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { BodyShort, Heading, Link, Pagination, Select, SortState, Spacer, Table } from '@navikt/ds-react'
import { handleSort } from '../util/handleTableSort'


export const KravTablePage = () => {
  const [tableContent, setTableContent] = useState<Krav[]>([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sort, setSort] = useState<SortState>()

  let sortedData = tableContent

  const comparator = (a: Krav, b: Krav, orderBy: string) => {
    switch (orderBy) {
      case 'kravNummer':
        return a.kravNummer - b.kravNummer
      case 'navn':
        return (a.navn || '').localeCompare(b.navn || '')
      case 'avdeling':
        return (a.underavdeling?.shortName || '').localeCompare(b.underavdeling?.shortName || '')
      case 'tema':
        return (codelist.getCode(ListName.TEMA, a.tema)?.shortName || '').localeCompare(codelist.getCode(ListName.TEMA, b.tema)?.shortName || '')
      case 'status':
        return (a.status || '').localeCompare(b.status || '')
      case 'changeStamp':
        return (a.changeStamp.lastModifiedDate || '').localeCompare(b.changeStamp.lastModifiedDate || '')
      default:
        return 0
    }
  }

  sortedData = sortedData.sort((a, b) => {
    if (sort) {
      return sort.direction === 'ascending'
        ? comparator(b, a, sort.orderBy)
        : comparator(a, b, sort.orderBy)
    }
    return 1
  }).slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    ; (async () => {
      const kraver = await getAllKrav()
      const mappedKraver = kraver.map((k) => kravMapToFormVal(k))
      setTableContent(mappedKraver)
      ampli.logEvent('sidevisning', { side: 'Krav admin side', sidetittel: 'Administrere Krav' })
    })()
  }, [])

  return (
    <div className="w-full" id="content" role="main">
      <div className="flex-1 justify-start flex">
        <CustomizedBreadcrumbs currentPage="Administrere Krav" />
      </div>
      <div>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Administrere Krav</title>
        </Helmet>
        <Heading size="medium" level="1">Administrere Krav</Heading>
      </div>

      {tableContent.length && (
        <div className="w-full">
          <Table size="large" zebraStripes sort={sort} onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader className="w-[6%]" sortKey="kravNummer" sortable>Krav ID</Table.ColumnHeader>
                <Table.ColumnHeader className="w-[25%]" sortKey="navn" sortable>Kravnavn</Table.ColumnHeader>
                <Table.ColumnHeader sortKey="avdeling" sortable>Ansvarlig</Table.ColumnHeader>
                <Table.ColumnHeader sortKey="tema" sortable>Tema</Table.ColumnHeader>
                <Table.ColumnHeader sortKey="status" sortable>Status</Table.ColumnHeader>
                <Table.ColumnHeader className="w-[10%]" sortKey="changeStamp" sortable>Siste endret</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedData.map((krav: Krav) => {
                return (
                  <Table.Row key={krav.id}>
                    <Table.HeaderCell className="w-[6%] text-end" scope="row">{krav.kravNummer}.{krav.kravVersjon}</Table.HeaderCell>
                    <Table.DataCell className="w-[25%]"><Link href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>{krav.navn}</Link></Table.DataCell>
                    <Table.DataCell>{krav.underavdeling && krav.underavdeling.shortName}</Table.DataCell>
                    <Table.DataCell> <Link href={`/tema/${krav.tema}`}>{codelist.getCode(ListName.TEMA, krav.tema)?.shortName}</Link></Table.DataCell>
                    <Table.DataCell>{kravStatus(krav.status)}</Table.DataCell>
                    <Table.DataCell className="w-[10%] text-end">{moment(krav.changeStamp.lastModifiedDate).format('ll')}</Table.DataCell>
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
                count={Math.ceil(tableContent.length / rowsPerPage)}
                prevNextTexts
                size="small"
              />
            </div>
            <Spacer />
            <BodyShort>
              Totalt antall rader: {tableContent.length}
            </BodyShort>

          </div>
        </div>
      )}
    </div>
  )
}
