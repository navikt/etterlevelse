import {
  Alert,
  BodyLong,
  Button,
  Heading,
  Label,
  Link,
  Radio,
  RadioGroup,
  Tabs,
  ToggleGroup,
} from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../api/TiltakApi'
import { ERisikoscenarioType, IPvkDokument, IRisikoscenario, ITiltak } from '../../constants'
import { Markdown } from '../common/Markdown'
import { ExternalLink } from '../common/RouteLink'
import TextEditor from '../common/TextEditor/TextEditor'
import AccordianAlertModal from '../risikoscenario/AccordianAlertModal'
import TiltakAccordionList from '../tiltak/TiltakAccordionList'
import OppsumeringAccordianListPvoView from './OppsumeringAccordianListPvoView'

interface IProps {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  formRef: RefObject<any>
}

export const tabValues = { risikoscenarioer: 'risikoscenarioer', tiltak: 'tiltak' }
export const filterValues = {
  alleRisikoscenarioer: 'alle',
  effektIkkeVurdert: 'ikke-vurdert',
  hoyRisiko: 'hoy-risiko',
  tiltakIkkeAktuelt: 'ingen-tiltak',
}

export const tiltakFilterValues = {
  alleTiltak: 'alle',
  utenAnsvarlig: 'utenAnsvarlig',
  utenFrist: 'utenFrist',
}

const visTomListeBeskrivelse = (filter: string | null) => {
  let textBody = ''
  switch (filter) {
    case filterValues.hoyRisiko:
      textBody = 'Det finnes ingen risikoscenarioer med høy risiko 🎉'
      break
    case filterValues.tiltakIkkeAktuelt:
      textBody = 'Det finnes ingen risikoscenarioer uten tiltak 🎉'
      break
    case filterValues.effektIkkeVurdert:
      textBody = 'Det finnes ingen risikoscenarioer der effekt ikke er vurdert'
      break
    default:
  }
  return <BodyLong className="my-5">{textBody}</BodyLong>
}

export const OppsummeringAvAlleRisikoscenarioerOgTiltakPvoView = (props: IProps) => {
  const { etterlevelseDokumentasjonId, pvkDokument, formRef } = props
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])
  const [filteredRisikoscenarioList, setFilteredRisikosenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakFilter, setTiltakFilter] = useState<string>(tiltakFilterValues.alleTiltak)
  const [filteredTiltakList, setFilteredTiltakList] = useState<ITiltak[]>([])
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [navigateUrl, setNavigateUrl] = useState<string>('')
  const url = new URL(window.location.href)
  const tabQuery = url.searchParams.get('tab')
  const risikoscenarioId = url.searchParams.get('risikoscenario')
  const filterQuery = url.searchParams.get('filter')
  const navigate = useNavigate()
  const [mode, setMode] = useState('edit')
  const [value, setValue] = useState('')

  useEffect(() => {
    if (pvkDokument) {
      ;(async () => {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (risikoscenarioer) => {
            setRisikoscenarioList(risikoscenarioer.content)
            setFilteredRisikosenarioList(risikoscenarioer.content)
          }
        )

        await getTiltakByPvkDokumentId(pvkDokument.id).then((tiltak) => {
          setTiltakList(tiltak.content)
          setFilteredTiltakList(tiltak.content)
        })
      })()
    }
  }, [pvkDokument])

  useEffect(() => {
    if (risikoscenarioList.length !== 0 && filterQuery) {
      onFilterChange(filterQuery)
    }
  }, [filterQuery, risikoscenarioList])

  const onTabChange = (tab: string) => {
    const filter = filterQuery ? filterQuery : filterValues.alleRisikoscenarioer
    const paramQuery = tab === tabValues.risikoscenarioer ? '&filter=' + filter : ''
    setNavigateUrl(`${window.location.pathname}?tab=${tab}${paramQuery}`)

    if (formRef.current?.dirty) {
      setIsUnsaved(true)
    } else {
      navigate(`${window.location.pathname}?tab=${tab}${paramQuery}`)
    }
  }

  const onFilterChange = (filter: string) => {
    const tab = tabQuery ? tabQuery : tabValues.risikoscenarioer

    switch (filter) {
      case filterValues.alleRisikoscenarioer:
        setFilteredRisikosenarioList(risikoscenarioList)
        break
      case filterValues.tiltakIkkeAktuelt:
        setFilteredRisikosenarioList(
          risikoscenarioList.filter((risikoscenario) => risikoscenario.ingenTiltak)
        )
        break
      case filterValues.effektIkkeVurdert:
        setFilteredRisikosenarioList(
          risikoscenarioList.filter(
            (risikoscenario) =>
              !risikoscenario.ingenTiltak &&
              (risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
                risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
                risikoscenario.nivaaBegrunnelseEtterTiltak === '')
          )
        )
        break
      case filterValues.hoyRisiko:
        setFilteredRisikosenarioList(
          risikoscenarioList.filter(
            (risikoscenario) =>
              risikoscenario.konsekvensNivaa === 5 || risikoscenario.sannsynlighetsNivaa === 5
          )
        )
        break
      default:
        setFilteredRisikosenarioList(risikoscenarioList)
        break
    }

    setNavigateUrl(
      `${window.location.pathname}?tab=${tab}&filter=${filter}${risikoscenarioId ? '&risikoscenario=' + risikoscenarioId : ''}`
    )
    if (formRef.current?.dirty) {
      setIsUnsaved(true)
    } else {
      navigate(
        `${window.location.pathname}?tab=${tab}&filter=${filter}${risikoscenarioId ? '&risikoscenario=' + risikoscenarioId : ''}`
      )
    }
  }

  const onTiltakFilterChange = (filter: string) => {
    setTiltakFilter(filter)
    switch (filter) {
      case tiltakFilterValues.alleTiltak:
        setFilteredTiltakList(tiltakList)
        break
      case tiltakFilterValues.utenAnsvarlig:
        setFilteredTiltakList(tiltakList.filter((tiltak) => !tiltak.ansvarlig))
        break
      case tiltakFilterValues.utenFrist:
        setFilteredTiltakList(tiltakList.filter((tiltak) => !tiltak.frist))
        break
    }
  }

  return (
    <div className="flex justify-center w-full">
      <div className="flex-col min-w-[900px]">
        <div>
          <Heading level="1" size="medium" className="mb-5">
            Risikobildet etter tiltak
          </Heading>

          <BodyLong className="mt-5">
            Her vurderer dere det samlede risikobildet pr. scenario etter at tiltak er gjennomført.
          </BodyLong>
        </div>
        <div>
          <div className="w-full mt-5">
            <div className="pt-6 pr-4 flex flex-1 flex-row gap-4 col-span-8">
              <div>
                <Tabs
                  value={tabQuery ? tabQuery : tabValues.risikoscenarioer}
                  onChange={onTabChange}
                  fill
                >
                  <Tabs.List>
                    <Tabs.Tab value={tabValues.risikoscenarioer} label="Vis risikoscenarioer" />
                    <Tabs.Tab value={tabValues.tiltak} label=" Vis tiltak " />
                  </Tabs.List>
                  <Tabs.Panel value={tabValues.risikoscenarioer} className="w-full">
                    <ToggleGroup
                      className="mt-10"
                      value={filterQuery ? filterQuery : 'alle'}
                      onChange={onFilterChange}
                      fill
                    >
                      <ToggleGroup.Item
                        value={filterValues.alleRisikoscenarioer}
                        label="Alle risikoscenarioer"
                      />
                      <ToggleGroup.Item
                        value={filterValues.effektIkkeVurdert}
                        label="Effekt ikke vurdert"
                      />
                      <ToggleGroup.Item value={filterValues.hoyRisiko} label="Høy risiko" />
                      <ToggleGroup.Item
                        value={filterValues.tiltakIkkeAktuelt}
                        label="Tiltak ikke aktuelt"
                      />
                    </ToggleGroup>
                    {risikoscenarioList.length === 0 && (
                      <div className="my-5">
                        <Alert variant="info">
                          <Heading spacing size="small" level="3">
                            Dere har foreløpig ingen risikoscenarioer
                          </Heading>
                          Risikoscenarioer legges inn under{' '}
                          <Link href={`/dokumentasjon/${etterlevelseDokumentasjonId}`}>
                            PVK-relaterte krav
                          </Link>{' '}
                          (åpner i en ny fane) eller eventuelt under øvrige risikoscenarioer (åpner
                          i en ny fane).
                        </Alert>
                      </div>
                    )}

                    {risikoscenarioList.length !== 0 &&
                      filteredRisikoscenarioList.length === 0 &&
                      visTomListeBeskrivelse(filterQuery)}

                    {risikoscenarioList.length !== 0 && filteredRisikoscenarioList.length !== 0 && (
                      <div className="my-5">
                        <OppsumeringAccordianListPvoView
                          risikoscenarioList={filteredRisikoscenarioList}
                          allRisikoscenarioList={risikoscenarioList}
                          tiltakList={tiltakList}
                          formRef={formRef}
                          isUnsaved={isUnsaved}
                          setIsUnsaved={setIsUnsaved}
                        />
                      </div>
                    )}
                  </Tabs.Panel>
                  <Tabs.Panel value={tabValues.tiltak} className="w-full">
                    {tiltakList.length === 0 && (
                      <div className="my-5">
                        <Alert variant="info">
                          <Heading spacing size="small" level="3">
                            Foreløpig er ingen tiltak satt
                          </Heading>
                          Tiltak legges inn under{' '}
                          <ExternalLink
                            href={`/dokumentasjon/${etterlevelseDokumentasjonId}/pvkdokument/${pvkDokument.id}/4`}
                          >
                            Identifisering av risikoscenarioer og tiltak
                          </ExternalLink>
                          .
                        </Alert>
                      </div>
                    )}

                    {tiltakList.length !== 0 && (
                      <ToggleGroup
                        className="mt-10"
                        value={tiltakFilter}
                        onChange={onTiltakFilterChange}
                        fill
                      >
                        <ToggleGroup.Item
                          value={tiltakFilterValues.alleTiltak}
                          label="Alle tiltak"
                        />
                        <ToggleGroup.Item
                          value={tiltakFilterValues.utenAnsvarlig}
                          label="Uten tiltaksansvarlig"
                        />
                        <ToggleGroup.Item value={tiltakFilterValues.utenFrist} label="Uten frist" />
                      </ToggleGroup>
                    )}

                    {filteredTiltakList.length !== 0 && (
                      <TiltakAccordionList
                        tiltakList={filteredTiltakList}
                        risikoscenarioList={risikoscenarioList}
                      />
                    )}
                  </Tabs.Panel>
                </Tabs>
              </div>
              <div>
                {/* PVO sidepanel */}
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
                    <BodyLong>
                      Denne teksten er privat for PVO og skal ikke deles med etterleveren
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
                  <div className="my-5">
                    <Label>Skriv tilbakemelding til etterleveren</Label>
                    <BodyLong>
                      Tilbakemeldingen blir ikke tilgjengelig for etterleveren før du velger å
                      publisere den.{' '}
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
            </div>

            <AccordianAlertModal
              isOpen={isUnsaved}
              setIsOpen={setIsUnsaved}
              navigateUrl={navigateUrl}
              formRef={formRef}
              reloadOnSubmit={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OppsummeringAvAlleRisikoscenarioerOgTiltakPvoView
