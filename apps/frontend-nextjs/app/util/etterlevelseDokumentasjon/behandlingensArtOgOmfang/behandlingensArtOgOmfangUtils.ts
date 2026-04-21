import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { isMissingText } from '@/util/common/validationUtils'

export const getVariantForBAOButton = (
  artOgOmfang: IBehandlingensArtOgOmfang
): 'primary' | 'secondary' => {
  return (artOgOmfang.stemmerPersonkategorier !== undefined &&
    artOgOmfang.stemmerPersonkategorier !== null) ||
    !isMissingText(artOgOmfang.personkategoriAntallBeskrivelse) ||
    !isMissingText(artOgOmfang.lagringsBeskrivelsePersonopplysningene) ||
    !isMissingText(artOgOmfang.tilgangsBeskrivelsePersonopplysningene)
    ? 'secondary'
    : 'primary'
}
