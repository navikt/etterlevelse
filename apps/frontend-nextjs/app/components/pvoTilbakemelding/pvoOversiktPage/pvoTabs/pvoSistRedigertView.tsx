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
import { Label, List } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'

export const PvoSistRedigertView = () => {
  const { data, loading: isLoading } = useQuery<
    { pvoTilbakemeldinger: IPageResponse<TPvoTilbakemeldingQL> },
    TPvoVariables
  >(getPvoTilbakemeldingListQuery, {
    variables: { sistRedigert: 20, pageSize: 200 },
  })

  const [sortedPvoTilbakemelding, setSortedPvoTilbakemelding] = useState<TPvoTilbakemeldingQL[]>([])

  useEffect(() => {
    if (!isLoading && data && data.pvoTilbakemeldinger.numberOfElements !== 0) {
      //sort wont work without spread copy for some wierd reason
      setSortedPvoTilbakemelding(
        [...data.pvoTilbakemeldinger.content].sort(
          (a: TPvoTilbakemeldingQL, b: TPvoTilbakemeldingQL) =>
            b.sistEndretAvMeg.localeCompare(a.sistEndretAvMeg)
        )
      )
    }
  }, [isLoading, data])

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
            {sortedPvoTilbakemelding.length !== 0 &&
              sortedPvoTilbakemelding.map((pvoTilbakemelding: TPvoTilbakemeldingQL) => (
                <ListLayout2
                  key={pvoTilbakemelding.id}
                  id={pvoTilbakemelding.id}
                  url={pvkDokumenteringPvoTilbakemeldingUrl(pvoTilbakemelding.pvkDokumentId, 1)}
                  title={`E${pvoTilbakemelding.etterlevelseDokumentasjonData.etterlevelseNummer} ${pvoTilbakemelding.etterlevelseDokumentasjonData.title}`}
                  status={
                    <PvoStatusView
                      pvkDokumentStatus={pvoTilbakemelding.pvkDokumentStatus as EPvkDokumentStatus}
                      status={pvoTilbakemelding.status}
                      etterlystReturn={pvoTilbakemelding.vilFaPvkIRetur}
                    />
                  }
                  changeStamp={`
                    Sist endret av meg: ${moment(pvoTilbakemelding.sistEndretAvMeg).format('LL')}`}
                />
              ))}
          </List>
        </div>
      )}
    </div>
  )
}

export default PvoSistRedigertView
