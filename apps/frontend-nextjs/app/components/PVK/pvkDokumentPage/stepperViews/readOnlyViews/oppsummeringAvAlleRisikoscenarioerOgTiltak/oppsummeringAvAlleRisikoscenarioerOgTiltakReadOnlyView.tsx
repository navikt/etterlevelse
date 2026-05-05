'use client'

import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import InfoChangesMadeAfterApproval from '@/components/PVK/common/infoChangesMadeAfterApproval'
import { PvkSidePanelWrapper } from '@/components/PVK/common/pvkSidePanelWrapper'
import FormButtons from '@/components/PVK/edit/formButtons'
import PvoTilbakemeldingsHistorikk from '@/components/pvoTilbakemelding/common/tilbakemeldingsHistorikk/pvoTilbakemeldingsHistorikk'
import PvoTilbakemeldingReadOnly from '@/components/pvoTilbakemelding/readOnly/pvoTilbakemeldingReadOnly'
import { TiltakAccordionListReadOnly } from '@/components/tiltak/common/tiltakAccordionListReadOnly'
import { IPageResponse } from '@/constants/commonConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import {
  pvkDokumentasjonTabFilterRisikoscenarioUrl,
  pvkDokumentasjonTabFilterTiltakUrl,
  pvkDokumentasjonTabFilterUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { BodyLong, Heading, Loader, ReadMore, Tabs, ToggleGroup } from '@navikt/ds-react'
import moment from 'moment'
import { useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, useEffect, useState } from 'react'
import OppsumeringAccordianListReadOnlyView from '../oppsumeringAccordianListReadOnlyView'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  pvoTilbakemelding?: IPvoTilbakemelding
  relevantVurdering?: IVurdering
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

export const OppsummeringAvAlleRisikoscenarioerOgTiltakReadOnlyView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  pvoTilbakemelding,
  relevantVurdering,
}) => {
  const router = useRouter()
  const queryParams = useSearchParams()
  const steg: string | null = queryParams.get('steg')
  const tabQuery: string | null = queryParams.get('tab')
  const risikoscenarioId: string | null = queryParams.get('risikoscenario')
  const tiltakId: string | null = queryParams.get('tiltak')
  const filterQuery: string | null = queryParams.get('filter')

  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])
  const [filteredRisikoscenarioList, setFilteredRisikosenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakFilter, setTiltakFilter] = useState<string>(tiltakFilterValues.alleTiltak)
  const [filteredTiltakList, setFilteredTiltakList] = useState<ITiltak[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [antallEffektIkkeVurdert, setAntallEffektIkkeVurdert] = useState<number>(0)
  const [antallHoyRisiko, setAntallHoyRisiko] = useState<number>(0)
  const [antallTiltakIkkeAktuelt, setAntallTiltakIkkeAktuelt] = useState<number>(0)
  const [antallUtenTiltakAnsvarlig, setAntallUtenTiltakAnsvarlig] = useState<number>(0)
  const [antallUtenFrist, setAntallUtenFrist] = useState<number>(0)
  const [antallUtgaatteFrister, setAntallUtgaatteFrister] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      if (
        filterQuery &&
        tabQuery &&
        tabQuery === tabValues.tiltak &&
        filterQuery in tiltakFilterValues
      ) {
        setTiltakFilter(filterQuery)
      }
    })()
  }, [tabQuery, filterQuery])

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
    ;(async () => {
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
    })()
  }, [risikoscenarioList])

  useEffect(() => {
    ;(async () => {
      if (tiltakList.length !== 0) {
        const now = new Date()
        setAntallUtenTiltakAnsvarlig(
          tiltakList.filter(
            (tiltak: ITiltak) =>
              !tiltak.ansvarlig || (!tiltak.ansvarlig.navIdent && !tiltak.ansvarligTeam.name)
          ).length
        )
        setAntallUtenFrist(
          tiltakList.filter((tiltak: ITiltak) => !tiltak.iverksatt && !tiltak.frist).length
        )
        setAntallUtgaatteFrister(
          tiltakList.filter(
            (tiltak: ITiltak) =>
              !tiltak.iverksatt && tiltak.frist && moment(now).isAfter(moment(tiltak.frist))
          ).length
        )
      }
    })()
  }, [tiltakList])

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

    router.push(pvkDokumentasjonTabFilterRisikoscenarioUrl(steg, tab, filter, risikoscenarioId), {
      scroll: false,
    })
  }

  useEffect(() => {
    ;(async () => {
      if (risikoscenarioList.length !== 0 && filterQuery) {
        onFilterChange(filterQuery)
      }
    })()
  }, [filterQuery, risikoscenarioList])

  const onTabChange = (tab: string): void => {
    const filter: string = filterQuery ? filterQuery : filterValues.alleRisikoscenarioer
    const paramQuery: string = tab === tabValues.risikoscenarioer ? filter : ''

    router.push(pvkDokumentasjonTabFilterUrl(steg, tab, paramQuery), { scroll: false })
  }

  const onTiltakFilterChange = (filter: string): void => {
    setTiltakFilter(filter)
    const tab: string = tabQuery ? tabQuery : tabValues.tiltak

    switch (filter) {
      case tiltakFilterValues.alleTiltak:
        setFilteredTiltakList(tiltakList)
        break
      case tiltakFilterValues.utenAnsvarlig:
        setFilteredTiltakList(
          tiltakList.filter(
            (tiltak: ITiltak) =>
              !tiltak.ansvarlig || (!tiltak.ansvarlig.navIdent && !tiltak.ansvarligTeam.name)
          )
        )
        break
      case tiltakFilterValues.utenFrist:
        setFilteredTiltakList(tiltakList.filter((tiltak: ITiltak) => !tiltak.frist))
        break
    }

    router.push(pvkDokumentasjonTabFilterTiltakUrl(steg, tab, filter, tiltakId), {
      scroll: false,
    })
  }

  const isPvoTilbakemeldingFerdig =
    pvoTilbakemelding && pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG

  return (
    <div className='w-full'>
      <div className={`flex w-full ${isPvoTilbakemeldingFerdig ? '' : 'justify-center'}`}>
        <div className={`pt-6 ${isPvoTilbakemeldingFerdig ? 'w-204' : 'min-w-225'}`}>
          <div>
            <Heading level='1' size='medium' className='mb-5'>
              Risikobildet etter tiltak
            </Heading>

            <div className='max-w-204 mt-5'>
              <InfoChangesMadeAfterApproval
                pvkDokument={pvkDokument}
                alleRisikoscenario={risikoscenarioList}
                alleTiltak={tiltakList}
              />
            </div>

            <BodyLong className='mt-5'>
              Her vurderer dere det samlede risikobildet pr. scenario etter at tiltak er
              gjennomført.
            </BodyLong>

            {(pvkDokument.antallInnsendingTilPvo ?? 0) >= 2 && (
              <ReadMore
                className='mt-5 max-w-[75ch]'
                header='Hva hvis noen av våre eldre risikoscenarioer ikke lenger er aktuelle?'
              >
                Vi jobber med å få på plass en slags “pensjonering” av risikoscenarioer som ikke
                lenger er aktuelle. Etter hvert som vi oppdaterer løsningen vil dere kunne markere
                enkelte risikoscenarioer som historiske. Slik skal dere, risikoeier og PVO enkelt
                kunne vite hvilke scenarioer dere skal forholde dere til. Imens får dere ikke slette
                risikoscenarioer som ble opprettet i tidligere versjoner, men som midlertidig grep
                kan dere velge om dere vil innlede scenarioets navn med f. eks. “HISTORISK:” og så
                scenarionavnet.
              </ReadMore>
            )}
          </div>
          <div className='w-full mt-5'>
            <div className='pt-6 pr-4 flex flex-1 flex-row gap-4 col-span-8'>
              {isLoading && (
                <div className='flex w-full justify-center'>
                  <Loader size='large' />
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
                        label={
                          <span className='flex items-center gap-1'>
                            {antallEffektIkkeVurdert > 0 && (
                              <span className='w-3 h-3 bg-red-400 rounded-full mr-1'></span>
                            )}
                            {`Vis risikoscenarioer (${risikoscenarioList.length})`}
                          </span>
                        }
                      />
                      <Tabs.Tab
                        value={tabValues.tiltak}
                        label={
                          <span className='flex items-center gap-1'>
                            {(antallUtenTiltakAnsvarlig > 0 ||
                              antallUtenFrist > 0 ||
                              antallUtgaatteFrister > 0) && (
                              <span className='w-3 h-3 bg-red-400 rounded-full mr-1'></span>
                            )}
                            {`Vis tiltak (${tiltakList.length})`}
                          </span>
                        }
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

                      {risikoscenarioList.length !== 0 &&
                        filteredRisikoscenarioList.length === 0 &&
                        visTomListeBeskrivelse(filterQuery)}

                      {risikoscenarioList.length !== 0 &&
                        filteredRisikoscenarioList.length !== 0 && (
                          <div className='my-5'>
                            {pvkDokument && (
                              <OppsumeringAccordianListReadOnlyView
                                risikoscenarioList={filteredRisikoscenarioList}
                                allRisikoscenarioList={risikoscenarioList}
                                etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                                tiltakList={tiltakList}
                                noMarkdownCopyLinkButton
                              />
                            )}
                          </div>
                        )}
                    </Tabs.Panel>
                    <Tabs.Panel value={tabValues.tiltak} className='w-full'>
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

                      {pvkDokument && filteredTiltakList.length !== 0 && (
                        <TiltakAccordionListReadOnly
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
          </div>
        </div>
        <div>
          {/* sidepanel */}
          {isPvoTilbakemeldingFerdig && relevantVurdering && (
            <PvkSidePanelWrapper>
              {[undefined, null, ''].includes(pvkDokument.godkjentAvRisikoeierDato) && (
                <PvoTilbakemeldingReadOnly
                  relevantVurdering={relevantVurdering}
                  tilbakemeldingsinnhold={relevantVurdering.risikoscenarioEtterTiltakk}
                  sentDate={relevantVurdering.sendtDato}
                />
              )}

              {pvkDokument.antallInnsendingTilPvo >= 1 && (
                <div className='mt-10'>
                  <PvoTilbakemeldingsHistorikk
                    pvkDokument={pvkDokument}
                    pvoTilbakemelding={pvoTilbakemelding}
                    fieldName='risikoscenarioEtterTiltakk'
                    relevantVurdering={relevantVurdering}
                    forPvo={false}
                  />
                </div>
              )}
            </PvkSidePanelWrapper>
          )}
        </div>
      </div>

      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
      />
    </div>
  )
}

export default OppsummeringAvAlleRisikoscenarioerOgTiltakReadOnlyView
