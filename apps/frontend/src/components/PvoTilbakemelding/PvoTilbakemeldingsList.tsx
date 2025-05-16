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

interface IAnsvarligItem {
  key: string
  value: string
}

export const PvoTilbakemeldingsList = () => {
  const [allPvkDocumentListItem, setAllPvkDocumentListItem] = useState<IPvkDokumentListItem[]>([])
  const [allPvoTilbakemelding, setAllPvoTilbakemelding] = useState<IPvoTilbakemelding[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('alle')
  const [ansvarligFilter, setAnsvarligFilter] = useState<string>('')
  const [ansvarligList, setAnsvarligList] = useState<IAnsvarligItem[]>([])
  const [seachPvk, setSearchPvk] = useState<string>('')

  const [filteredPvkDokument, setFilteredPvkDokuement] = useState<IPvkDokumentListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await getAllPvkDokumentListItem().then((response: IPvkDokumentListItem[]) => {
        const filteredPvkDokument: IPvkDokumentListItem[] = response.filter(
          (pvkDok: IPvkDokumentListItem) =>
            pvkDok.status !== EPvkDokumentStatus.AKTIV &&
            pvkDok.status !== EPvkDokumentStatus.UNDERARBEID
        )
        setAllPvkDocumentListItem(filteredPvkDokument)
        setFilteredPvkDokuement(filteredPvkDokument)
      })

      await getAllPvoTilbakemelding().then((response: IPvoTilbakemelding[]) => {
        setAllPvoTilbakemelding(response)
        const list: IAnsvarligItem[] = []
        response.forEach((tilbakemelding: IPvoTilbakemelding) => {
          if (tilbakemelding.ansvarligData && tilbakemelding.ansvarligData.length !== 0) {
            list.push(
              ...tilbakemelding.ansvarligData.map((data) => {
                return { key: data.navIdent, value: data.fullName }
              })
            )
          }
        })

        setAnsvarligList(
          list.filter(
            (object, index, arr) =>
              arr.findIndex((item) => JSON.stringify(item) === JSON.stringify(object)) === index
          )
        )
      })

      setIsLoading(false)
    })()
  }, [])

  useEffect(() => {
    const unsortedData: any = [
      ...allPvkDocumentListItem.map((pvk: IPvkDokumentListItem) => {
        const pvoTilbakemelding: IPvoTilbakemelding[] = allPvoTilbakemelding.filter(
          (pvo: IPvoTilbakemelding) => pvo.pvkDokumentId === pvk.id
        )

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
          sendtTilPvoAv:
            data.sendtTilPvoAv === '' || data.sendtTilPvoAv === undefined
              ? ''
              : data.sendtTilPvoAv.split('-')[1],
        } as IPvkDokumentListItem
      })

    setAllPvkDocumentListItem(sortedPvk)
    setFilteredPvkDokuement(sortedPvk)
  }, [allPvoTilbakemelding])

  useEffect(() => {
    let filteredData: IPvkDokumentListItem[] = allPvkDocumentListItem

    if (statusFilter !== 'alle') {
      if (statusFilter === EPvoTilbakemeldingStatus.IKKE_PABEGYNT) {
        filteredData = allPvkDocumentListItem.filter(
          (pvk: IPvkDokumentListItem) =>
            !allPvoTilbakemelding
              .map((pvo: IPvoTilbakemelding) => pvo.pvkDokumentId)
              .includes(pvk.id) ||
            allPvoTilbakemelding
              .filter((pvo) => pvo.status === EPvoTilbakemeldingStatus.IKKE_PABEGYNT)
              .map((pvo: IPvoTilbakemelding) => pvo.pvkDokumentId)
              .includes(pvk.id)
        )
      } else if (statusFilter === 'avventer') {
        filteredData = allPvkDocumentListItem.filter((pvk: IPvkDokumentListItem) =>
          allPvoTilbakemelding
            .filter((pvo: IPvoTilbakemelding) => pvo.avventer)
            .map((pvo: IPvoTilbakemelding) => pvo.pvkDokumentId)
            .includes(pvk.id)
        )
      } else {
        filteredData = allPvkDocumentListItem.filter((pvk: IPvkDokumentListItem) =>
          allPvoTilbakemelding
            .filter((pvo: IPvoTilbakemelding) => pvo.status === statusFilter)
            .map((pvo: IPvoTilbakemelding) => pvo.pvkDokumentId)
            .includes(pvk.id)
        )
      }
    } else {
      filteredData = allPvkDocumentListItem
    }

    if (!['', 'alle'].includes(ansvarligFilter)) {
      filteredData = filteredData.filter((pvk: IPvkDokumentListItem) =>
        allPvoTilbakemelding
          .filter(
            (pvo: IPvoTilbakemelding) =>
              pvo.ansvarlig && pvo.ansvarlig.length !== 0 && pvo.ansvarlig.includes(ansvarligFilter)
          )
          .map((pvo: IPvoTilbakemelding) => pvo.pvkDokumentId)
          .includes(pvk.id)
      )
    }

    if (seachPvk !== '') {
      filteredData = filteredData.filter((pvk: IPvkDokumentListItem) => {
        const pvkName: string = `${pvk.etterlevelseNummer} ${pvk.title}`

        return pvkName.toLowerCase().includes(seachPvk.toLowerCase())
      })
    }

    setFilteredPvkDokuement(filteredData)
  }, [statusFilter, ansvarligFilter, seachPvk])

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
              <option value={EPvoTilbakemeldingStatus.IKKE_PABEGYNT}>Ikke påbegynt</option>
              <option value={EPvoTilbakemeldingStatus.UNDERARBEID}>Påbegynt</option>
              <option value={'avventer'}>Avventer</option>
              <option value={EPvoTilbakemeldingStatus.TRENGER_KONTROL}>
                (PVO) Trenger kontroll
              </option>
              <option value={EPvoTilbakemeldingStatus.SNART_FERDIG}>Straks ferdig</option>
              <option value={EPvoTilbakemeldingStatus.FERDIG}>Sendt tilbake</option>
            </Select>

            <Select
              label='Filtrér ansvarlig'
              value={ansvarligFilter}
              onChange={(event) => setAnsvarligFilter(event.target.value)}
            >
              <option value='alle'>Alle</option>
              {ansvarligList.length === 0 && <option value=''>Finner ingen ansvarlig</option>}
              {ansvarligList.length !== 0 &&
                ansvarligList.map((ansvarlig) => (
                  <option value={ansvarlig.key} key={ansvarlig.key}>
                    {ansvarlig.value}
                  </option>
                ))}
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
                  (pvo: IPvoTilbakemelding) => pvo.pvkDokumentId === pvkDokument.id
                )

                let changestamp = ''

                if (
                  pvoTilbakemelding.length !== 0 &&
                  pvoTilbakemelding[0].status === EPvoTilbakemeldingStatus.FERDIG
                ) {
                  changestamp = `Vurdering sendt: ${moment(pvoTilbakemelding[0].sendtDato).format('LL')}`
                } else {
                  const date: string =
                    pvkDokument.sendtTilPvoDato !== '' && pvkDokument.sendtTilPvoDato !== null
                      ? moment(pvkDokument.sendtTilPvoDato).format('LL')
                      : moment(pvkDokument.changeStamp.lastModifiedDate).format('LL')
                  changestamp = `Mottat: ${date}, fra ${pvkDokument.sendtTilPvoAv}`
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
                        isAvventer={
                          pvoTilbakemelding.length !== 0 ? pvoTilbakemelding[0].avventer : false
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
