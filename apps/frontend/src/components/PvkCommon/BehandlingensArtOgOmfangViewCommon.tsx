import { Heading, List } from '@navikt/ds-react'
import { IPvkDokument } from '../../constants'

interface IPropsBehandlingensArtOgOmfangViewCommon {
  pvkDokument: IPvkDokument
  personkategorier: string[]
}

export const BehandlingensArtOgOmfangViewCommon = ({
  pvkDokument,
  personkategorier,
}: IPropsBehandlingensArtOgOmfangViewCommon) => (
  <div>
    <Heading level="1" size="medium" className="mb-5">
      Behandlingens art og omfang
    </Heading>
    {pvkDokument.changeStamp.lastModifiedBy && (
      <div className="mt-5 mb-10">Sist redigert av: ${pvkDokument.changeStamp.lastModifiedBy}</div>
    )}

    <List
      headingTag="label"
      title="I Behandlingskatalogen står det at dere behandler personopplysninger om:"
    >
      {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
      {personkategorier.length > 0 &&
        personkategorier.map((personkategori: string) => (
          <List.Item key={personkategori}>{personkategori}</List.Item>
        ))}
    </List>
  </div>
)
