import { Label, List, Search, Select, Skeleton } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { getAllPvkDokumentListItem } from '../../api/PvkDokumentApi'
import { getAllPvoTilbakemelding } from '../../api/PvoApi'
import {
  EPvkDokumentStatus,
  EPvoTilbakemeldingStatus,
  IPvkDokumentListItem,
  IPvoTilbakemelding,
} from '../../constants'
import { ListLayout2 } from '../common/ListLayout'
import { pvkDokumenteringPvoTilbakemeldingUrl } from '../common/RouteLinkPvk'
import PvoStatusView from './common/PvoStatusView'

export const PvoTilbakemeldingsList = () => {
  const [allPvkDocumentListItem, setAllPvkDocumentListItem] = useState<IPvkDokumentListItem[]>([])
  const [allPvoTilbakemelding, setAllPvoTilbakemelding] = useState<IPvoTilbakemelding[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('alle')
  const [seachPvk, setSearchPvk] = useState<string>('')

  const [filteredPvkDokument, setFilteredPvkDokuement] = useState<IPvkDokumentListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await getAllPvkDokumentListItem().then((response) => {
        const filteredPvkDokument = response.filter(
          (pvkDok) =>
            pvkDok.status !== EPvkDokumentStatus.AKTIV &&
            pvkDok.status !== EPvkDokumentStatus.UNDERARBEID
        )
        setAllPvkDocumentListItem(filteredPvkDokument)
        setFilteredPvkDokuement(filteredPvkDokument)
      })

      await getAllPvoTilbakemelding().then((response) => setAllPvoTilbakemelding(response))

      setIsLoading(false)
    })()
  }, [])

  useEffect(() => {
    const unsortedData: any = [
      ...allPvkDocumentListItem.map((pvk) => {
        const pvoTilbakemelding = allPvoTilbakemelding.filter((pvo) => pvo.pvkDokumentId === pvk.id)
        return {
          ...pvk,
          dateToCompare:
            pvoTilbakemelding.length !== 0 &&
            pvoTilbakemelding[0].status === EPvoTilbakemeldingStatus.FERDIG
              ? pvoTilbakemelding[0].sendtDato
              : pvk.sendtTilPvoDato !== null && pvk.sendtTilPvoDato !== ''
                ? pvk.sendtTilPvoDato
                : pvk.changeStamp.lastModifiedDate,
        }
      }),
    ]

    const sortedPvk: IPvkDokumentListItem[] = unsortedData
      .sort((a: any, b: any) => a.dateToCompare.localeCompare(b.dateToCompare))
      .map((data: any) => {
        return {
          id: data.id,
          changeStamp: data.changeStamp,
          etterlevelseDokumentId: data.etterlevelseDokumentId,
          status: data.status,
          title: data.title,
          etterlevelseNummer: data.etterlevelseNummer,
          sendtTilPvoDato: data.sendtTilPvoDato,
        } as IPvkDokumentListItem
      })

    setAllPvkDocumentListItem(sortedPvk)
    setFilteredPvkDokuement(sortedPvk)
  }, [allPvoTilbakemelding])

  useEffect(() => {
    let filteredData: IPvkDokumentListItem[] = allPvkDocumentListItem

    if (statusFilter !== 'alle') {
      if (statusFilter === 'ikke_påbegynt') {
        filteredData = allPvkDocumentListItem.filter(
          (pvk) => !allPvoTilbakemelding.map((pvo) => pvo.pvkDokumentId).includes(pvk.id)
        )
      } else {
        filteredData = allPvkDocumentListItem.filter((pvk) =>
          allPvoTilbakemelding
            .filter((pvo) => pvo.status === statusFilter)
            .map((pvo) => pvo.pvkDokumentId)
            .includes(pvk.id)
        )
      }
    } else {
      filteredData = allPvkDocumentListItem
    }

    if (seachPvk !== '') {
      filteredData = filteredData.filter((pvk) => {
        const pvkName = 'E' + pvk.etterlevelseNummer + ' ' + pvk.title

        return pvkName.toLowerCase().includes(seachPvk.toLowerCase())
      })
    }

    setFilteredPvkDokuement(filteredData)
  }, [statusFilter, seachPvk])

  return (
    <div>
      {isLoading && <Skeleton variant='rectangle' />}
      {!isLoading && (
        <div>
          <div id='pvo filter' className='flex items-end w-full gap-11 pb-5 pt-8 pl-7'>
            <Select
              label='Filtrér status'
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value='alle'>Alle</option>
              <option value='ikke_påbegynt'>Ikke påbegynt</option>
              <option value={EPvoTilbakemeldingStatus.UNDERARBEID}>Påbegynt</option>
              <option value={EPvoTilbakemeldingStatus.FERDIG}>Sendt tilbake</option>
            </Select>

            <Search
              label='Søk'
              variant='secondary'
              onChange={(value) => setSearchPvk(value)}
              className='w-[75ch]'
              hideLabel={false}
            />
          </div>
          <div className='w-full justify-center my-4 pl-7'>
            <div className='flex justify-center content-center w-full'>
              <div className='flex justify-start align-middle w-full'>
                <Label size='medium'>
                  {/* {kravene.totalElements ? kravene.totalElements : 0}  */}
                  {filteredPvkDokument.length} PVK dokumenter
                </Label>
              </div>
            </div>
          </div>
          <List className='mb-2.5 flex flex-col gap-2'>
            {filteredPvkDokument &&
              filteredPvkDokument.map((pvkDokument: IPvkDokumentListItem) => {
                const pvoTilbakemelding = allPvoTilbakemelding.filter(
                  (pvo) => pvo.pvkDokumentId === pvkDokument.id
                )

                let changestamp = ''

                if (
                  pvoTilbakemelding.length !== 0 &&
                  pvoTilbakemelding[0].status === EPvoTilbakemeldingStatus.FERDIG
                ) {
                  changestamp = `Vurdering sendt: ${moment(pvoTilbakemelding[0].sendtDato).format('ll')}`
                } else {
                  const date =
                    pvkDokument.sendtTilPvoDato !== '' && pvkDokument.sendtTilPvoDato !== null
                      ? moment(pvkDokument.sendtTilPvoDato).format('ll')
                      : moment(pvkDokument.changeStamp.lastModifiedDate).format('ll')
                  changestamp = `Mottat: ${date}`
                }

                return (
                  <ListLayout2
                    key={pvkDokument.id}
                    id={pvkDokument.id}
                    url={pvkDokumenteringPvoTilbakemeldingUrl(pvkDokument.id, 1)}
                    title={`E${pvkDokument.etterlevelseNummer} ${pvkDokument.title}`}
                    status={
                      <PvoStatusView
                        status={
                          pvoTilbakemelding.length !== 0 ? pvoTilbakemelding[0].status : undefined
                        }
                      />
                    }
                    changeStamp={changestamp}
                  />
                )
              })}
          </List>
        </div>
      )}
    </div>
  )
}
