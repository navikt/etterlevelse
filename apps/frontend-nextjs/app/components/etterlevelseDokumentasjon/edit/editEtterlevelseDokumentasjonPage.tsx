'use client'

import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import ForbiddenAlert from '@/components/common/forbiddenAlert'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EEtterlevelseDokumentasjonStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import {
  etterlevelseDokumentasjonIdUrl,
  etterlevelseDokumentasjonerUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { Loader } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { useContext } from 'react'
import EtterlevelseDokumentasjonForm from '../form/etterlevelseDokumentasjonForm'
import EtterlevelseDokumentasjonFormSendTilGodkjenningState from '../form/etterlevelseDokumentasjonFormSendTilGodkjenningState'

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
          pageTitle='Rediger etterlevelsesdokumentet'
          currentPage='Rediger etterlevelsesdokumentet'
          breadcrumbPaths={[
            {
              href: etterlevelseDokumentasjonerUrl(),
              pathName: 'Dokumentere etterlevelse',
            },
            {
              href: etterlevelseDokumentasjonIdUrl(params.etterlevelseDokumentasjonId),
              pathName: `E${etterlevelseDokumentasjon.etterlevelseNummer}.${etterlevelseDokumentasjon.etterlevelseDokumentVersjon} ${etterlevelseDokumentasjon.title}`,
            },
          ]}
        >
          {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) &&
            etterlevelseDokumentasjon.status === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID && (
              <EtterlevelseDokumentasjonForm
                title='Rediger etterlevelsesdokumentet'
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                isEditButton
              />
            )}

          {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) &&
            etterlevelseDokumentasjon.status !== EEtterlevelseDokumentasjonStatus.UNDER_ARBEID && (
              <EtterlevelseDokumentasjonFormSendTilGodkjenningState
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              />
            )}

          {!etterlevelseDokumentasjon.hasCurrentUserAccess && !user.isAdmin() && <ForbiddenAlert />}
        </PageLayout>
      )}
    </>
  )
}
export default EditEtterlevelseDokumentasjonPage
