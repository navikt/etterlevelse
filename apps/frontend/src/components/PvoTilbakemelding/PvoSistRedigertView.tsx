import { useQuery } from '@apollo/client'
import { Label, List, Loader } from '@navikt/ds-react'
import moment from 'moment'
import { EPVO, EPvkDokumentStatus, IPageResponse, TPvoTilbakemeldingQL } from '../../constants'
import { TPvoVariables, getPvoTilbakemeldingListQuery } from '../../query/PvoTilbakemeldingQuery'
import { ListLayout } from '../common/ListLayout'
import PvoStatusView from './common/PvoStatusView'

export const PvoSistRedigertView = () => {
  const { data, loading: isLoading } = useQuery<
    { pvoTilbakemeldinger: IPageResponse<TPvoTilbakemeldingQL> },
    TPvoVariables
  >(getPvoTilbakemeldingListQuery, {
    variables: { sistRedigert: 20, pageSize: 200 },
  })

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
              <div className='flex justify-start align-middle w-full'>
                <Label size='medium'>
                  {data?.pvoTilbakemeldinger.numberOfElements} PVK dokumenter
                </Label>
              </div>
            </div>
          </div>
          <List className='mb-2.5 flex flex-col gap-2'>
            {data &&
              data.pvoTilbakemeldinger &&
              data.pvoTilbakemeldinger.content.map((pvoTilbakemelding: TPvoTilbakemeldingQL) => (
                <ListLayout
                  key={pvoTilbakemelding.id}
                  id={pvoTilbakemelding.id}
                  url={`/pvkdokument/${pvoTilbakemelding.pvkDokumentId}${EPVO.tilbakemelding}/1`}
                  documentNumber={`E${pvoTilbakemelding.etterlevelseDokumentasjonData.etterlevelseNummer}`}
                  title={pvoTilbakemelding.etterlevelseDokumentasjonData.title}
                  status={
                    <PvoStatusView
                      status={pvoTilbakemelding.pvkDokumentStatus as EPvkDokumentStatus}
                    />
                  }
                  upperRightField='PVK dokument ble'
                  changeStamp={`sist endret av meg: ${moment(pvoTilbakemelding.sistEndretAvMeg).format('ll')}`}
                />
              ))}
          </List>
        </div>
      )}
    </div>
  )
}
export default PvoSistRedigertView
