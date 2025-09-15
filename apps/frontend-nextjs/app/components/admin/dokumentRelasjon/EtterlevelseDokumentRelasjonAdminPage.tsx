'use client'

import {
  deleteDocumentRelation,
  documentRelationMapToFormVal,
  dokumentRelationTypeToString,
  getAllDocumentRelation,
} from '@/api/dokumentRelasjon/dokumentRelasjonApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IDocumentRelation } from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { handleSort } from '@/util/handleTableSort'
import {
  BodyShort,
  Button,
  Heading,
  Link,
  Pagination,
  Select,
  SortState,
  Spacer,
  Table,
  TextField,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { UpdateMessage } from '../common/commonComponents'

export const EtterlevelseDokumentRelasjonAdminPage = () => {
  const [deleteMessage, setDeleteMessage] = useState<string>('')
  const [deleleDokumentRelasjonId, setDeleteDokumentRelasjonId] = useState<string>('')
  const [reloadTable, setReloadTable] = useState(false)

  const [tableContent, setTableContent] = useState<IDocumentRelation[]>([])

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sort, setSort] = useState<SortState>()

  let sortedData = tableContent

  const comparator = (a: IDocumentRelation, b: IDocumentRelation, orderBy: string) => {
    switch (orderBy) {
      case 'relationType':
        return (a.RelationType || '').localeCompare(b.RelationType || '')
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
      const allDocumentRelation = await getAllDocumentRelation()
      const mappedDocumentRelation = allDocumentRelation.map((documentRelation) =>
        documentRelationMapToFormVal(documentRelation)
      )
      setTableContent(mappedDocumentRelation)
      // const ampliInstance = ampli()
      // if (ampliInstance) {
      //   ampliInstance.logEvent('sidevisning', {
      //     side: 'Etterlevelse dokument relasjon admin side',
      //     sidetittel: 'Administrere dokument relasjon',
      //     ...userRoleEventProp,
      //   })
      // }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const allDocumentRelation = await getAllDocumentRelation()
      const mappedDocumentRelation = allDocumentRelation.map((documentRelation) =>
        documentRelationMapToFormVal(documentRelation)
      )
      setTableContent(mappedDocumentRelation)
    })()
  }, [reloadTable])

  return (
    <PageLayout
      pageTitle='Administrer Dokument relasjon'
      currentPage='Administrer Dokument relasjon'
    >
      <div>
        <Heading size='medium' level='1'>
          Administrer Dokument relasjon
        </Heading>
      </div>

      <div className='flex items-end mt-8'>
        <TextField
          label='Slett dokument relasjon'
          placeholder='Dokument relasjon UID'
          onChange={(e) => setDeleteDokumentRelasjonId(e.target.value)}
          className='w-full mr-3'
        />
        <Button
          disabled={!deleleDokumentRelasjonId}
          onClick={() => {
            deleteDocumentRelation(deleleDokumentRelasjonId)
              .then(() => {
                setDeleteDokumentRelasjonId('')
                setReloadTable(!reloadTable)
                setDeleteMessage(
                  'Sletting vellykket for relasjon til etterlevelse dokumentasjon med uid: ' +
                    deleleDokumentRelasjonId
                )
              })
              .catch((e) => {
                setDeleteMessage('Sletting mislykket, error: ' + e)
              })
          }}
        >
          Slett
        </Button>
      </div>
      <UpdateMessage message={deleteMessage} />

      <div className='mt-8 w-full'>
        <Heading level='2' size='small'>
          Dokument relasjon tabell
        </Heading>
        {tableContent.length !== 0 && (
          <div>
            <Table
              size='large'
              zebraStripes
              sort={sort}
              onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
            >
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Dokument relasjon ID</Table.ColumnHeader>
                  <Table.ColumnHeader>Fra Dokument relasjon ID</Table.ColumnHeader>
                  <Table.ColumnHeader>Til Dokument relasjon ID</Table.ColumnHeader>
                  <Table.ColumnHeader sortKey='relationType' sortable>
                    Relasjonstype
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedData.map((documentRelation: IDocumentRelation) => (
                  <Table.Row key={documentRelation.id}>
                    <Table.HeaderCell scope='row'>{documentRelation.id}</Table.HeaderCell>
                    <Table.DataCell>
                      <Link href={etterlevelseDokumentasjonIdUrl(documentRelation.fromDocument)}>
                        {documentRelation.fromDocument}
                      </Link>
                    </Table.DataCell>
                    <Table.DataCell>
                      <Link href={etterlevelseDokumentasjonIdUrl(documentRelation.toDocument)}>
                        {documentRelation.toDocument}
                      </Link>
                    </Table.DataCell>
                    <Table.DataCell>
                      {dokumentRelationTypeToString(documentRelation.RelationType)}
                    </Table.DataCell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <div className='flex w-full justify-center items-center mt-3'>
              <Select
                label='Antall rader:'
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
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
      </div>
    </PageLayout>
  )
}

export default EtterlevelseDokumentRelasjonAdminPage
