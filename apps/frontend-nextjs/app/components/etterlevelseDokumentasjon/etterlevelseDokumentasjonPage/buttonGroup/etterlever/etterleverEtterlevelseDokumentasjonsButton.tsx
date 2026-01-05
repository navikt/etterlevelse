import { ArtOgOmfantEtterlever } from './artOgOmfantEtterlever/artOgOmfantEtterlever'
import { BehandlingslivslopEtterlever } from './behandlingslivslopEtterlever/behandlingslivslopEtterlever'
import { PersonvernkonsekvensevurderingsLopetEtterlever } from './personvernkonsekvensevurderingsLopetEtterlever/personvernkonsekvensevurderingsLopetEtterlever'

export const EtterleverEtterlevelseDokumentasjonsButton = () => (
  <>
    <BehandlingslivslopEtterlever />
    <ArtOgOmfantEtterlever />
    <PersonvernkonsekvensevurderingsLopetEtterlever />
  </>
)
