'use client'

import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { ListLayout2 } from '@/components/krav/kravlistePage/kravTabs/sisteRedigertKrav/listLayout/listLayout'
import PvoStatusView from '@/components/pvoTilbakemelding/common/pvoStatusView'
import { IPageResponse } from '@/constants/commonConstants'
import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { TPvoTilbakemeldingQL } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import {
  TPvoVariables,
  getPvoTilbakemeldingListQuery,
} from '@/query/personvernombudet/pvoTilbakemeldingQuery'
import { pvkDokumenteringPvoTilbakemeldingUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { useQuery } from '@apollo/client/react'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button, Label, List, Loader } from '@navikt/ds-react'
import moment from 'moment'
import { useMemo, useState } from 'react'

const PAGE_SIZE = 20

export const PvoSistRedigertView = () => {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)

  const { data, loading: isLoading } = useQuery<
    { pvoTilbakemeldinger: IPageResponse<TPvoTilbakemeldingQL> },
    TPvoVariables
  >(getPvoTilbakemeldingListQuery, {
    variables: { sistRedigert: 100000, pageSize: 0 },
  })

  const sortedPvoTilbakemelding = useMemo<TPvoTilbakemeldingQL[]>(() => {
    if (isLoading || !data || data.pvoTilbakemeldinger.numberOfElements === 0) {
      return []
    }

    return [...data.pvoTilbakemeldinger.content].sort(
      (a: TPvoTilbakemeldingQL, b: TPvoTilbakemeldingQL) =>
        b.sistEndretAvMeg.localeCompare(a.sistEndretAvMeg)
    )
  }, [isLoading, data])

  const visiblePvoTilbakemelding = useMemo<TPvoTilbakemeldingQL[]>(
    () => sortedPvoTilbakemelding.slice(0, visibleCount),
    [sortedPvoTilbakemelding, visibleCount]
  )

  return (
    <div>
      {isLoading && <CenteredLoader />}

      {!isLoading && (
        <div>
          <div className='w-full justify-center my-4'>
            <div className='flex justify-center content-center w-full'>
              <div className='flex justify-start align-middle w-full pl-7'>
                <Label size='medium'>
                  {data?.pvoTilbakemeldinger.numberOfElements} PVK dokumenter
                </Label>
              </div>
            </div>
          </div>
          <List className='mb-2.5 flex flex-col gap-2'>
            {visiblePvoTilbakemelding.length !== 0 &&
              visiblePvoTilbakemelding.map((pvoTilbakemelding: TPvoTilbakemeldingQL) => {
                const latestVurdering = pvoTilbakemelding.vurderinger.reduce((prev, current) => {
                  return prev.innsendingId > current.innsendingId ? prev : current
                })

                return (
                  <ListLayout2
                    key={pvoTilbakemelding.id}
                    id={pvoTilbakemelding.id}
                    url={pvkDokumenteringPvoTilbakemeldingUrl(pvoTilbakemelding.pvkDokumentId, 1)}
                    title={`E${pvoTilbakemelding.etterlevelseDokumentasjonData.etterlevelseNummer}.${pvoTilbakemelding.etterlevelseDokumentasjonData.etterlevelseDokumentVersjon} ${pvoTilbakemelding.etterlevelseDokumentasjonData.title}`}
                    status={
                      <PvoStatusView
                        pvkDokumentStatus={
                          pvoTilbakemelding.pvkDokumentStatus as EPvkDokumentStatus
                        }
                        status={pvoTilbakemelding.status}
                        etterlystReturn={latestVurdering.vilFaPvkIRetur}
                        antallInnsendingTilPvo={pvoTilbakemelding.antallInnsendingTilPvo}
                      />
                    }
                    changeStamp={`
                    Sist endret av meg: ${moment(pvoTilbakemelding.sistEndretAvMeg).format('LL')}`}
                  />
                )
              })}
          </List>

          {sortedPvoTilbakemelding.length !== 0 && (
            <div className='flex justify-between mt-10'>
              <div className='flex items-center'>
                <Button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  icon={<PlusIcon title='' aria-label='' aria-hidden />}
                  variant='secondary'
                  disabled={visibleCount >= sortedPvoTilbakemelding.length}
                >
                  Vis flere
                </Button>

                {isLoading && (
                  <div className='ml-2.5'>
                    <Loader size='large' />
                  </div>
                )}
              </div>
              <Label className='mr-2.5'>
                Viser {visiblePvoTilbakemelding.length}/{sortedPvoTilbakemelding.length}
              </Label>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PvoSistRedigertView
