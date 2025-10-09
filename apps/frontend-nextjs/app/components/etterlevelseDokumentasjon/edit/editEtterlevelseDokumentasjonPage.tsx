'use client'

import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { UserContext } from '@/provider/user/userProvider'
import {
  etterlevelseDokumentasjonIdUrl,
  etterlevelseDokumentasjonerUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { Alert, Loader } from '@navikt/ds-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useContext } from 'react'
import EtterlevelseDokumentasjonForm from '../form/etterlevelseDokumentasjonForm'

export const EditEtterlevelseDokumentasjonPage = () => {
  const params = useParams<{ etterlevelseDokumentasjonId?: string }>()
  const user = useContext(UserContext)
  const [etterlevelseDokumentasjon, , isLoading] = useEtterlevelseDokumentasjon(
    params.etterlevelseDokumentasjonId
  )

  return (
    <>
      {isLoading && (
        <div className='flex w-full justify-center items-center mt-5'>
          <Loader size='3xlarge' className='flex justify-self-center' />
        </div>
      )}
      {!isLoading && etterlevelseDokumentasjon && (
        <PageLayout
          pageTitle='Redigér etterlevelsesdokumentet'
          currentPage='Redigér etterlevelsesdokumentet'
          breadcrumbPaths={[
            {
              href: etterlevelseDokumentasjonerUrl(),
              pathName: 'Dokumentere etterlevelse',
            },
            {
              href: etterlevelseDokumentasjonIdUrl(params.etterlevelseDokumentasjonId),
              pathName: `E${etterlevelseDokumentasjon.etterlevelseNummer} ${etterlevelseDokumentasjon.title}`,
            },
          ]}
        >
          {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
            <EtterlevelseDokumentasjonForm
              title='Redigér etterlevelsesdokumentet'
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              isEditButton
            />
          )}

          {!etterlevelseDokumentasjon.hasCurrentUserAccess && !user.isAdmin() && (
            <div className='flex w-full justify-center'>
              <div className='flex items-center flex-col gap-5'>
                <Alert variant='warning'>Du har ikke tilgang til å redigere egenskaper.</Alert>

                <Image
                  src='https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXMyNngxa2djMXdhOXdhcXQwNG9hbWJ3czZ4MW42bDY3ZXVkNHd3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zaCojXv2S01zy/giphy.webp'
                  alt='no no no'
                  width='400'
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
