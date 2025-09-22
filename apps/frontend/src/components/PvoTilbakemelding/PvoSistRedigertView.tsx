import { useQuery } from '@apollo/client'
import { Label, List, Loader } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { EPvkDokumentStatus, IPageResponse, TPvoTilbakemeldingQL } from '../../constants'
import { TPvoVariables, getPvoTilbakemeldingListQuery } from '../../query/PvoTilbakemeldingQuery'
import { ListLayout2 } from '../common/ListLayout'
import { pvkDokumenteringPvoTilbakemeldingUrl } from '../common/RouteLinkPvk'
import PvoStatusView from './common/PvoStatusView'

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
      {isLoading && (
        <div className='flex w-full justify-center items-center mt-5'>
          <Loader size='3xlarge' className='flex justify-self-center' />
        </div>
      )}

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
