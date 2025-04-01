import { Alert, Loader } from '@navikt/ds-react'
import { useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../../../api/EtterlevelseDokumentasjonApi'
import { user } from '../../../services/User'
import { PageLayout } from '../../scaffold/Page'
import EtterlevelseDokumentasjonForm from './EtterlevelseDokumentasjonForm'

export const EditEtterlevelseDokumentasjonPage = () => {
  const params = useParams<{ id?: string }>()

  const [etterlevelseDokumentasjon, , isLoading] = useEtterlevelseDokumentasjon(params.id)

  return (
    <>
      {isLoading && (
        <div className='flex w-full justify-center items-center mt-5'>
          <Loader size='3xlarge' className='flex justify-self-center' />
        </div>
      )}
      {!isLoading && etterlevelseDokumentasjon && (
        <PageLayout
          pageTitle='Rediger etterlevelsesdokumentet'
          currentPage='Rediger etterlevelsesdokumentet'
          breadcrumbPaths={[
            { href: '/dokumentasjoner', pathName: 'Dokumentere etterlevelse' },
            {
              href: '/dokumentasjon/' + params.id,
              pathName: `E${etterlevelseDokumentasjon.etterlevelseNummer} ${etterlevelseDokumentasjon.title}`,
            },
          ]}
        >
          {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
            <EtterlevelseDokumentasjonForm
              title='Rediger etterlevelsesdokumentet'
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              isEditButton
            />
          )}

          {!etterlevelseDokumentasjon.hasCurrentUserAccess && !user.isAdmin() && (
            <div className='flex w-full justify-center'>
              <div className='flex items-center flex-col gap-5'>
                <Alert variant='warning'>Du har ikke tilgang til å redigere egenskaper.</Alert>

                <img
                  src='https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXMyNngxa2djMXdhOXdhcXQwNG9hbWJ3czZ4MW42bDY3ZXVkNHd3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zaCojXv2S01zy/giphy.webp'
                  alt='no no no'
                  width='400px'
                />
              </div>
            </div>
          )}
        </PageLayout>
      )}
    </>
  )
}
export default EditEtterlevelseDokumentasjonPage
