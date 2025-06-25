import { Alert, BodyLong, Button, Label } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import { ICode } from '../../services/Codelist'
import { Markdown } from '../common/Markdown'
import AlertPvoModal from './common/AlertPvoModal'
import DataTextWrapper from './common/DataTextWrapper'
import {
  BeskjedTilbakemeldingEtterlever,
  CopyButtonCommon,
  LagreFortsettSenereButton,
} from './common/SendInnPvoView'
import PvoFormButtons from './edit/PvoFormButtons'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  activeStep: number
  dirty: boolean
  submitForm: () => Promise<void>
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvoTilbakemelding>>
  setSubmittedStatus: (value: SetStateAction<EPvoTilbakemeldingStatus>) => void
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  isAlertModalOpen: boolean
  setIsAlertModalOpen: Dispatch<SetStateAction<boolean>>
  pvoVurderingList: ICode[]
}

export const SendInnPvoViewFerdig: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  activeStep,
  dirty,
  submitForm,
  setFieldValue,
  setSubmittedStatus,
  setActiveStep,
  setSelectedStep,
  isAlertModalOpen,
  setIsAlertModalOpen,
  pvoVurderingList,
}) => {
  const getPvoVurdering = () => {
    const vurderingen = pvoVurderingList.filter(
      (vurdering) => vurdering.code === pvoTilbakemelding.pvoVurdering
    )
    if (vurderingen.length === 0) {
      return ''
    } else {
      return vurderingen[0].description
    }
  }

  return (
    <div className='pt-6 flex justify-center'>
      <div>
        <BeskjedTilbakemeldingEtterlever pvkDokument={pvkDokument} />

        <div className='mt-5 mb-3 max-w-[75ch]'>
          <div className='mb-3'>
            <Label>Beskjed til etterlever</Label>
            <DataTextWrapper>
              {pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier &&
                pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier.length !== 0 && (
                  <Markdown source={pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier} />
                )}
              <BodyLong>
                {(!pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier ||
                  pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier.length === 0) &&
                  'Ingen tilbakemelding til etterlever'}
              </BodyLong>
            </DataTextWrapper>
          </div>

          <div className='mb-3'>
            <Label>Anbefales det at arbeidet går videre som planlagt?</Label>
            <DataTextWrapper>
              {pvoTilbakemelding.arbeidGarVidere === null
                ? null
                : pvoTilbakemelding.arbeidGarVidere === true
                  ? 'Ja'
                  : 'Nei'}
            </DataTextWrapper>
          </div>

          <div className='mb-3'>
            <Label>Beskriv anbefalingen nærmere:</Label>
            <DataTextWrapper customEmptyMessage='Ingen beskrivelse'>
              {pvoTilbakemelding.arbeidGarVidereBegrunnelse}
            </DataTextWrapper>
          </div>

          <div className='mb-3'>
            <Label>Er det behov for forhåndskonsultasjon med Datatilsynet?</Label>
            <DataTextWrapper>
              {pvoTilbakemelding.behovForForhandskonsultasjon === null
                ? null
                : pvoTilbakemelding.behovForForhandskonsultasjon === true
                  ? 'Ja'
                  : 'Nei'}
            </DataTextWrapper>
          </div>

          <div className='mb-3'>
            <Label>Beskriv anbefalingen nærmere:</Label>
            <DataTextWrapper customEmptyMessage='Ingen beskrivelse'>
              {pvoTilbakemelding.behovForForhandskonsultasjonBegrunnelse}
            </DataTextWrapper>
          </div>

          <div className='mb-3'>
            <Label>Personvernombudets vurdering</Label>
            <DataTextWrapper>{getPvoVurdering()}</DataTextWrapper>
          </div>

          <div className='mb-3'>
            <Label>PVO vil følge opp endringer dere gjør.</Label>
            <DataTextWrapper>
              {pvoTilbakemelding.pvoFolgeOppEndringer === null
                ? null
                : pvoTilbakemelding.pvoFolgeOppEndringer === true
                  ? 'Ja'
                  : 'Nei'}
            </DataTextWrapper>
          </div>

          <div className='mb-3'>
            <Label>PVO vil få PVK i retur etter at dere har gjennomgått tilbakemeldinger.</Label>
            <DataTextWrapper>
              {pvoTilbakemelding.vilFaPvkIRetur === null
                ? null
                : pvoTilbakemelding.vilFaPvkIRetur === true
                  ? 'Ja'
                  : 'Nei'}
            </DataTextWrapper>
          </div>
        </div>

        <CopyButtonCommon />

        <Alert variant='success' className='my-5'>
          Tilbakemelding er sendt
        </Alert>

        <PvoFormButtons
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setSelectedStep={setSelectedStep}
          submitForm={submitForm}
          customButtons={
            <div className='mt-5 flex gap-2 items-center'>
              {!dirty && <div className='min-w-[223px]'></div>}
              {dirty && (
                <LagreFortsettSenereButton
                  setFieldValue={setFieldValue}
                  setSubmittedStatus={setSubmittedStatus}
                  submitForm={submitForm}
                />
              )}

              <Button
                type='button'
                variant='secondary'
                onClick={async () => {
                  await setFieldValue('status', EPvoTilbakemeldingStatus.UNDERARBEID)
                  setSubmittedStatus(EPvoTilbakemeldingStatus.UNDERARBEID)
                  await submitForm()
                }}
              >
                Angre tilbakemelding
              </Button>
            </div>
          }
        />
      </div>

      <AlertPvoModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        pvkDokumentId={pvkDokument.id}
      />
    </div>
  )
}

export default SendInnPvoViewFerdig
