'use client'

import {
  deletePvkDokument,
  getAllPvkDokument,
  mapPvkDokumentToFormValue,
} from '@/api/pvkDokument/pvkDokumentApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { pvkDokumentasjonPvkBehovUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
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

export const PvkDokumentAdminPage = () => {
  const [deleteMessage, setDeleteMessage] = useState<string>('')
  const [deletePvkDokumentId, setDeletePvkDokumentId] = useState<string>('')
  const [reloadTable, setReloadTable] = useState(false)

  const [tableContent, setTableContent] = useState<IPvkDokument[]>([])

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sort, setSort] = useState<SortState>()

  useEffect(() => {
    ;(async () => {
      await loadData()
      // const ampliInstance = ampli()
      // if (ampliInstance) {
      //   ampliInstance.logEvent('sidevisning', {
      //     side: 'Etterlevelse Pvk dokument admin side',
      //     sidetittel: 'Administrere Pvk dokument',
      //     ...userRoleEventProp,
      //   })
      // }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      await loadData()
    })()
  }, [reloadTable])

  const loadData = async () => {
    const allPvkDokument = await getAllPvkDokument()
    const mappedPvkDokument = allPvkDokument.map((pvkDokument) =>
      // ok to hard code etterlevelseDokumentVersjon as 1 since this is a readOnly data
      mapPvkDokumentToFormValue(pvkDokument, 1)
    )
    setTableContent(mappedPvkDokument)
  }

  return (
    <PageLayout pageTitle='Administrer Pvk Dokument' currentPage='Administrer Pvk Dokument'>
      <div>
        <Heading size='medium' level='1'>
          Administrer Pvk Dokument
        </Heading>
      </div>

      <div className='flex items-end mt-8'>
        <TextField
          label='Slett pvk dokument'
          placeholder='Pvk Dokument UID'
          onChange={(e) => setDeletePvkDokumentId(e.target.value)}
          className='w-full mr-3'
        />
        <Button
          disabled={!deletePvkDokumentId}
          onClick={async () => {
            deletePvkDokument(deletePvkDokumentId)
              .then(() => {
                setDeletePvkDokumentId('')
                setReloadTable(!reloadTable)
                setDeleteMessage(
                  'Sletting vellykket for Pvk dokument med uid: ' + deletePvkDokumentId
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
          Pvk Dokument tabell
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
                  <Table.ColumnHeader>Pvk dokument ID</Table.ColumnHeader>
                  <Table.ColumnHeader>Etterlevelse dokumentasjon ID</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {tableContent.map((pvkDokument: IPvkDokument) => (
                  <Table.Row key={pvkDokument.id}>
                    <Table.HeaderCell scope='row'>
                      <Link
                        href={pvkDokumentasjonPvkBehovUrl(
                          pvkDokument.etterlevelseDokumentId,
                          pvkDokument.id
                        )}
                      >
                        {pvkDokument.id}
                      </Link>
                    </Table.HeaderCell>
                    <Table.DataCell>
                      <Link
                        href={etterlevelseDokumentasjonIdUrl(pvkDokument.etterlevelseDokumentId)}
                      >
                        {pvkDokument.etterlevelseDokumentId}
                      </Link>
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

export default PvkDokumentAdminPage
