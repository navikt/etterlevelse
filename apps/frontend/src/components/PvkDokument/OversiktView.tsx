import { Alert, BodyShort, FormSummary, Heading, Link, List, ReadMore, Tag } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '../../api/BehandlingensLivslopApi'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../api/TiltakApi'
import {
  ERisikoscenarioType,
  IBehandlingensLivslop,
  IPvkDokument,
  IRisikoscenario,
  ITeam,
  ITeamResource,
  ITiltak,
  TEtterlevelseDokumentasjonQL,
} from '../../constants'
import { StepTitle } from '../../pages/PvkDokumentPage'
import { isRisikoUnderarbeidCheck, risikoscenarioFieldCheck } from '../risikoscenario/common/util'
import FormSummaryPanel from './common/FormSummaryPanel'
import FormButtons from './edit/FormButtons'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setSelectedStep: (step: number) => void
  updateTitleUrlAndStep: (step: number) => void
}

export const OversiktView = (props: IProps) => {
  const {
    etterlevelseDokumentasjon,
    pvkDokument,
    activeStep,
    setSelectedStep,
    updateTitleUrlAndStep,
  } = props

  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [allRisikoscenario, setAllRisikoscenario] = useState<IRisikoscenario[]>([])
  const [allTiltak, setAllTiltak] = useState<ITiltak[]>([])

  const formStatus = [
    pvkDokument.stemmerPersonkategorier !== null ||
      pvkDokument.personkategoriAntallBeskrivelse ||
      pvkDokument.tilgangsBeskrivelsePersonopplysningene ||
      pvkDokument.lagringsBeskrivelsePersonopplysningene,
    pvkDokument.harInvolvertRepresentant !== null ||
      pvkDokument.representantInvolveringsBeskrivelse ||
      pvkDokument.harDatabehandlerRepresentantInvolvering !== null ||
      pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse,
    allRisikoscenario.length > 0,
    allRisikoscenario.filter(
      (risikoscenario) =>
        risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
        risikoscenario.sannsynlighetsNivaaEtterTiltak ||
        risikoscenario.nivaaBegrunnelseEtterTiltak !== ''
    ).length > 0,
  ]

  const getMemberListToString = (membersData: ITeamResource[]): string => {
    let memberList = ''
    membersData.forEach((member) => {
      memberList += `, ${member.fullName}`
    })

    return memberList.substring(2)
  }

  const getTeamsNameToString = (teamsData: ITeam[]): string => {
    let teamList = ''
    teamsData.forEach((team) => {
      teamList += `, ${team.name}`
    })

    return teamList.substring(2)
  }

  const getStatus = (step: number) => {
    if (step === 4) {
      return undefined
    } else {
      return formStatus[step] ? 'Under arbeid' : 'Ikke påbegynt'
    }
  }

  const getRisikoscenarioStatus = (step: number) => {
    if (step === 2) {
      const generelSenario = allRisikoscenario.filter((risiko) => risiko.generelScenario)
      if (generelSenario.length === 0) {
        return (
          <Tag variant='warning' size='xsmall'>
            Ikke påbegynt
          </Tag>
        )
      } else {
        const isUnderarbeid =
          generelSenario.filter((risiko) => isRisikoUnderarbeidCheck(risiko)).length > 0
        return (
          <div className='gap-2 flex pt-1'>
            <Tag variant={isUnderarbeid ? 'info' : 'success'} size='xsmall'>
              Antall risikoscenario: {generelSenario.length}
            </Tag>
            <Tag variant={isUnderarbeid ? 'info' : 'success'} size='xsmall'>
              Antall tiltak: {allTiltak.length}
            </Tag>
            {isUnderarbeid && (
              <Tag variant='warning' size='xsmall'>
                Under arbeid
              </Tag>
            )}
          </div>
        )
      }
    } else {
      return getRisikoscenarioEtterTiltakStatus()
    }
  }

  const getRisikoscenarioEtterTiltakStatus = () => {
    if (allRisikoscenario.length === 0) {
      return (
        <Tag variant='warning' size='xsmall'>
          Ikke påbegynt
        </Tag>
      )
    } else {
      let antallFerdigVurdert = 0
      const risikoscenarioMedIngenTiltak = allRisikoscenario.filter((risiko) => risiko.ingenTiltak)
      const risikoscenarioMedTiltak = allRisikoscenario.filter((risiko) => !risiko.ingenTiltak)
      const isUnderarbeid =
        allRisikoscenario.filter(
          (risiko) =>
            isRisikoUnderarbeidCheck(risiko) ||
            (!risiko.ingenTiltak &&
              (risiko.konsekvensNivaaEtterTiltak === 0 ||
                risiko.sannsynlighetsNivaaEtterTiltak === 0 ||
                risiko.nivaaBegrunnelseEtterTiltak === ''))
        ).length > 0

      if (risikoscenarioMedTiltak.length !== 0) {
        const ferdigVurdertRisikoscenarioMedTiltak = risikoscenarioMedTiltak.filter(
          (risiko) =>
            risiko.tiltakIds.length !== 0 &&
            risikoscenarioFieldCheck(risiko) &&
            risiko.sannsynlighetsNivaaEtterTiltak !== 0 &&
            risiko.konsekvensNivaaEtterTiltak !== 0 &&
            risiko.nivaaBegrunnelseEtterTiltak !== ''
        )
        antallFerdigVurdert += ferdigVurdertRisikoscenarioMedTiltak.length
      }

      if (risikoscenarioMedIngenTiltak.length !== 0) {
        const ferdigVurdertRisikoscenarioUtenTiltak = risikoscenarioMedIngenTiltak.filter(
          (risiko) => risikoscenarioFieldCheck(risiko)
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

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && pvkDokument.id) {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (response) => {
            setAllRisikoscenario(response.content)
          }
        )
        await getTiltakByPvkDokumentId(pvkDokument.id).then((response) =>
          setAllTiltak(response.content)
        )
      }
    })()
  }, [pvkDokument])

  useEffect(() => {
    ;(async () => {
      await getBehandlingensLivslopByEtterlevelseDokumentId(
        pvkDokument.etterlevelseDokumentId
      ).then((response) => {
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
            <List.Item>Dere gjør risikoanalyse og setter tiltak.</List.Item>
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
                    <Tag variant='warning' size='xsmall'>
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

            {StepTitle.slice(2).map((title, index) => {
              let panelHref = window.location.pathname.slice(0, -1) + (index + 3)
              if (index + 3 === 6) {
                panelHref += '?tab=risikoscenarioer&filter=alle'
              }
              return (
                <FormSummaryPanel
                  key={title}
                  title={title}
                  onClick={() => updateTitleUrlAndStep(index + 3)}
                  href={panelHref}
                  step={index}
                  pvkDokumentStatus={pvkDokument.status}
                  status={getStatus(index)}
                  customStatusTag={
                    index === 2 || index === 3 ? getRisikoscenarioStatus(index) : undefined
                  }
                />
              )
            })}
          </FormSummary.Answers>
        </FormSummary>

        <List title='Deltaker og ansvarlige' className='w-full'>
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
              {etterlevelseDokumentasjon.avdeling && etterlevelseDokumentasjon.avdeling.shortName}
              {!etterlevelseDokumentasjon.avdeling && 'Avdeling er ikke angitt'}
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
                href={'/dokumentasjon/edit/' + etterlevelseDokumentasjon.id}
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
