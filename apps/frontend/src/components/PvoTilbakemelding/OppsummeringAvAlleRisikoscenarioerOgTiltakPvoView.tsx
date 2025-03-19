import { Alert, BodyLong, Heading, Link, Tabs, ToggleGroup } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../api/TiltakApi'
import {
  ERisikoscenarioType,
  IPvkDokument,
  IPvoTilbakemelding,
  IRisikoscenario,
  ITiltak,
} from '../../constants'
import { ExternalLink } from '../common/RouteLink'
import AccordianAlertModal from '../risikoscenario/AccordianAlertModal'
import TiltakAccordionList from '../tiltak/TiltakAccordionList'
import OppsumeringAccordianListPvoView from './OppsumeringAccordianListPvoView'
import PvoSidePanelWrapper from './common/PvoSidePanelWrapper'
import PvoFormButtons from './edit/PvoFormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

interface IProps {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
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
  const {
    etterlevelseDokumentasjonId,
    pvkDokument,
    pvoTilbakemelding,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
  } = props
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
    <div className="w-full">
      <div className="flex justify-center w-full">
        <div className="pt-6 flex-col min-w-[900px]">
          <div>
            <Heading level="1" size="medium" className="mb-5">
              Risikobildet etter tiltak
            </Heading>

            <BodyLong className="mt-5">
              Her vurderer dere det samlede risikobildet pr. scenario etter at tiltak er
              gjennomført.
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
                            (åpner i en ny fane) eller eventuelt under øvrige risikoscenarioer
                            (åpner i en ny fane).
                          </Alert>
                        </div>
                      )}

                      {risikoscenarioList.length !== 0 &&
                        filteredRisikoscenarioList.length === 0 &&
                        visTomListeBeskrivelse(filterQuery)}

                      {risikoscenarioList.length !== 0 &&
                        filteredRisikoscenarioList.length !== 0 && (
                          <div className="my-5">
                            <OppsumeringAccordianListPvoView
                              risikoscenarioList={filteredRisikoscenarioList}
                              allRisikoscenarioList={risikoscenarioList}
                              etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                              tiltakList={tiltakList}
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
                          <ToggleGroup.Item
                            value={tiltakFilterValues.utenFrist}
                            label="Uten frist"
                          />
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

        <div>
          {/* PVO sidepanel */}
          <PvoSidePanelWrapper>
            <PvoTilbakemeldingForm
              pvkDokumentId={pvkDokument.id}
              fieldName="risikoscenarioEtterTiltakk"
              initialValue={pvoTilbakemelding.risikoscenarioEtterTiltakk}
              formRef={formRef}
            />
          </PvoSidePanelWrapper>
        </div>
      </div>
      <PvoFormButtons
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
      />
    </div>
  )
}

export default OppsummeringAvAlleRisikoscenarioerOgTiltakPvoView
