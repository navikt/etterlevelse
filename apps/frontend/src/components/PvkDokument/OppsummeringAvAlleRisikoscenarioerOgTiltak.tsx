import { Alert, BodyLong, Heading, Link, Loader, Tabs, ToggleGroup } from '@navikt/ds-react'
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
import PvoSidePanelWrapper from '../PvoTilbakemelding/common/PvoSidePanelWrapper'
import PvoTilbakemeldingReadOnly from '../PvoTilbakemelding/common/PvoTilbakemeldingReadOnly'
import { ExternalLink } from '../common/RouteLink'
import AccordianAlertModal from '../risikoscenario/AccordianAlertModal'
import OppsumeringAccordianList from '../risikoscenario/OppsummeringAccordian/OppsumeringAccordianList'
import TiltakAccordionList from '../tiltak/TiltakAccordionList'
import FormButtons from './edit/FormButtons'

interface IProps {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvoTilbakemelding?: IPvoTilbakemelding
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
      textBody = 'Det finnes ingen risikoscenario hvor tiltak ikke er aktuelt  🎉'
      break
    case filterValues.effektIkkeVurdert:
      textBody = 'Det finnes ingen risikoscenarioer der effekt ikke er vurdert 🎉'
      break
    default:
  }
  return <BodyLong className='my-5'>{textBody}</BodyLong>
}

const visTomTiltakListeBeskrivelse = (filter: string | null) => {
  let textBody = ''
  switch (filter) {
    case tiltakFilterValues.utenAnsvarlig:
      textBody = 'Det finnes tiltak uten en ansvarlig 🎉'
      break
    case tiltakFilterValues.utenFrist:
      textBody = 'Det finnes ingen tiltak uten frist 🎉'
      break
    default:
  }
  return <BodyLong className='my-5'>{textBody}</BodyLong>
}

export const OppsummeringAvAlleRisikoscenarioerOgTiltak = (props: IProps) => {
  const {
    etterlevelseDokumentasjonId,
    pvkDokument,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
    pvoTilbakemelding,
  } = props
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])
  const [filteredRisikoscenarioList, setFilteredRisikosenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakFilter, setTiltakFilter] = useState<string>(tiltakFilterValues.alleTiltak)
  const [filteredTiltakList, setFilteredTiltakList] = useState<ITiltak[]>([])
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [navigateUrl, setNavigateUrl] = useState<string>('')
  const [antallEffektIkkeVurdert, setAntallEffektIkkeVurdert] = useState<number>(0)
  const [antallHoyRisiko, setAntallHoyRisiko] = useState<number>(0)
  const [antallTiltakIkkeAktuelt, setAntallTiltakIkkeAktuelt] = useState<number>(0)

  const url = new URL(window.location.href)
  const tabQuery = url.searchParams.get('tab')
  const risikoscenarioId = url.searchParams.get('risikoscenario')
  const filterQuery = url.searchParams.get('filter')
  const navigate = useNavigate()

  useEffect(() => {
    if (pvkDokument) {
      ;(async () => {
        setIsLoading(true)
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (risikoscenarioer) => {
            setRisikoscenarioList(risikoscenarioer.content)
            setFilteredRisikosenarioList(risikoscenarioer.content)

            setAntallHoyRisiko(
              risikoscenarioer.content.filter((risikoscenario) => risikoscenario.ingenTiltak).length
            )

            setAntallEffektIkkeVurdert(
              risikoscenarioer.content.filter(
                (risikoscenario) =>
                  !risikoscenario.ingenTiltak &&
                  (risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
                    risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
                    risikoscenario.nivaaBegrunnelseEtterTiltak === '')
              ).length
            )

            setAntallTiltakIkkeAktuelt(
              risikoscenarioer.content.filter(
                (risikoscenario) =>
                  risikoscenario.konsekvensNivaa === 5 || risikoscenario.sannsynlighetsNivaa === 5
              ).length
            )
          }
        )

        await getTiltakByPvkDokumentId(pvkDokument.id).then((tiltak) => {
          setTiltakList(tiltak.content)
          setFilteredTiltakList(tiltak.content)
        })

        setIsLoading(false)
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
    <div className='w-full'>
      <div className={`flex w-full ${pvoTilbakemelding ? '' : 'justify-center'}`}>
        <div className={`pt-6 ${pvoTilbakemelding ? 'w-[816px]' : 'min-w-[900px]'}`}>
          <div>
            <Heading level='1' size='medium' className='mb-5'>
              Risikobildet etter tiltak
            </Heading>

            <BodyLong className='mt-5'>
              Her vurderer dere det samlede risikobildet pr. scenario etter at tiltak er
              gjennomført.
            </BodyLong>
          </div>
          <div className='w-full mt-5'>
            <div className='pt-6 pr-4 flex flex-1 flex-row gap-4 col-span-8'>
              {isLoading && (
                <div className='flex w-full justify-center'>
                  <Loader size={'large'} />
                </div>
              )}
              {!isLoading && (
                <div className='w-full'>
                  <Tabs
                    value={tabQuery ? tabQuery : tabValues.risikoscenarioer}
                    onChange={onTabChange}
                    fill
                  >
                    <Tabs.List>
                      <Tabs.Tab
                        value={tabValues.risikoscenarioer}
                        label={`Vis risikoscenarioer (${risikoscenarioList.length})`}
                      />
                      <Tabs.Tab
                        value={tabValues.tiltak}
                        label={`Vis tiltak (${tiltakList.length})`}
                      />
                    </Tabs.List>
                    <Tabs.Panel value={tabValues.risikoscenarioer} className='w-full'>
                      <ToggleGroup
                        className='mt-10'
                        value={filterQuery ? filterQuery : 'alle'}
                        onChange={onFilterChange}
                        fill
                      >
                        <ToggleGroup.Item
                          value={filterValues.alleRisikoscenarioer}
                          label={`Alle risikoscenarioer (${risikoscenarioList.length})`}
                        />
                        <ToggleGroup.Item
                          value={filterValues.effektIkkeVurdert}
                          label={`Effekt ikke vurdert (${antallEffektIkkeVurdert})`}
                        />
                        <ToggleGroup.Item
                          value={filterValues.hoyRisiko}
                          label={`Høy risiko (${antallHoyRisiko})`}
                        />
                        <ToggleGroup.Item
                          value={filterValues.tiltakIkkeAktuelt}
                          label={`Tiltak ikke aktuelt (${antallTiltakIkkeAktuelt})`}
                        />
                      </ToggleGroup>
                      {risikoscenarioList.length === 0 && (
                        <div className='my-5'>
                          <Alert variant='info'>
                            <Heading spacing size='small' level='3'>
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
                          <div className='my-5'>
                            <OppsumeringAccordianList
                              risikoscenarioList={filteredRisikoscenarioList}
                              setRisikosenarioList={setFilteredRisikosenarioList}
                              allRisikoscenarioList={risikoscenarioList}
                              setAllRisikoscenarioList={setRisikoscenarioList}
                              etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                              tiltakList={tiltakList}
                              formRef={formRef}
                              isUnsaved={isUnsaved}
                              setIsUnsaved={setIsUnsaved}
                            />
                          </div>
                        )}
                    </Tabs.Panel>
                    <Tabs.Panel value={tabValues.tiltak} className='w-full'>
                      {tiltakList.length === 0 && (
                        <div className='my-5'>
                          <Alert variant='info'>
                            <Heading spacing size='small' level='3'>
                              Foreløpig er ingen tiltak satt
                            </Heading>
                            Tiltak legges inn under{' '}
                            <ExternalLink
                              href={'/dokumentasjon/' + etterlevelseDokumentasjonId + '?tab=pvk'}
                            >
                              PVK-relaterte krav{' '}
                            </ExternalLink>{' '}
                            eller eventuelt under{' '}
                            <ExternalLink
                              href={`/dokumentasjon/${etterlevelseDokumentasjonId}/pvkdokument/${pvkDokument.id}/5`}
                            >
                              øvrige risikoscenarioer
                            </ExternalLink>
                            .
                          </Alert>
                        </div>
                      )}

                      {tiltakList.length !== 0 && (
                        <ToggleGroup
                          className='mt-10'
                          value={tiltakFilter}
                          onChange={onTiltakFilterChange}
                          fill
                        >
                          <ToggleGroup.Item
                            value={tiltakFilterValues.alleTiltak}
                            label='Alle tiltak'
                          />
                          <ToggleGroup.Item
                            value={tiltakFilterValues.utenAnsvarlig}
                            label='Uten tiltaksansvarlig'
                          />
                          <ToggleGroup.Item
                            value={tiltakFilterValues.utenFrist}
                            label='Uten frist'
                          />
                        </ToggleGroup>
                      )}

                      {filteredTiltakList.length !== 0 && (
                        <TiltakAccordionList
                          tiltakList={filteredTiltakList}
                          risikoscenarioList={risikoscenarioList}
                        />
                      )}
                      {filteredTiltakList.length === 0 &&
                        visTomTiltakListeBeskrivelse(tiltakFilter)}
                    </Tabs.Panel>
                  </Tabs>
                </div>
              )}
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
        <div>
          {/* sidepanel */}

          {pvoTilbakemelding && (
            <PvoSidePanelWrapper>
              <PvoTilbakemeldingReadOnly
                tilbakemeldingsinnhold={pvoTilbakemelding.risikoscenarioEtterTiltakk}
                sentDate={pvoTilbakemelding.sendtDato}
              />
            </PvoSidePanelWrapper>
          )}
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

export default OppsummeringAvAlleRisikoscenarioerOgTiltak
