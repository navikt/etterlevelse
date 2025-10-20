'use client'

import { arkiver } from '@/api/p360/p360Api'
import ExportPvkModal from '@/components/PVK/export/exportPvkModal'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { Button, Loader } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, useContext } from 'react'
import BeskjedFraRisikoeierReadOnly from '../../readOnlyViews/beskjedFraRisikoeierReadOnly'
import CopyAndStatusView from './copyAndStatusView'
import { BeskjedFraPvoReadOnly } from './readOnly/beskjedFraPvoReadOnly'
import BeskjedTilPvoReadOnly from './readOnly/beskjedTilPvoReadOnly'
import BeskjedTilRisikoeierReadOnly from './readOnly/beskjedTilRisikoeierReadOnly'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  isLoading: boolean
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  submitForm: () => Promise<void>
  errorSummaryComponent: ReactNode
  setAngretAvRisikoeier: (state: boolean) => void
  pvoVurderingList: ICode[]
}

export const GodkjentAvRisikoeierFields: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  etterlevelseDokumentasjon,
  isLoading,
  setFieldValue,
  submitForm,
  errorSummaryComponent,
  setAngretAvRisikoeier,
  pvoVurderingList,
}) => {
  const user = useContext(UserContext)
  const isRisikoeierCheck: boolean =
    etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent()) || user.isAdmin()

  return (
    <div>
      <BeskjedTilPvoReadOnly pvkDokument={pvkDokument} />
      <BeskjedFraPvoReadOnly
        pvoTilbakemelding={pvoTilbakemelding}
        pvoVurderingList={pvoVurderingList}
      />
      <BeskjedTilRisikoeierReadOnly merknadTilRisikoeier={pvkDokument.merknadTilRisikoeier} />
      <BeskjedFraRisikoeierReadOnly merknadFraRisikoeier={pvkDokument.merknadFraRisikoeier} />

      <CopyAndStatusView pvkDokumentStatus={pvkDokument.status} />

      {errorSummaryComponent}

      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}

      {isRisikoeierCheck && (
        <div className='mt-5 flex gap-2 items-center'>
          <Button
            type='button'
            onClick={async () => {
              setAngretAvRisikoeier(true)
              await setFieldValue('status', EPvkDokumentStatus.TRENGER_GODKJENNING)
              await submitForm()
            }}
          >
            Angre godkjenning
          </Button>

          {user.isAdmin() && (
            <Button
              type='button'
              onClick={async () => {
                await arkiver(etterlevelseDokumentasjon.id, true, false, true)
              }}
            >
              Arkiver kun synlig for ADMIN :D
            </Button>
          )}
        </div>
      )}

      <div className='w-full flex justify-end items-center'>
        <ExportPvkModal etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
      </div>
    </div>
  )
}
export default GodkjentAvRisikoeierFields
