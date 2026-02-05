'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  syncKravRelasjonerForRisikoscenario,
  updateRisikoscenario,
} from '@/api/risikoscenario/risikoscenarioApi'
import VurdereTiltaksEffekt from '@/components/PVK/edit/vurdereTiltaksEffekt'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import RisikoscenarioView from '@/components/risikoscenario/common/RisikoscenarioView'
import { RisikoscenarioTiltakHeader } from '@/components/risikoscenario/common/risikoscenarioTiltakHeader'
import RisikoscenarioModalForm from '@/components/risikoscenario/form/risikoscenarioModalForm'
import { TiltakReadMoreListModalEdit } from '@/components/tiltak/edit/tiltakReadMoreListModalEdit'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IKravReference } from '@/constants/krav/kravConstants'
import { pvkDokumentasjonStepUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { risikoDokumentasjonTemaKravNummerVersjonUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { PencilIcon } from '@navikt/aksel-icons'
import { Button, Link, List, LocalAlert } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useState } from 'react'

type TProps = {
  risikoscenario: IRisikoscenario
  risikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  setRisikosenarioList: (state: IRisikoscenario[]) => void
  allRisikoscenarioList: IRisikoscenario[]
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  formRef: RefObject<any>
}

export const OppsumeringAccordianContent: FunctionComponent<TProps> = ({
  risikoscenario,
  risikoscenarioList,
  etterlevelseDokumentasjonId,
  setRisikosenarioList,
  allRisikoscenarioList,
  setAllRisikoscenarioList,
  tiltakList,
  setTiltakList,
  formRef,
}) => {
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    const onskedeKravnummer = risikoscenario.generelScenario
      ? []
      : (risikoscenario.relevanteKravNummer || []).map((krav) => krav.kravNummer)

    const response = await updateRisikoscenario(risikoscenario)

    const eksisterendeKravnummer = (response.relevanteKravNummer || []).map(
      (krav) => krav.kravNummer
    )
    await syncKravRelasjonerForRisikoscenario(
      response.id,
      eksisterendeKravnummer,
      onskedeKravnummer
    )

    setActiveRisikoscenario(response)
    setIsEditModalOpen(false)
    window.location.reload()
  }

  const activeFormButton = async (runFunction: () => void) => {
    await getPvkDokument(risikoscenario.pvkDokumentId).then((response) => {
      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        runFunction()
      }
    })
  }

  const ferdigBeskrevet: boolean =
    risikoscenario.konsekvensNivaa !== 0 &&
    risikoscenario.sannsynlighetsNivaa !== 0 &&
    risikoscenario.konsekvensNivaaBegrunnelse !== '' &&
    risikoscenario.sannsynlighetsNivaaBegrunnelse !== ''

  return (
    <div>
      <RisikoscenarioView
        risikoscenario={activeRisikoscenario}
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
      />

      <div className='mt-5 flex gap-2 items-center'>
        <Button
          variant={ferdigBeskrevet ? 'tertiary' : 'primary'}
          type='button'
          icon={<PencilIcon aria-hidden />}
          onClick={async () => {
            await activeFormButton(() => setIsEditModalOpen(true))
          }}
        >
          Rediger risikoscenario
        </Button>
      </div>
      <div className='mt-12'>
        <RisikoscenarioTiltakHeader />

        <TiltakReadMoreListModalEdit
          risikoscenario={risikoscenario}
          tiltakList={tiltakList}
          allRisikoscenarioList={allRisikoscenarioList}
          setTiltakList={setTiltakList}
        />

        {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length === 0 && (
          <div className='mt-5'>
            <LocalAlert className='mt-3' status='warning'>
              <LocalAlert.Header>
                <LocalAlert.Title>Dette risikoscenarioet savner tiltak</LocalAlert.Title>
              </LocalAlert.Header>
              <LocalAlert.Content>
                {!risikoscenario.generelScenario && (
                  <>
                    <span>
                      Dere kan ikke vurdere tiltakenes effekt uten tiltak! Tiltak legger dere til på
                      en av kravsidene hvor risikoscenarioet brukes: <br />
                    </span>
                    <List as='ul' className='mt-5'>
                      {risikoscenario.relevanteKravNummer.map(
                        (relevantKrav: IKravReference, index: number) => {
                          const kravHref: string = risikoDokumentasjonTemaKravNummerVersjonUrl(
                            etterlevelseDokumentasjonId,
                            relevantKrav.temaCode || 'PVK',
                            relevantKrav.kravNummer,
                            relevantKrav.kravVersjon
                          )
                          return (
                            <List.Item
                              className='max-w-[75ch]'
                              key={`${relevantKrav.kravNummer}_${index}`}
                            >
                              <ExternalLink href={kravHref}>
                                K{relevantKrav.kravNummer}.{relevantKrav.kravVersjon}{' '}
                                {relevantKrav.navn}
                              </ExternalLink>
                            </List.Item>
                          )
                        }
                      )}
                    </List>
                  </>
                )}
                {risikoscenario.generelScenario && (
                  <>
                    <span>
                      Dere kan ikke vurdere tiltakenes effekt uten tiltak! <br />
                    </span>
                    <Link
                      href={pvkDokumentasjonStepUrl(
                        etterlevelseDokumentasjonId,
                        risikoscenario.pvkDokumentId,
                        6,
                        `?risikoscenario=${risikoscenario.id}`
                      )}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='redigere etterlevelsesdokumentasjon'
                      className='mt-3'
                    >
                      Legg inn tiltak under Identifisering av risikoscenarioer og tiltak. (åpner i
                      en ny fane).
                    </Link>
                  </>
                )}
              </LocalAlert.Content>
            </LocalAlert>
          </div>
        )}

        {!risikoscenario.ingenTiltak && (
          <div className='mt-5'>
            {risikoscenario.tiltakIds.length !== 0 && (
              <div>
                <VurdereTiltaksEffekt
                  risikoscenario={activeRisikoscenario}
                  setRisikoscenario={setActiveRisikoscenario}
                  risikoscenarioList={risikoscenarioList}
                  setRisikosenarioList={setRisikosenarioList}
                  allRisikoscenarioList={allRisikoscenarioList}
                  setAllRisikoscenarioList={setAllRisikoscenarioList}
                  formRef={formRef}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <RisikoscenarioModalForm
          headerText='Rediger øvrig risikoscenario'
          mode='update'
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          submit={submit}
          initialValues={activeRisikoscenario}
        />
      )}

      {isPvoAlertModalOpen && (
        <AlertPvoUnderArbeidModal
          isOpen={isPvoAlertModalOpen}
          onClose={() => setIsPvoAlertModalOpen(false)}
          pvkDokumentId={risikoscenario.pvkDokumentId}
        />
      )}
    </div>
  )
}

export default OppsumeringAccordianContent
