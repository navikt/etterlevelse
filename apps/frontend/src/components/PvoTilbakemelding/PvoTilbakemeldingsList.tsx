import { Label, List, Select, Skeleton } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { getAllPvkDokumentListItem } from '../../api/PvkDokumentApi'
import { getAllPvoTilbakemelding } from '../../api/PvoApi'
import { EPVO, EPvkDokumentStatus, IPvkDokumentListItem, IPvoTilbakemelding } from '../../constants'
import { ListLayout2 } from '../common/ListLayout'
import PvoStatusView from './common/PvoStatusView'

enum EStatusFilter {
  ALLE = 'ALLE',
  IKKE_PAABEGYNT = 'IKKE_PABEGYNT',
  PAABEGYNT = 'PABEGYNT',
  SENDT_TILBAKE = 'SENDT_TILBAKE',
}

export const PvoTilbakemeldingsList = () => {
  const [allPvkDocumentListItem, setAllPvkDocumentListItem] = useState<IPvkDokumentListItem[]>([])
  const [allPvoTilbakemelding, setAllPvoTilbakemelding] = useState<IPvoTilbakemelding[]>([])
  const [statusFilter, setStatusFilter] = useState<EStatusFilter>(EStatusFilter.ALLE)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await getAllPvkDokumentListItem().then((response) => {
        setAllPvkDocumentListItem(
          response.filter(
            (pvkDok) =>
              pvkDok.status !== EPvkDokumentStatus.AKTIV &&
              pvkDok.status !== EPvkDokumentStatus.UNDERARBEID
          )
        )
      })

      await getAllPvoTilbakemelding().then((response) => setAllPvoTilbakemelding(response))

      setIsLoading(false)
    })()
  }, [])

  return (
    <div>
      {isLoading && <Skeleton variant='rectangle' />}
      {!isLoading && (
        <div>
          <div id='pvo filter' className='flex items-end w-full gap-6 py-2'>
            <Label className='pb-3'>Filtrèr:</Label>
            <Select
              label='Velg status'
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as EStatusFilter)}
            >
              <option value={EStatusFilter.ALLE}>Alle</option>
              <option value={EStatusFilter.IKKE_PAABEGYNT}>Ikke påbegynt</option>
              <option value={EStatusFilter.PAABEGYNT}>Påbegynt</option>
              <option value={EStatusFilter.SENDT_TILBAKE}>Sendt tilbake</option>
            </Select>
          </div>
          <div className='w-full justify-center my-4'>
            <div className='flex justify-center content-center w-full'>
              <div className='flex justify-start align-middle w-full'>
                <Label size='medium'>
                  {/* {kravene.totalElements ? kravene.totalElements : 0}  */}
                  {allPvkDocumentListItem.length} PVK dokumenter
                </Label>
              </div>
            </div>
          </div>
          <List className='mb-2.5 flex flex-col gap-2'>
            {allPvkDocumentListItem &&
              allPvkDocumentListItem.map((pvkDokument: IPvkDokumentListItem) => {
                const pvoTilbakemelding = allPvoTilbakemelding.filter(
                  (pvo) => pvo.pvkDokumentId === pvkDokument.id
                )
                return (
                  <ListLayout2
                    key={pvkDokument.id}
                    id={pvkDokument.id}
                    url={`/pvkdokument/${pvkDokument.id}${EPVO.tilbakemelding}/1`}
                    title={`E${pvkDokument.etterlevelseNummer} ${pvkDokument.title}`}
                    status={
                      <PvoStatusView
                        status={
                          pvoTilbakemelding.length !== 0 ? pvoTilbakemelding[0].status : undefined
                        }
                      />
                    }
                    changeStamp={
                      pvkDokument.sendtTilPvoDato !== undefined &&
                      pvkDokument.sendtTilPvoDato !== ''
                        ? `Sendt inn: ${moment(pvkDokument.sendtTilPvoDato).format('ll')}`
                        : `Sendt inn: ${moment(pvkDokument.changeStamp.lastModifiedDate).format('ll')}`
                    }
                  />
                )
              })}
          </List>
        </div>
      )}
    </div>
  )
}
