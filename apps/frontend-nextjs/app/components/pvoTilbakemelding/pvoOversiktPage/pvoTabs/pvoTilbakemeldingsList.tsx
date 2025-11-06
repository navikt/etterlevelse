import { getAllPvkDokumentListItem } from '@/api/pvkDokument/pvkDokumentApi'
import { getAllPvoTilbakemelding } from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import { ListLayout2 } from '@/components/krav/kravlistePage/kravTabs/sisteRedigertKrav/listLayout/listLayout'
import PvoStatusView from '@/components/pvoTilbakemelding/common/pvoStatusView'
import {
  EPvkDokumentStatus,
  IPvkDokumentListItem,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { pvkDokumenteringPvoTilbakemeldingUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Label, List, Search, Select, Skeleton } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'

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
  const [searchPvk, setSearchPvk] = useState<string>('')

  const [filteredPvkDokument, setFilteredPvkDokuement] = useState<IPvkDokumentListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await getAllPvkDokumentListItem().then((response: IPvkDokumentListItem[]) => {
        const filteredPvkDokument: IPvkDokumentListItem[] = response.filter(
          (pvkDok: IPvkDokumentListItem) => pvkDok.status !== EPvkDokumentStatus.UNDERARBEID
        )
        setAllPvkDocumentListItem(filteredPvkDokument)
        setFilteredPvkDokuement(filteredPvkDokument)
      })

      await getAllPvoTilbakemelding().then((response: IPvoTilbakemelding[]) => {
        setAllPvoTilbakemelding(response)
        const list: IAnsvarligItem[] = []
        response.forEach((tilbakemelding: IPvoTilbakemelding) => {
          tilbakemelding.vurderinger.forEach((vurdering) => {
            if (vurdering.ansvarligData && vurdering.ansvarligData.length !== 0) {
              list.push(
                ...vurdering.ansvarligData.map((data) => {
                  return { key: data.navIdent, value: data.fullName }
                })
              )
            }
          })
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
        if (
          pvoTilbakemelding.length !== 0 &&
          pvoTilbakemelding[0].status === EPvoTilbakemeldingStatus.FERDIG
        ) {
          const vurdering = pvoTilbakemelding[0].vurderinger.find(
            (vurdering) => vurdering.innsendingId === pvk.antallInnsendingTilPvo
          )
          if (vurdering && vurdering.sendtDato) {
            return {
              ...pvk,
              dateToCompare: vurdering.sendtDato,
            }
          } else if (pvk.sendtTilPvoDato !== null && pvk.sendtTilPvoDato !== '') {
            return {
              ...pvk,
              dateToCompare: pvk.sendtTilPvoDato,
            }
          } else {
            return {
              ...pvk,
              dateToCompare: pvk.changeStamp.lastModifiedDate,
            }
          }
        } else {
          return {
            ...pvk,
            dateToCompare: pvk.changeStamp.lastModifiedDate,
          }
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
            data.sendtTilPvoAv === '' || data.sendtTilPvoAv === null
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
            .filter((pvo: IPvoTilbakemelding) => pvo.status === EPvoTilbakemeldingStatus.AVVENTER)
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
          .filter((pvo: IPvoTilbakemelding) => {
            const sortedPvoVurderinger = pvo.vurderinger.sort(
              (a, b) => b.innsendingId - a.innsendingId
            )
            const latestVurdering = sortedPvoVurderinger[0]
            return (
              latestVurdering.ansvarlig &&
              latestVurdering.ansvarlig.length !== 0 &&
              latestVurdering.ansvarlig.includes(ansvarligFilter)
            )
          })
          .map((pvo: IPvoTilbakemelding) => pvo.pvkDokumentId)
          .includes(pvk.id)
      )
    }

    if (searchPvk !== '') {
      filteredData = filteredData.filter((pvk: IPvkDokumentListItem) => {
        const pvkName: string = `E${pvk.etterlevelseNummer} ${pvk.title}`

        return pvkName.toLowerCase().includes(searchPvk.toLowerCase())
      })
    }

    setFilteredPvkDokuement(filteredData)
  }, [statusFilter, ansvarligFilter, searchPvk])

  const getLatestVurderingSendtDato = (pvoTilbakemelding: IPvoTilbakemelding) => {
    const sortedVurderinger = pvoTilbakemelding.vurderinger.sort(
      (a, b) => b.innsendingId - a.innsendingId
    )
    const latestVurdering = sortedVurderinger[0]
    return latestVurdering.sendtDato
  }

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
              <option value={EPvoTilbakemeldingStatus.AVVENTER}>Avventer</option>
              <option value={EPvoTilbakemeldingStatus.TIL_KONTROL}>PVO øvrig beslutning</option>
              <option value={EPvoTilbakemeldingStatus.SNART_FERDIG}>Straks ferdig</option>
              <option value={EPvoTilbakemeldingStatus.FERDIG}>Sendt tilbake</option>
              <option value={EPvoTilbakemeldingStatus.UTGAAR}>Utgår</option>
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
                  changestamp = `Vurdering sendt: ${moment(
                    getLatestVurderingSendtDato(pvoTilbakemelding[0])
                  ).format('LL')}`
                } else {
                  const date: string =
                    pvkDokument.sendtTilPvoDato !== '' && pvkDokument.sendtTilPvoDato !== null
                      ? moment(pvkDokument.sendtTilPvoDato).format('LL')
                      : moment(pvkDokument.changeStamp.lastModifiedDate).format('LL')
                  changestamp = `Mottatt: ${date}, fra ${pvkDokument.sendtTilPvoAv}`
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
                        antallInnsendingTilPvo={pvkDokument.antallInnsendingTilPvo}
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
