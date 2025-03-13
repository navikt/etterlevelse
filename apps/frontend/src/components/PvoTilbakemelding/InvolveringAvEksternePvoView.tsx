import {
  BodyLong,
  Button,
  Heading,
  Label,
  List,
  Radio,
  RadioGroup,
  ToggleGroup,
} from '@navikt/ds-react'
import { RefObject, useState } from 'react'
import { IPvkDokument } from '../../constants'
import FormButtons from '../PvkDokument/edit/FormButtons'
import { Markdown } from '../common/Markdown'
import TextEditor from '../common/TextEditor/TextEditor'

interface IProps {
  personkategorier: string[]
  databehandlere: string[]
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const InvolveringAvEksternePvoView = (props: IProps) => {
  const {
    personkategorier,
    databehandlere,
    pvkDokument,
    etterlevelseDokumentasjonId,
    activeStep,
    setActiveStep,
    setSelectedStep,
  } = props

  const [mode, setMode] = useState('edit')
  const [value, setValue] = useState('')

  return (
    <div className="w-full">
      <div className="flex w-full">
        <div className="pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8">
          <div className="flex justify-center">
            <div>
              <Heading level="1" size="medium" className="mb-5">
                Involvering av eksterne deltakere
              </Heading>

              <Heading level="2" size="small" className="mb-3">
                Representanter for de registrerte
              </Heading>

              <List
                size="small"
                className="mt-5"
                headingTag="label"
                title="I Behandlingskatalogen står det at dere behandler personopplysninger om:"
              >
                {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
                {personkategorier.length > 0 &&
                  personkategorier.map((personkategori) => (
                    <List.Item key={personkategori}>{personkategori}</List.Item>
                  ))}
              </List>

              <div className="mt-5 mb-3 max-w-[75ch]">
                <Label>Har dere involvert en representant for de registrerte?</Label>
                <BodyLong>{pvkDokument.harInvolvertRepresentant}</BodyLong>
              </div>

              {pvkDokument.representantInvolveringsBeskrivelse && (
                <div className="mt-5 mb-3 max-w-[75ch]">
                  <Label>
                    Utdyp hvordan dere har involvert representant(er) for de registrerte
                  </Label>
                  <BodyLong>{pvkDokument.representantInvolveringsBeskrivelse}</BodyLong>
                </div>
              )}

              {!pvkDokument.representantInvolveringsBeskrivelse && (
                <div className="mt-5 mb-3 max-w-[75ch]">
                  <Label>
                    Utdyp hvorfor dere ikke har involvert representant(er) for de registrerte
                  </Label>
                  <BodyLong>{pvkDokument.representantInvolveringsBeskrivelse}</BodyLong>
                </div>
              )}

              <List className="mt-10" title="Representanter for databehandlere">
                <BodyLong>
                  I Behandlingskatalogen står det at følgende databehandlere benyttes:
                </BodyLong>
                {databehandlere.length === 0 && <List.Item>Ingen</List.Item>}
                {databehandlere.length > 0 &&
                  databehandlere.map((databehandler) => (
                    <List.Item key={databehandler}>{databehandler}</List.Item>
                  ))}
              </List>

              <div className="mt-5 mb-3 max-w-[75ch]">
                <Label>Har dere involvert en representant for databehandlere?</Label>
                <BodyLong>{pvkDokument.harDatabehandlerRepresentantInvolvering}</BodyLong>
              </div>

              {pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse && (
                <div className="mt-5 mb-3 max-w-[75ch]">
                  <Label>
                    Utdyp hvordan dere har involvert representant(er) for databehandler(e)
                  </Label>
                  <BodyLong>{pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse}</BodyLong>
                </div>
              )}

              {!pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse && (
                <div className="mt-5 mb-3 max-w-[75ch]">
                  <Label>
                    Utdyp hvorfor dere ikke har involvert representant(er) for databehandler(e)
                  </Label>
                  <BodyLong>{pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse}</BodyLong>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* PVO sidepanel */}
        <div className="px-4 py-4 border-l border-[#071a3636] w-full max-w-md bg-[#F0EEF4] mt-35">
          <div>
            <RadioGroup
              legend="Vurdér om etterleverens bidrag er tilstrekkelig"
              // onChange={handleChange}
              description="Denne vurderingen blir ikke tilgjengelig for etterleveren før dere har ferdigstilt selve vurderingen."
            >
              <Radio value="JA">Ja, tilstrekkelig </Radio>
              <Radio value="Tilstrekkelig">
                Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som
                beskrives i fritekst under
              </Radio>
              <Radio value="40">Utilstrekkelig, beskrives nærmere under</Radio>
            </RadioGroup>
          </div>
          <div className="my-5">
            <Label>Skriv intern PVO diskusjon her</Label>
            <BodyLong>Denne teksten er privat for PVO og skal ikke deles med etterleveren</BodyLong>
          </div>
          <div>
            {mode === 'edit' && (
              <TextEditor
                initialValue={value}
                setValue={setValue}
                height="15.625rem"
                // setIsFormDirty={setIsFormDirty}
              />
            )}

            {mode === 'view' && (
              <div className="p-8 border-border-subtle-hover border border-solid rounded-md bg-white">
                <Markdown source={''} />
              </div>
            )}
          </div>
          <div className="flex justify-end mt-[-1px]">
            <ToggleGroup defaultValue="edit" onChange={setMode} size="small">
              <ToggleGroup.Item value="edit">Redigering</ToggleGroup.Item>
              <ToggleGroup.Item value="view">Forhåndsvisning</ToggleGroup.Item>
            </ToggleGroup>
          </div>
          <div className="my-5">
            <Label>Skriv tilbakemelding til etterleveren</Label>
            <BodyLong>
              Tilbakemeldingen blir ikke tilgjengelig for etterleveren før du velger å publisere
              den.{' '}
            </BodyLong>
          </div>
          <div>
            {mode === 'edit' && (
              <TextEditor
                initialValue={value}
                setValue={setValue}
                height="15.625rem"
                // setIsFormDirty={setIsFormDirty}
              />
            )}

            {mode === 'view' && (
              <div className="p-8 border-border-subtle-hover border border-solid rounded-md bg-white">
                <Markdown source={''} />
              </div>
            )}
          </div>
          <div className="flex justify-end mt-[-1px]">
            <ToggleGroup defaultValue="edit" onChange={setMode} size="small">
              <ToggleGroup.Item value="edit">Redigering</ToggleGroup.Item>
              <ToggleGroup.Item value="view">Forhåndsvisning</ToggleGroup.Item>
            </ToggleGroup>
          </div>
          <div className="mt-10 flex flex-row gap-2">
            <div>
              <Button
                size="small"
                onClick={() => {
                  setValue('')
                }}
              >
                Lagre
              </Button>
            </div>
            <div>
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setValue('')
                }}
              >
                Avbryt
              </Button>
            </div>
          </div>
        </div>
      </div>
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
      />
    </div>
  )
}
export default InvolveringAvEksternePvoView
