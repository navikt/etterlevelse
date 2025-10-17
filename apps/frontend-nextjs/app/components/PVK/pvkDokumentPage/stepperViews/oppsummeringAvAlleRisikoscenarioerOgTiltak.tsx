'use client'

import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import PvoTilbakemeldingReadOnly from '@/components/pvoTilbakemelding/common/pvoTilbakemeldingReadOnly'
import RisikoscenarioAccordianAlertModal from '@/components/risikoscenario/common/risikoscenarioAccordianAlertModal'
import { IPageResponse } from '@/constants/commonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import {
  etterlevelseDokumentasjonPvkTabUrl,
  pvkDokumentasjonStepUrl,
  pvkDokumentasjonTabFilterRisikoscenarioUrl,
  pvkDokumentasjonTabFilterUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Alert, BodyLong, Heading, Loader, Tabs, ToggleGroup } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import InfoChangesMadeAfterApproval from '../../common/infoChangesMadeAfterApproval'
import { PvkSidePanelWrapper } from '../../common/pvkSidePanelWrapper'
import FormButtons from '../../edit/formButtons'

type TProps = {
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

export const OppsummeringAvAlleRisikoscenarioerOgTiltak: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjonId,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvoTilbakemelding,
}) => {
  const router = useRouter()
  const queryParams = useSearchParams()
  const steg: string | null = queryParams.get('steg')
  const tabQuery: string | null = queryParams.get('tab')
  const risikoscenarioId: string | null = queryParams.get('risikoscenario')
  const filterQuery: string | null = queryParams.get('filter')

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
  const [antallUtenTiltakAnsvarlig, setAntallUtenTiltakAnsvarlig] = useState<number>(0)
  const [antallUtenFrist, setAntallUtenFrist] = useState<number>(0)

  useEffect(() => {
    if (pvkDokument) {
      ;(async () => {
        setIsLoading(true)
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (risikoscenarioer: IPageResponse<IRisikoscenario>) => {
            setRisikoscenarioList(risikoscenarioer.content)
            setFilteredRisikosenarioList(risikoscenarioer.content)
          }
        )

        await getTiltakByPvkDokumentId(pvkDokument.id).then((tiltak: IPageResponse<ITiltak>) => {
          setTiltakList(tiltak.content)
          setFilteredTiltakList(tiltak.content)
        })

        setIsLoading(false)
      })()
    }
  }, [pvkDokument])

  useEffect(() => {
    if (risikoscenarioList.length !== 0) {
      setAntallTiltakIkkeAktuelt(
        risikoscenarioList.filter((risikoscenario: IRisikoscenario) => risikoscenario.ingenTiltak)
          .length
      )

      setAntallEffektIkkeVurdert(
        risikoscenarioList.filter(
          (risikoscenario: IRisikoscenario) =>
            !risikoscenario.ingenTiltak &&
            (risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
              risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
              risikoscenario.nivaaBegrunnelseEtterTiltak === '')
        ).length
      )

      setAntallHoyRisiko(
        risikoscenarioList.filter(
          (risikoscenario: IRisikoscenario) =>
            risikoscenario.konsekvensNivaa === 5 || risikoscenario.sannsynlighetsNivaa === 5
        ).length
      )
    }
  }, [risikoscenarioList])

  useEffect(() => {
    if (tiltakList.length !== 0) {
      setAntallUtenTiltakAnsvarlig(
        tiltakList.filter(
          (tiltak: ITiltak) =>
            !tiltak.ansvarlig || (tiltak.ansvarlig && tiltak.ansvarlig.navIdent === '')
        ).length
      )
      setAntallUtenFrist(tiltakList.filter((tiltak: ITiltak) => !tiltak.frist).length)
    }
  }, [tiltakList])

  useEffect(() => {
    if (risikoscenarioList.length !== 0 && filterQuery) {
      onFilterChange(filterQuery)
    }
  }, [filterQuery, risikoscenarioList])

  const onTabChange = (tab: string): void => {
    const filter: string = filterQuery ? filterQuery : filterValues.alleRisikoscenarioer
    const paramQuery: string = tab === tabValues.risikoscenarioer ? '&filter=' + filter : ''
    setNavigateUrl(pvkDokumentasjonTabFilterUrl(steg, tab, paramQuery))

    if (formRef.current?.dirty) {
      setIsUnsaved(true)
    } else {
      router.push(pvkDokumentasjonTabFilterUrl(steg, tab, paramQuery), { scroll: false })
    }
  }

  const onFilterChange = (filter: string): void => {
    const tab: string = tabQuery ? tabQuery : tabValues.risikoscenarioer

    switch (filter) {
      case filterValues.alleRisikoscenarioer:
        setFilteredRisikosenarioList(risikoscenarioList)
        break
      case filterValues.tiltakIkkeAktuelt:
        setFilteredRisikosenarioList(
          risikoscenarioList.filter((risikoscenario: IRisikoscenario) => risikoscenario.ingenTiltak)
        )
        break
      case filterValues.effektIkkeVurdert:
        setFilteredRisikosenarioList(
          risikoscenarioList.filter(
            (risikoscenario: IRisikoscenario) =>
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
            (risikoscenario: IRisikoscenario) =>
              risikoscenario.konsekvensNivaa === 5 || risikoscenario.sannsynlighetsNivaa === 5
          )
        )
        break
      default:
        setFilteredRisikosenarioList(risikoscenarioList)
        break
    }

    setNavigateUrl(pvkDokumentasjonTabFilterRisikoscenarioUrl(steg, tab, filter, risikoscenarioId))
    if (formRef.current?.dirty) {
      setIsUnsaved(true)
    } else {
      router.push(pvkDokumentasjonTabFilterRisikoscenarioUrl(steg, tab, filter, risikoscenarioId), {
        scroll: false,
      })
    }
  }

  const onTiltakFilterChange = (filter: string): void => {
    setTiltakFilter(filter)
    switch (filter) {
      case tiltakFilterValues.alleTiltak:
        setFilteredTiltakList(tiltakList)
        break
      case tiltakFilterValues.utenAnsvarlig:
        setFilteredTiltakList(
          tiltakList.filter(
            (tiltak: ITiltak) =>
              !tiltak.ansvarlig || (tiltak.ansvarlig && tiltak.ansvarlig.navIdent === '')
          )
        )
        break
      case tiltakFilterValues.utenFrist:
        setFilteredTiltakList(tiltakList.filter((tiltak: ITiltak) => !tiltak.frist))
        break
    }
  }

  const isPvoTilbakemeldingFerdig =
    pvoTilbakemelding && pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG

  return (
    <div className='w-full'>
      <div className={`flex w-full ${isPvoTilbakemeldingFerdig ? '' : 'justify-center'}`}>
        <div className={`pt-6 ${isPvoTilbakemeldingFerdig ? 'w-[816px]' : 'min-w-[900px]'}`}>
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
                            <ExternalLink
                              href={`${etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjonId)}?tab=pvk`}
                            >
                              PVK-relaterte krav
                            </ExternalLink>{' '}
                            eller eventuelt under{' '}
                            <ExternalLink
                              href={pvkDokumentasjonStepUrl(
                                etterlevelseDokumentasjonId,
                                pvkDokument.id,
                                6
                              )}
                            >
                              øvrige risikoscenarioer
                            </ExternalLink>
                          </Alert>
                        </div>
                      )}

                      {risikoscenarioList.length !== 0 &&
                        filteredRisikoscenarioList.length === 0 &&
                        visTomListeBeskrivelse(filterQuery)}

                      {risikoscenarioList.length !== 0 &&
                        filteredRisikoscenarioList.length !== 0 && (
                          <div className='my-5'>
                            test
                            {/* {pvkDokument && !isReadOnlyPvkStatus(pvkDokument.status) && (
                              <OppsumeringAccordianList
                                risikoscenarioList={filteredRisikoscenarioList}
                                setRisikosenarioList={setFilteredRisikosenarioList}
                                allRisikoscenarioList={risikoscenarioList}
                                setAllRisikoscenarioList={setRisikoscenarioList}
                                etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                                tiltakList={tiltakList}
                                setTiltakList={setTiltakList}
                                formRef={formRef}
                                isUnsaved={isUnsaved}
                                setIsUnsaved={setIsUnsaved}
                              />
                            )} */}
                            {/* {pvkDokument && isReadOnlyPvkStatus(pvkDokument.status) && (
                              <OppsumeringAccordianListReadOnlyView
                                risikoscenarioList={filteredRisikoscenarioList}
                                allRisikoscenarioList={risikoscenarioList}
                                etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                                tiltakList={tiltakList}
                                noMarkdownCopyLinkButton
                              />
                            )} */}
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
                              href={etterlevelseDokumentasjonPvkTabUrl(etterlevelseDokumentasjonId)}
                            >
                              PVK-relaterte krav{' '}
                            </ExternalLink>{' '}
                            eller eventuelt under{' '}
                            <ExternalLink
                              href={pvkDokumentasjonStepUrl(
                                etterlevelseDokumentasjonId,
                                pvkDokument.id,
                                6
                              )}
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
                            label={`Alle tiltak (${tiltakList.length})`}
                          />
                          <ToggleGroup.Item
                            value={tiltakFilterValues.utenAnsvarlig}
                            label={`Uten tiltaksansvarlig (${antallUtenTiltakAnsvarlig})`}
                          />
                          <ToggleGroup.Item
                            value={tiltakFilterValues.utenFrist}
                            label={`Uten frist (${antallUtenFrist})`}
                          />
                        </ToggleGroup>
                      )}

                      {/* {pvkDokument &&
                        !isReadOnlyPvkStatus(pvkDokument.status) &&
                        filteredTiltakList.length !== 0 && (
                          <TiltakAccordionList
                            tiltakList={filteredTiltakList}
                            risikoscenarioList={risikoscenarioList}
                            setTiltakList={setTiltakList}
                          />
                        )}

                      {pvkDokument &&
                        isReadOnlyPvkStatus(pvkDokument.status) &&
                        filteredTiltakList.length !== 0 && (
                          <TiltakAccordionListReadOnly
                            tiltakList={filteredTiltakList}
                            risikoscenarioList={risikoscenarioList}
                          />
                        )} */}

                      {filteredTiltakList.length === 0 &&
                        visTomTiltakListeBeskrivelse(tiltakFilter)}
                    </Tabs.Panel>
                  </Tabs>
                </div>
              )}
            </div>

            <RisikoscenarioAccordianAlertModal
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
          {isPvoTilbakemeldingFerdig && (
            <PvkSidePanelWrapper>
              <PvoTilbakemeldingReadOnly
                tilbakemeldingsinnhold={pvoTilbakemelding.risikoscenarioEtterTiltakk}
                sentDate={pvoTilbakemelding.sendtDato}
              />
            </PvkSidePanelWrapper>
          )}
        </div>
      </div>

      <InfoChangesMadeAfterApproval
        pvkDokument={pvkDokument}
        alleRisikoscenario={risikoscenarioList}
        alleTiltak={tiltakList}
      />

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
