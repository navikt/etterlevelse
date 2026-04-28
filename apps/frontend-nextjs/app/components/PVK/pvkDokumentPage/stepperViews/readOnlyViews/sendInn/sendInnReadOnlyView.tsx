'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopToFormValue,
} from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import InfoChangesMadeAfterApproval from '@/components/PVK/common/infoChangesMadeAfterApproval'
import FormButtons from '@/components/PVK/edit/formButtons'
import { IPageResponse } from '@/constants/commonConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { ICodelistProps } from '@/provider/kodeverk/kodeverkProvider'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { FilesIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, CopyButton, Heading } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { FunctionComponent, useEffect, useState } from 'react'
import ArtOgOmFangSummary from '../../../formSummary/artOgOmFangSummary'
import BehandlingensLivslopSummary from '../../../formSummary/behandlingensLivslopSummary'
import RisikoscenarioEtterTitak from '../../../formSummary/risikoscenarioEtterTitak'
import RisikoscenarioSummary from '../../../formSummary/risikoscenarioSummary'
import TilhorendeDokumentasjonSummary from '../../../formSummary/tilhorendeDokumentasjonSummary'
import GodkjentAvRisikoeierReadOnly from './godkjentAvRisikoeierReadOnly'
import InvolveringSummaryReadOnly from './summary/involveringSummaryReadOnly'

type TProps = {
  pvkDokument: IPvkDokument
  setPvkDokument: (state: IPvkDokument) => void
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  codelistUtils: ICodelistProps
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
  isPvkKravLoading: boolean
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const SendInnReadOnlyView: FunctionComponent<TProps> = ({
  pvkDokument,
  updateTitleUrlAndStep,
  personkategorier,
  databehandlere,
  etterlevelseDokumentasjon,
  activeStep,
  setActiveStep,
  setSelectedStep,
  codelistUtils,
  pvkKrav,
  pvoTilbakemelding,
}) => {
  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [alleRisikoscenario, setAlleRisikoscenario] = useState<IRisikoscenario[]>([])
  const [alleTiltak, setAlleTitltak] = useState<ITiltak[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [pvoVurderingList, setPvoVurderingList] = useState<ICode[]>([])
  const [artOgOmfang] = useBehandlingensArtOgOmfang(etterlevelseDokumentasjon.id)
  const artOgOmfangError = {
    stemmerPersonkategorier: false,
    personkategoriAntallBeskrivelse: false,
    tilgangsBeskrivelsePersonopplysningene: false,
    lagringsBeskrivelsePersonopplysningene: false,
  }

  useEffect(() => {
    ;(async () => {
      if (pvkDokument) {
        setIsLoading(true)
        await getBehandlingensLivslopByEtterlevelseDokumentId(pvkDokument.etterlevelseDokumentId)
          .then((response: IBehandlingensLivslop) => {
            setBehandlingensLivslop(response)
          })
          .catch((error: AxiosError) => {
            if (error.status === 404) {
              setBehandlingensLivslop(mapBehandlingensLivslopToFormValue({}))
            } else {
              console.debug(error)
            }
          })
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (response: IPageResponse<IRisikoscenario>) => setAlleRisikoscenario(response.content)
        )
        await getTiltakByPvkDokumentId(pvkDokument.id).then((response: IPageResponse<ITiltak>) =>
          setAlleTitltak(response.content)
        )
        setIsLoading(false)

        setPvoVurderingList(
          codelistUtils
            .getCodes(EListName.PVO_VURDERING)
            .sort((a, b) => a.shortName.localeCompare(b.shortName)) as ICode[]
        )
      }
    })()
  }, [pvkDokument])

  return (
    <div className='flex justify-center'>
      <div>
        <Heading level='1' size='medium' className='mb-5'>
          Les og send inn
        </Heading>

        <div className='flex justify-center w-full'>
          <div className='max-w-[75ch]'>
            <InfoChangesMadeAfterApproval
              pvkDokument={pvkDokument}
              behandlingensLivslop={behandlingensLivslop}
              alleRisikoscenario={alleRisikoscenario}
              alleTiltak={alleTiltak}
            />
          </div>
        </div>

        <BodyLong>
          Her kan dere lese over det som er lagt inn i PVK-en. Hvis dere oppdager feil eller mangel,
          er det mulig å gå tilbake og endre svar. Til slutt er det plass til å legge til
          ytterligere informasjon dersom det er aktuelt.
        </BodyLong>
        <CopyButton
          variant='action'
          copyText={window.location.href}
          text='Kopier lenken til denne siden'
          activeText='Lenken er kopiert'
          icon={<FilesIcon aria-hidden />}
        />
        {pvkDokument.status !== EPvkDokumentStatus.UNDERARBEID && (
          <Alert variant='info' className='my-5'>
            Status: {pvkDokumentStatusToText(pvkDokument.status)}
          </Alert>
        )}

        <BehandlingensLivslopSummary
          behandlingensLivslop={behandlingensLivslop}
          behandlingensLivslopError={false}
          updateTitleUrlAndStep={updateTitleUrlAndStep}
          customLinkText='Les detaljer'
        />

        <ArtOgOmFangSummary
          artOgOmfang={artOgOmfang}
          artOgOmfangError={artOgOmfangError}
          personkategorier={personkategorier}
          updateTitleUrlAndStep={updateTitleUrlAndStep}
          customLinktext='Les detaljer'
        />

        <TilhorendeDokumentasjonSummary
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          manglerBehandlingError={false}
          pvkKravError={''}
          pvkKrav={pvkKrav}
        />

        <InvolveringSummaryReadOnly
          pvkDokument={pvkDokument}
          databehandlere={databehandlere}
          personkategorier={personkategorier}
        />

        <RisikoscenarioSummary
          alleRisikoscenario={alleRisikoscenario}
          alleTiltak={alleTiltak}
          risikoscenarioError={''}
          tiltakError={''}
          tiltakAnsvarligError={''}
          tiltakFristError={''}
          tiltakFristUtgaattError={''}
        />

        <RisikoscenarioEtterTitak
          alleRisikoscenario={alleRisikoscenario}
          savnerVurderingError={''}
        />

        <div className='flex justify-center'>
          {pvoTilbakemelding && (
            <GodkjentAvRisikoeierReadOnly
              pvkDokument={pvkDokument}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              isLoading={isLoading}
              pvoVurderingList={pvoVurderingList}
              pvoTilbakemelding={pvoTilbakemelding}
            />
          )}
        </div>

        {!isLoading && (
          <FormButtons
            etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setSelectedStep={setSelectedStep}
            customButtons={
              <div className='mt-5 flex gap-2 items-center'>
                <div className='min-w-111.5' />
              </div>
            }
          />
        )}
      </div>
    </div>
  )
}
