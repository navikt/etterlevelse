'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import FormSummaryPanel from '@/components/PVK/common/formSummaryPanel'
import HvordanSkalViJobbeMedPvkReadMore from '@/components/PVK/common/hvordanSkalViJobbeMedPvkReadMore'
import {
  getFormStatus,
  getTilhorendeDokumentasjonStatusTags,
} from '@/components/PVK/pvkDokumentPage/stepperViews/oversiktView'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IPageResponse } from '@/constants/commonConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { ITeam, ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { pvkDokumentasjonPvkBehovUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { risikoscenarioFilterAlleUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import { Alert, BodyShort, FormSummary, Heading, Label, Link, List, Tag } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import PvoFormButtons from '../../form/pvoFormButtons'
import { PvoTilbakemeldingAnsvarligForm } from '../../form/pvoTilbakemeldingAnsvarligForm'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setSelectedStep: (step: number) => void
  updateTitleUrlAndStep: (step: number) => void
  pvoTilbakemelding: IPvoTilbakemelding
  relevantVurdering: IVurdering
  formRef: RefObject<any>
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
}

const StepTitle: string[] = [
  'Oversikt og status',
  'Behandlingens livsløp',
  'Behandlingens art og omfang',
  'Tilhørende dokumentasjon',
  'Involvering av eksterne',
  'Identifisering av risikoscenarioer og tiltak',
  'Risikobildet etter tiltak',
  'Send tilbakemelding',
]

export const OversiktPvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setSelectedStep,
  updateTitleUrlAndStep,
  pvoTilbakemelding,
  relevantVurdering,
  formRef,
  pvkKrav,
}) => {
  const pathName = usePathname()
  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [allRisikoscenario, setAllRisikoscenario] = useState<IRisikoscenario[]>([])
  const [allTiltak, setAllTiltak] = useState<ITiltak[]>([])
  const [artOgOmfang] = useBehandlingensArtOgOmfang(etterlevelseDokumentasjon.id)

  const getMemberListToString = (membersData: ITeamResource[]): string => {
    let memberList = ''
    membersData.forEach((member: ITeamResource) => {
      memberList += `, ${member.fullName}`
    })

    return memberList.substring(2)
  }

  const getTeamsNameToString = (teamsData: ITeam[]): string => {
    let teamList = ''
    teamsData.forEach((team: ITeam) => {
      teamList += `, ${team.name}`
    })

    return teamList.substring(2)
  }

  const getRisikoscenarioStatus = (step: number) => {
    if (step === 3) {
      const generelSenario = allRisikoscenario.filter(
        (risiko: IRisikoscenario) => risiko.generelScenario
      )
      const kravSenario = allRisikoscenario.filter(
        (risiko: IRisikoscenario) => !risiko.generelScenario
      )

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
    } else {
      return getRisikoscenarioEtterTiltakStatus()
    }
  }

  const getRisikoscenarioEtterTiltakStatus = () => {
    const risikoscenarioMedIngenTiltak: IRisikoscenario[] = allRisikoscenario.filter(
      (risiko: IRisikoscenario) => risiko.ingenTiltak
    )
    const risikoscenarioMedTiltak: IRisikoscenario[] = allRisikoscenario.filter(
      (risiko: IRisikoscenario) => !risiko.ingenTiltak
    )

    return (
      <div className='gap-2 flex pt-1'>
        <Tag variant='success' size='xsmall'>
          Antall ferdig vurdert: {risikoscenarioMedTiltak.length}
        </Tag>

        <Tag variant='neutral' size='xsmall'>
          Antall risikoscenario med tiltak ikke aktuelt: {risikoscenarioMedIngenTiltak.length}
        </Tag>
      </div>
    )
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
      await getBehandlingensLivslopByEtterlevelseDokumentId(
        pvkDokument.etterlevelseDokumentId
      ).then((response: IBehandlingensLivslop) => {
        if (response) {
          setBehandlingensLivslop(response)
        }
      })
    })()
  }, [])

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

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='px-6 py-9 rounded-lg max-w-[766px] w-full bg-[#E3EFF7] mb-18'>
        {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
          <PvoTilbakemeldingAnsvarligForm
            pvkDokument={pvkDokument}
            pvoTilbakemelding={pvoTilbakemelding}
            initialValue={relevantVurdering}
            formRef={formRef}
          />
        )}

        {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
          <div>
            <Label>Ansvarlig</Label>
            <List as='ul'>
              {relevantVurdering.ansvarlig.length === 0 && (
                <List.Item>Ingen ansvarlig satt</List.Item>
              )}
              {relevantVurdering.ansvarligData &&
                relevantVurdering.ansvarligData.length !== 0 &&
                relevantVurdering.ansvarligData.map((data) => (
                  <List.Item key={data.navIdent}>{data.fullName}</List.Item>
                ))}
            </List>
          </div>
        )}
      </div>
      <div className='max-w-[766px] w-full'>
        <Heading level='1' size='medium' className='mb-5'>
          Oversikt over PVK-prosessen
        </Heading>
        <HvordanSkalViJobbeMedPvkReadMore />

        <FormSummary className='my-3'>
          <FormSummary.Header>
            <FormSummary.Heading level='2'>Status</FormSummary.Heading>
          </FormSummary.Header>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Value>
                {/* TODO: lage et readonly url/komponent for pvkdokument vurderings side */}
                <ExternalLink
                  href={pvkDokumentasjonPvkBehovUrl(
                    pvkDokument.etterlevelseDokumentId,
                    pvkDokument.id
                  )}
                >
                  Vurder behov for PVK
                </ExternalLink>
              </FormSummary.Value>
              <FormSummary.Value className='gap-2 flex'>
                {pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
                  'Vi skal gjennomføre PVK'}
                {pvkDokument.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE &&
                  'Vi skal ikke gjennomføre PVK'}
              </FormSummary.Value>
            </FormSummary.Answer>

            <FormSummary.Answer>
              <FormSummary.Value>
                <Link
                  onClick={() => updateTitleUrlAndStep(2)}
                  href={`${pathName}?steg=${2}`}
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
              let panelHref: string = `${pathName}?steg=${index + 3}`
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
                  status={getFormStatus(pvkDokument, artOgOmfang, index)}
                  customStatusTag={getCustomStatusTags(index)}
                  pvoView
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

        <PvoFormButtons
          activeStep={activeStep}
          setActiveStep={updateTitleUrlAndStep}
          setSelectedStep={setSelectedStep}
        />
      </div>
    </div>
  )
}

export default OversiktPvoView
