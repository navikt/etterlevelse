import { FilesIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, CopyButton, Heading } from '@navikt/ds-react'
import { EPVK, EPvkDokumentStatus, IPvkDokument } from '../../constants'
import ArtOgOmFangSummary from '../PvkDokument/formSummary/ArtOgOmfangSummary'
import InvolveringSummary from '../PvkDokument/formSummary/InvolveringSummary'
import RisikoscenarioSummary from '../PvkDokument/formSummary/RisikoscenarioSummary'

interface IPropsSendInnViewArtInvRisCommon {
  personkategorier: string[]
  updateTitleUrlAndStep: (step: number) => void
  databehandlere: string[]
}

export const SendInnViewArtInvRisCommon = ({
  personkategorier,
  updateTitleUrlAndStep,
  databehandlere,
}: IPropsSendInnViewArtInvRisCommon) => (
  <div>
    <Heading level="1" size="medium" className="mb-5">
      Les og send inn
    </Heading>
    <BodyLong>
      Her kan dere lese over det som er lagt inn i PVK-en. Hvis dere oppdager feil eller mangel, er
      det mulig å gå tilbake og endre svar. Til slutt er det plass til å legge til ytterligere
      informasjon dersom det er aktuelt.
    </BodyLong>

    <ArtOgOmFangSummary
      personkategorier={personkategorier}
      updateTitleUrlAndStep={updateTitleUrlAndStep}
    />

    <InvolveringSummary
      databehandlere={databehandlere}
      personkategorier={personkategorier}
      updateTitleUrlAndStep={updateTitleUrlAndStep}
    />

    <RisikoscenarioSummary />
  </div>
)

interface IPropsSendInnViewCopySendCommon {
  pvkDokument: IPvkDokument
}

export const SendInnViewCopySendCommon = ({ pvkDokument }: IPropsSendInnViewCopySendCommon) => (
  <div>
    <CopyButton
      variant="action"
      copyText={window.location.href}
      text="Kopiér lenken til denne siden"
      activeText="Lenken er kopiert"
      icon={<FilesIcon aria-hidden />}
    />

    {pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO && (
      <Alert variant="success" className="my-5">
        Sendt til {EPVK.pvk}
      </Alert>
    )}
  </div>
)
