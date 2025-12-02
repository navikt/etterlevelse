import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'

export const getVariantForBAOButton = (
  artOgOmfang: IBehandlingensArtOgOmfang
): 'primary' | 'secondary' => {
  const emptyData = [null, undefined, '']
  return (artOgOmfang.stemmerPersonkategorier !== undefined &&
    artOgOmfang.stemmerPersonkategorier !== null) ||
    emptyData.includes(artOgOmfang.personkategoriAntallBeskrivelse) ||
    emptyData.includes(artOgOmfang.lagringsBeskrivelsePersonopplysningene) ||
    emptyData.includes(artOgOmfang.tilgangsBeskrivelsePersonopplysningene)
    ? 'secondary'
    : 'primary'
}
