import {
  Alert,
  BodyLong,
  Button,
  Heading,
  Label,
  Radio,
  RadioGroup,
  ToggleGroup,
} from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../api/TiltakApi'
import { ERisikoscenarioType, IPvkDokument, IRisikoscenario, ITiltak } from '../../constants'
import { user } from '../../services/User'
import { Markdown } from '../common/Markdown'
import TextEditor from '../common/TextEditor/TextEditor'
import RisikoscenarioAccordianList from '../risikoscenario/RisikoscenarioAccordianList'
import CreateRisikoscenarioModal from '../risikoscenario/edit/CreateRisikoscenarioModal'
import FormButtons from './edit/FormButtons'

interface IProps {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const IdentifiseringAvRisikoscenarioerOgTiltak = (props: IProps) => {
  const {
    etterlevelseDokumentasjonId,
    pvkDokument,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
  } = props
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [allRisikoscenarioList, setAllRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])
  const [isTiltakFormActive, setIsTiltakFormActive] = useState<boolean>(false)
  const navigate = useNavigate()
  const [mode, setMode] = useState('edit')
  const [value, setValue] = useState('')

  useEffect(() => {
    if (pvkDokument) {
      ;(async () => {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (risikoscenarioer) => {
            setAllRisikoscenarioList(risikoscenarioer.content)
            setRisikoscenarioList(
              risikoscenarioer.content.filter((risikoscenario) => risikoscenario.generelScenario)
            )
          }
        )
        await getTiltakByPvkDokumentId(pvkDokument.id).then((response) => {
          setTiltakList(response.content)
        })
      })()
    }
  }, [pvkDokument])

  return (
    <div className="flex justify-center w-full">
      {(!user.isPersonvernombud() || user.isAdmin()) && (
        <div className="flex-col justify-items-center">
          <div className="w-4/5">
            <Heading level="1" size="medium" className="my-5">
              Identifisering av risikoscenarioer og tiltak
            </Heading>

            <BodyLong>
              I en PVK må dere vurdere sannsynligheten for at personvern ikke ivaretas på
              tilstrekkelig vis, og konsekvensene det vil føre til. Hvor dette risikoscenariet er av
              betydning, må dere identifisere forebyggende tiltak som reduserer risiko.
            </BodyLong>

            <Alert variant="info" inline className="mt-5">
              <strong>Godt å vite:</strong> risikoscenarioer og tiltak som dere har dokumentert et
              sted, kan dere finne og gjenbruke andre steder hvor det er aktuelt.
            </Alert>

            <Heading spacing size="small" level="2" className="mb-5 mt-10">
              Legg til risikoscenarioer og tiltak med en tilknytning til etterlevelseskrav
            </Heading>

            <BodyLong className="mb-5">
              Disse vil nok utgjøre hovedparten av deres PVK. Slike risikoscenarioer, samt
              motvirkende tiltak, beskriver dere på den aktuelle kravsiden.
            </BodyLong>

            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                if (etterlevelseDokumentasjonId)
                  navigate('/dokumentasjon/' + etterlevelseDokumentasjonId + '?tab=pvk')
              }}
            >
              Gå til liste over PVK-relaterte krav
            </Button>

            <Heading level="2" size="small" className="mb-5 mt-10">
              Legg til øvrige risikoscenarioer
            </Heading>

            <BodyLong>
              Noen risikoscenarioer vil ikke har en direkte tilknytning til etterlevelseskrav.
              Disse, samt motvirkende tiltak, legger dere inn på denne siden. Vi anbefaler at dette
              gjøres etter at dere har vurderert kravspesifikke risikoscenarioer.
            </BodyLong>

            {risikoscenarioList.length === 0 && (
              <Alert variant="info" className="my-5 w-fit">
                Dere har ikke lagt inn noen øvrige risikoscenarioer.
              </Alert>
            )}
          </div>
          <div className="w-full">
            {risikoscenarioList.length !== 0 && (
              <div className="my-5">
                <RisikoscenarioAccordianList
                  risikoscenarioList={risikoscenarioList}
                  allRisikoscenarioList={allRisikoscenarioList}
                  tiltakList={tiltakList}
                  setTiltakList={setTiltakList}
                  setRisikoscenarioList={setRisikoscenarioList}
                  setIsTiltakFormActive={setIsTiltakFormActive}
                  formRef={formRef}
                />
              </div>
            )}

            {!isTiltakFormActive && (
              <CreateRisikoscenarioModal
                pvkDokument={pvkDokument}
                onSubmitStateUpdate={(risikoscenario: IRisikoscenario) => {
                  setRisikoscenarioList([...risikoscenarioList, risikoscenario])
                }}
              />
            )}
          </div>

          <FormButtons
            etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setSelectedStep={setSelectedStep}
          />
        </div>
      )}

      {(user.isPersonvernombud() || user.isAdmin()) && (
        <div className="flex-col justify-items-center">
          <div className="w-4/5">
            <Heading level="1" size="medium" className="my-5">
              Identifisering av risikoscenarioer og tiltak
            </Heading>

            {risikoscenarioList.length === 0 && (
              <Alert variant="info" className="my-5 w-fit">
                Dere har ikke lagt inn noen øvrige risikoscenarioer.
              </Alert>
            )}
          </div>
          <div className="w-full">
            {risikoscenarioList.length !== 0 && (
              <div className="my-5">
                <RisikoscenarioAccordianList
                  risikoscenarioList={risikoscenarioList}
                  allRisikoscenarioList={allRisikoscenarioList}
                  tiltakList={tiltakList}
                  setTiltakList={setTiltakList}
                  setRisikoscenarioList={setRisikoscenarioList}
                  setIsTiltakFormActive={setIsTiltakFormActive}
                  formRef={formRef}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* PVO sidepanel */}
      {(user.isPersonvernombud() || user.isAdmin()) && (
        <div className="ml-4 px-4 py-4 border-l border-[#071a3636] w-full max-w-md bg-[#F0EEF4] mt-35">
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
      )}
    </div>
  )
}

export default IdentifiseringAvRisikoscenarioerOgTiltak
