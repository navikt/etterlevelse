import { BodyLong, Heading } from '@navikt/ds-react'
import ArtOgOmFangSummary from './formSummary/ArtOgOmfangSummary'
import InnvolveringSummary from './formSummary/InnvolveringSummary'

interface IProps {
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
}
export const SendInnView = (props: IProps) => {
  const { updateTitleUrlAndStep, personkategorier, databehandlere } = props
  return (
    <div>
      <Heading level="1" size="medium" className="mb-5">
        Les og send inn
      </Heading>
      <BodyLong>
        Her kan dere lese over det som er lagt inn i PVK-en. Hvis dere oppdager feil eller mangel,
        er det mulig å gå tilbake og endre svar. Til slutt er det plass til å legge til ytterligere
        informasjon dersom det er aktuelt.
      </BodyLong>

      <ArtOgOmFangSummary
        personkategorier={personkategorier}
        updateTitleUrlAndStep={updateTitleUrlAndStep}
      />

      <InnvolveringSummary
        databehandlere={databehandlere}
        personkategorier={personkategorier}
        updateTitleUrlAndStep={updateTitleUrlAndStep}
      />
    </div>
  )
}

export default SendInnView
