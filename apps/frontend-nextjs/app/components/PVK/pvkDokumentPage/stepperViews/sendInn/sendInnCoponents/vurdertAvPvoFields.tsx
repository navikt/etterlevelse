'use client'

import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Alert, Button, Heading, Loader, Modal, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, useMemo, useState } from 'react'
import CopyAndExportButtons from './copyAndExportButtons'
import TilbakemeldingsHistorikk from './readOnly/TilbakemeldingsHistorikk'
import SendTilPvo from './vurdertAvPvoComponents.tsx/SendTilPvo'
import SendTilRisikoeier from './vurdertAvPvoComponents.tsx/SendTilRisikoeier'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  etterlevelseDokumentVersjon: number
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  isLoading: boolean
  errorSummaryComponent: ReactNode
  savedAlert: ReactNode
  pvoVurderingList: ICode[]
}

export const VurdertAvPvoFields: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  etterlevelseDokumentVersjon,
  setFieldValue,
  isLoading,
  errorSummaryComponent,
  savedAlert,
  pvoVurderingList,
}) => {
  const relevantMeldingTilPvo = pvkDokument.meldingerTilPvo.filter(
    (melding) =>
      melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1 &&
      melding.etterlevelseDokumentVersjon === etterlevelseDokumentVersjon
  )

  const [isNullstillModalOpen, setIsNullstillModalOpen] = useState<boolean>(false)

  const relevantIndex = useMemo(() => {
    if (relevantMeldingTilPvo.length === 0) {
      return pvkDokument.meldingerTilPvo.length
    } else {
      return pvkDokument.meldingerTilPvo.findIndex(
        (melding) =>
          melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1 &&
          melding.etterlevelseDokumentVersjon === etterlevelseDokumentVersjon
      )
    }
  }, [pvkDokument, relevantMeldingTilPvo.length, etterlevelseDokumentVersjon])

  return (
    <Field>
      {(fieldProps: FieldProps) => (
        <div className='w-full'>
          <div className='w-full flex justify-center'>
            <div className='w-full max-w-[75ch]'>
              <TilbakemeldingsHistorikk
                antallInnsendingTilPvo={pvkDokument.antallInnsendingTilPvo}
                meldingerTilPvo={pvkDokument.meldingerTilPvo}
                vurderinger={pvoTilbakemelding.vurderinger}
                pvoVurderingList={pvoVurderingList}
                etterlevelseDokumentVersjon={etterlevelseDokumentVersjon}
                defaultFirstOpen
              />

              <div className='pt-9 mb-3'>
                <Heading size='medium' level='2' className='mb-5'>
                  Send oppdatert PVK
                </Heading>

                <RadioGroup
                  legend='Hvem skal dere sende PVK-en til?'
                  onChange={async (value: boolean) => {
                    await setFieldValue('berOmNyVurderingFraPvo', value)
                  }}
                  value={fieldProps.form.values.berOmNyVurderingFraPvo}
                  description='PVO har ikke bedt om å få deres PVK i retur, og da skal dere i utgangspunktet sende til risikoeier for godkjenning. Men dersom risikobildet er endret siden dere sendte inn til PVO sist, burde dere sende til PVO for ny vurdering.'
                >
                  <Radio value={false}>Risikoeier, til godkjenning</Radio>
                  <Radio value={true}>PVO, til ny vurdering</Radio>
                </RadioGroup>

                <div className='mb-2'>
                  <Button
                    size='small'
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      setIsNullstillModalOpen(true)
                    }}
                  >
                    Nullstill valg
                  </Button>

                  {isNullstillModalOpen && (
                    <Modal
                      header={{ heading: 'Er du sikker på at du vil nullstille valg?' }}
                      open={isNullstillModalOpen}
                      onClose={() => setIsNullstillModalOpen(false)}
                    >
                      <Modal.Footer>
                        <Button
                          type='button'
                          variant='primary'
                          onClick={async () => {
                            await setFieldValue('berOmNyVurderingFraPvo', null)
                            await fieldProps.form.submitForm().then(() => {
                              setIsNullstillModalOpen(false)
                            })
                          }}
                        >
                          Nullstill valg
                        </Button>
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={() => setIsNullstillModalOpen(false)}
                        >
                          Avbryt
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  )}
                </div>

                {fieldProps.form.values.berOmNyVurderingFraPvo === false && (
                  <SendTilRisikoeier fieldProps={fieldProps} />
                )}
                {fieldProps.form.values.berOmNyVurderingFraPvo === true && (
                  <SendTilPvo
                    relevantIndex={relevantIndex}
                    pvkDokument={pvkDokument}
                    fieldProps={fieldProps}
                  />
                )}
              </div>

              {relevantMeldingTilPvo.length !== 0 &&
                !['', null].includes(relevantMeldingTilPvo[0].sendtTilPvoDato) && (
                  <Alert variant='info' className='my-5'>
                    Innsending til PVO trukket <br />
                    Etter at dere blir ferdig med endringer, må dere sende inn på nytt. PVK-en blir
                    deretter behandlet som en ny innsending
                  </Alert>
                )}

              {errorSummaryComponent}

              {isLoading && (
                <div className='flex justify-center items-center w-full'>
                  <Loader size='2xlarge' title='lagrer endringer' />
                </div>
              )}

              <div>{!fieldProps.form.dirty && savedAlert}</div>
            </div>
          </div>

          <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
        </div>
      )}
    </Field>
  )
}
export default VurdertAvPvoFields
