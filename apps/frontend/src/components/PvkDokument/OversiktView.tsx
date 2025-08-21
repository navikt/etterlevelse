import { Alert, BodyShort, FormSummary, Heading, Link, List, ReadMore, Tag } from '@navikt/ds-react'
import { FunctionComponent, JSX, useEffect, useState } from 'react'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '../../api/BehandlingensLivslopApi'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../api/TiltakApi'
import {
  EEtterlevelseStatus,
  ERisikoscenarioType,
  IBehandlingensLivslop,
  IPageResponse,
  IPvkDokument,
  IRisikoscenario,
  ITeam,
  ITeamResource,
  ITiltak,
  TEtterlevelseDokumentasjonQL,
  TEtterlevelseQL,
  TKravQL,
} from '../../constants'
import { StepTitle } from '../../pages/PvkDokumentPage'
import { etterlevelsesDokumentasjonEditUrl } from '../common/RouteLinkEtterlevelsesdokumentasjon'
import { risikoscenarioFilterAlleUrl } from '../common/RouteLinkRisiko'
import { isRisikoUnderarbeidCheck, risikoscenarioFieldCheck } from '../risikoscenario/common/util'
import FormSummaryPanel from './common/FormSummaryPanel'
import FormButtons from './edit/FormButtons'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setSelectedStep: (step: number) => void
  updateTitleUrlAndStep: (step: number) => void
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
}

export const getFormStatus = (pvkDokument: IPvkDokument, step: number): JSX.Element | undefined => {
  if (step === 0) {
    if (
      pvkDokument.stemmerPersonkategorier !== null ||
      pvkDokument.personkategoriAntallBeskrivelse ||
      pvkDokument.tilgangsBeskrivelsePersonopplysningene ||
      pvkDokument.lagringsBeskrivelsePersonopplysningene
    ) {
      let answered = 0

      if (pvkDokument.stemmerPersonkategorier !== null) answered += 1
      if (pvkDokument.personkategoriAntallBeskrivelse) answered += 1
      if (pvkDokument.tilgangsBeskrivelsePersonopplysningene) answered += 1
      if (pvkDokument.lagringsBeskrivelsePersonopplysningene) answered += 1

      return (
        <Tag variant={answered < 4 ? 'warning' : 'success'} size='xsmall'>
          {answered} av 4 felt har innhold
        </Tag>
      )
    } else {
      return (
        <Tag variant='neutral' size='xsmall'>
          Ikke påbegynt
        </Tag>
      )
    }
  } else if (step === 2) {
    if (
      pvkDokument.harInvolvertRepresentant !== null ||
      pvkDokument.representantInvolveringsBeskrivelse ||
      pvkDokument.harDatabehandlerRepresentantInvolvering !== null ||
      pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse
    ) {
      let answered = 0

      if (pvkDokument.harInvolvertRepresentant !== null) answered += 1
      if (pvkDokument.representantInvolveringsBeskrivelse) answered += 1
      if (pvkDokument.harDatabehandlerRepresentantInvolvering !== null) answered += 1
      if (pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse) answered += 1

      return (
        <Tag variant={answered < 4 ? 'warning' : 'success'} size='xsmall'>
          {answered} av 4 felt har innhold
        </Tag>
      )
    } else {
      return (
        <Tag variant='neutral' size='xsmall'>
          Ikke påbegynt
        </Tag>
      )
    }
  } else {
    return undefined
  }
}

export const getTilhorendeDokumentasjonStatusTags = (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL,
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
) => {
  const antallBehandlinger = etterlevelseDokumentasjon.behandlinger?.length || 0
  const totalPvkKrav = pvkKrav?.krav.totalElements || 0
  const antallRisikovuderinger = etterlevelseDokumentasjon.risikovurderinger?.length || 0

  const pvkEtterlevelser: TEtterlevelseQL[] = []

  pvkKrav?.krav.content.forEach((krav) => {
    pvkEtterlevelser.push(...krav.etterlevelser)
  })

  const antallFerdigPvkKrav = pvkEtterlevelser.filter(
    (etterlevelse) => etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT
  ).length

  return (
    <div className='gap-2 flex pt-1'>
      <Tag variant={antallBehandlinger > 0 ? 'success' : 'neutral'} size='xsmall'>
        {antallBehandlinger} behandling{antallBehandlinger !== 1 ? 'er' : ''}
      </Tag>

      <Tag
        variant={
          antallFerdigPvkKrav === totalPvkKrav
            ? 'success'
            : antallFerdigPvkKrav === 0
              ? 'neutral'
              : 'warning'
        }
        size='xsmall'
      >
        {antallFerdigPvkKrav} av {totalPvkKrav} krav ferdigstilt
      </Tag>

      <Tag variant={antallRisikovuderinger > 0 ? 'success' : 'neutral'} size='xsmall'>
        {antallRisikovuderinger} dokument{antallRisikovuderinger !== 1 ? 'er' : ''}
      </Tag>
    </div>
  )
}

export const OversiktView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setSelectedStep,
  updateTitleUrlAndStep,
  pvkKrav,
}) => {
  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [allRisikoscenario, setAllRisikoscenario] = useState<IRisikoscenario[]>([])
  const [allTiltak, setAllTiltak] = useState<ITiltak[]>([])

  const getMemberListToString = (membersData: ITeamResource[]): string => {
    let memberList: string = ''
    membersData.forEach((member) => {
      memberList += `, ${member.fullName}`
    })

    return memberList.substring(2)
  }

  const getTeamsNameToString = (teamsData: ITeam[]): string => {
    let teamList: string = ''
    teamsData.forEach((team) => {
      teamList += `, ${team.name}`
    })

    return teamList.substring(2)
  }

  const getRisikoscenarioStatus = (step: number): JSX.Element => {
    if (step === 3) {
      const generelSenario = allRisikoscenario.filter((risiko) => risiko.generelScenario)
      const kravSenario = allRisikoscenario.filter(
        (risiko: IRisikoscenario) => !risiko.generelScenario
      )
      if (generelSenario.length === 0) {
        return (
          <Tag variant='neutral' size='xsmall'>
            Ikke påbegynt
          </Tag>
        )
      } else {
        return (
          <div className='gap-2 flex pt-1'>
            {kravSenario.length > 0 && (
              <Tag variant='success' size='xsmall'>
                {kravSenario.length} kravspesifikke risikoscenario
              </Tag>
            )}
            {generelSenario.length > 0 && (
              <Tag variant='success' size='xsmall'>
                {generelSenario.length} øvrige risikoscenario
              </Tag>
            )}
            {allTiltak.length > 0 && (
              <Tag variant='success' size='xsmall'>
                {allTiltak.length} tiltak
              </Tag>
            )}
          </div>
        )
      }
    } else {
      return getRisikoscenarioEtterTiltakStatus()
    }
  }

  const getRisikoscenarioEtterTiltakStatus = (): JSX.Element => {
    if (allRisikoscenario.length === 0) {
      return (
        <Tag variant='neutral' size='xsmall'>
          Ikke påbegynt
        </Tag>
      )
    } else {
      let antallFerdigVurdert = 0
      const risikoscenarioMedIngenTiltak: IRisikoscenario[] = allRisikoscenario.filter(
        (risiko) => risiko.ingenTiltak
      )
      const risikoscenarioMedTiltak: IRisikoscenario[] = allRisikoscenario.filter(
        (risiko) => !risiko.ingenTiltak
      )
      const isUnderarbeid: boolean =
        allRisikoscenario.filter(
          (risiko: IRisikoscenario) =>
            isRisikoUnderarbeidCheck(risiko) ||
            (!risiko.ingenTiltak &&
              (risiko.konsekvensNivaaEtterTiltak === 0 ||
                risiko.sannsynlighetsNivaaEtterTiltak === 0 ||
                risiko.nivaaBegrunnelseEtterTiltak === ''))
        ).length > 0

      if (risikoscenarioMedTiltak.length !== 0) {
        const ferdigVurdertRisikoscenarioMedTiltak: IRisikoscenario[] =
          risikoscenarioMedTiltak.filter(
            (risiko: IRisikoscenario) =>
              risiko.tiltakIds.length !== 0 &&
              risikoscenarioFieldCheck(risiko) &&
              risiko.sannsynlighetsNivaaEtterTiltak !== 0 &&
              risiko.konsekvensNivaaEtterTiltak !== 0 &&
              risiko.nivaaBegrunnelseEtterTiltak !== ''
          )
        antallFerdigVurdert += ferdigVurdertRisikoscenarioMedTiltak.length
      }

      if (risikoscenarioMedIngenTiltak.length !== 0) {
        const ferdigVurdertRisikoscenarioUtenTiltak: IRisikoscenario[] =
          risikoscenarioMedIngenTiltak.filter((risiko: IRisikoscenario) =>
            risikoscenarioFieldCheck(risiko)
          )
        antallFerdigVurdert += ferdigVurdertRisikoscenarioUtenTiltak.length
      }

      return (
        <div className='gap-2 flex pt-1'>
          <Tag variant={isUnderarbeid ? 'info' : 'success'} size='xsmall'>
            Antall ferdig vurdert: {antallFerdigVurdert}
          </Tag>
          {isUnderarbeid && (
            <Tag variant='warning' size='xsmall'>
              Under arbeid
            </Tag>
          )}
        </div>
      )
    }
  }

  const getCustomStatusTags = (index: number) => {
    if (index === 1) {
      return getTilhorendeDokumentasjonStatusTags(etterlevelseDokumentasjon, pvkKrav)
    } else if (index === 3 || index === 4) {
      return getRisikoscenarioStatus(index)
    } else {
      return undefined
    }
  }

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && pvkDokument.id) {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (response: IPageResponse<IRisikoscenario>) => {
            setAllRisikoscenario(response.content)
          }
        )
        await getTiltakByPvkDokumentId(pvkDokument.id).then((response: IPageResponse<ITiltak>) =>
          setAllTiltak(response.content)
        )
      }
    })()
  }, [pvkDokument])

  useEffect(() => {
    ;(async () => {
      await getBehandlingensLivslopByEtterlevelseDokumentId(
        pvkDokument.etterlevelseDokumentId
      ).then((response: IBehandlingensLivslop) => {
        if (response) {
          setBehandlingensLivslop(response)
        }
      })
    })()
  }, [])

  return (
    <div className='flex justify-center'>
      <div>
        <Heading level='1' size='medium' className='mb-5'>
          Oversikt over PVK-prosessen
        </Heading>
        <ReadMore className='mb-5 max-w-[766px]' header='Hvordan skal vi jobbe med PVK?'>
          <BodyShort>
            I PVK-en skal dere beskrive deres behandling av personopplysninger, og gjøre en
            risikoanalyse. Prosessen inkluderer:
          </BodyShort>
          <List as='ol'>
            <List.Item>
              Dere beskriver behandlingen slik at det er enklere å identifisere risikoer.
            </List.Item>
            <List.Item>
              Dere gjør risikoanalyse og setter tiltak og vurderer så tiltakenes effekt.
            </List.Item>
            <List.Item>Dere sender inn PVK til vurdering av Personvernombudet (PVO).</List.Item>
            <List.Item>
              Dere gjør eventuelle endringer, og sender til risikoeier for beslutning om
              risikonivået er akseptabelt.
            </List.Item>
            <List.Item>
              Hvis dere senere endrer hvordan dere behandler personopplysninger, skal dere vurdere
              risikobildet på nytt.
            </List.Item>
          </List>
        </ReadMore>

        <FormSummary className='my-3'>
          <FormSummary.Header>
            <FormSummary.Heading level='2'>Status</FormSummary.Heading>
          </FormSummary.Header>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Value>
                <Link
                  onClick={() => updateTitleUrlAndStep(2)}
                  href={window.location.pathname.slice(0, -1) + 2}
                  className='cursor-pointer'
                >
                  Behandlingens livsløp
                </Link>
              </FormSummary.Value>
              <FormSummary.Value className='gap-2 flex'>
                <div className='gap-2 flex pt-1'>
                  {!behandlingensLivslop && (
                    <Tag variant='neutral' size='xsmall'>
                      Ikke påbegynt
                    </Tag>
                  )}
                  {behandlingensLivslop && behandlingensLivslop.filer.length === 0 && (
                    <Tag variant='neutral' size='xsmall'>
                      Ingen filer er lastet opp
                    </Tag>
                  )}
                  {behandlingensLivslop && behandlingensLivslop.filer.length !== 0 && (
                    <Tag variant='success' size='xsmall'>
                      Lastet opp {behandlingensLivslop.filer.length}{' '}
                      {behandlingensLivslop.filer.length === 1 ? 'fil' : 'filer'}
                    </Tag>
                  )}
                  {behandlingensLivslop && (
                    <Tag
                      variant={
                        behandlingensLivslop.beskrivelse !== '' &&
                        behandlingensLivslop.beskrivelse !== undefined
                          ? 'success'
                          : 'neutral'
                      }
                      size='xsmall'
                    >
                      {behandlingensLivslop.beskrivelse !== '' &&
                      behandlingensLivslop.beskrivelse !== undefined
                        ? 'Skriftlig beskrivelse'
                        : 'Ingen skriftlig beskrivelse'}
                    </Tag>
                  )}
                </div>
              </FormSummary.Value>
            </FormSummary.Answer>

            {StepTitle.slice(2).map((title: string, index: number) => {
              let panelHref: string = window.location.pathname.slice(0, -1) + (index + 3)
              if (index + 3 === 7) {
                panelHref += risikoscenarioFilterAlleUrl()
              }

              return (
                <FormSummaryPanel
                  key={title}
                  title={title}
                  onClick={() => updateTitleUrlAndStep(index + 3)}
                  href={panelHref}
                  step={index}
                  pvkDokumentStatus={pvkDokument.status}
                  status={getFormStatus(pvkDokument, index)}
                  customStatusTag={getCustomStatusTags(index)}
                />
              )
            })}
          </FormSummary.Answers>
        </FormSummary>

        <List className='w-full'>
          <Heading size='medium' className='mb-3'>
            Deltaker og ansvarlige
          </Heading>
          <List.Item>
            <BodyShort>
              <strong>Risikoeier:</strong>{' '}
              {etterlevelseDokumentasjon.risikoeiereData &&
                etterlevelseDokumentasjon.risikoeiereData.length !== 0 &&
                getMemberListToString(etterlevelseDokumentasjon.risikoeiereData)}
              {!etterlevelseDokumentasjon.risikoeiereData ||
                (etterlevelseDokumentasjon.risikoeiereData &&
                  etterlevelseDokumentasjon.risikoeiereData.length === 0 &&
                  'Ingen risikoeier angitt')}
            </BodyShort>
          </List.Item>
          <List.Item>
            <BodyShort>
              <strong>Avdeling:</strong>{' '}
              {etterlevelseDokumentasjon.nomAvdelingId && etterlevelseDokumentasjon.avdelingNavn}
              {!etterlevelseDokumentasjon.nomAvdelingId && 'Avdeling er ikke angitt'}
            </BodyShort>
          </List.Item>
          <List.Item>
            <BodyShort>
              <strong>Team eller personer:</strong>{' '}
              {etterlevelseDokumentasjon.teamsData &&
                getTeamsNameToString(etterlevelseDokumentasjon.teamsData)}
              {etterlevelseDokumentasjon.teamsData &&
                etterlevelseDokumentasjon.teamsData.length !== 0 &&
                ', '}
              {etterlevelseDokumentasjon.resourcesData &&
                getMemberListToString(etterlevelseDokumentasjon.resourcesData)}
              {!etterlevelseDokumentasjon.teamsData &&
                !etterlevelseDokumentasjon.resourcesData &&
                'Avdeling er ikke angitt'}
            </BodyShort>
          </List.Item>
        </List>

        {!etterlevelseDokumentasjon.risikoeiereData && (
          <div className='w-fit'>
            <Alert variant='warning'>
              Dere har ikke lagt inn en risikoeier. Dere må gjøre dette før dere sender PVK-en til
              Personvernombudet. Dere kan redigere deltakere og ansvarlige under
              <Link
                href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='redigere etterlevelsesdokumentasjon'
              >
                Dokumentegenskaper (åpner i en ny fane).
              </Link>
            </Alert>
          </div>
        )}

        <FormButtons
          etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
          activeStep={activeStep}
          setActiveStep={updateTitleUrlAndStep}
          setSelectedStep={setSelectedStep}
        />
      </div>
    </div>
  )
}

export default OversiktView
