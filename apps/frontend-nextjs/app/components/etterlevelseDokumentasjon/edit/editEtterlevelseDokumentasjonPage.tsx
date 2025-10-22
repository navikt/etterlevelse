'use client'

import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import ForbiddenAlert from '@/components/common/forbiddenAlert'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { UserContext } from '@/provider/user/userProvider'
import {
  etterlevelseDokumentasjonIdUrl,
  etterlevelseDokumentasjonerUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { Loader } from '@navikt/ds-react'
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

          {!etterlevelseDokumentasjon.hasCurrentUserAccess && !user.isAdmin() && <ForbiddenAlert />}
        </PageLayout>
      )}
    </>
  )
}
export default EditEtterlevelseDokumentasjonPage
