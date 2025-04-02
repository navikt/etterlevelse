import { Label, List, Skeleton } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { getAllPvkDokumentListItem } from '../../api/PvkDokumentApi'
import { getAllPvoTilbakemelding } from '../../api/PvoApi'
import { EPVO, EPvkDokumentStatus, IPvkDokumentListItem, IPvoTilbakemelding } from '../../constants'
import { ListLayout2 } from '../common/ListLayout'
import PvoStatusView from './common/PvoStatusView'

export const PvoTilbakemeldingsList = () => {
  const [allPvkDocumentListItem, setAllPvkDocumentListItem] = useState<IPvkDokumentListItem[]>([])
  const [allPvoTilbakemelding, setAllPvoTilbakemelding] = useState<IPvoTilbakemelding[]>([])
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
