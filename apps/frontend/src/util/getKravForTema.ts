import { kravPrioritingMapToFormValue } from '../api/KravPriorityListApi'
import { filterKrav } from '../components/etterlevelseDokumentasjonTema/common/utils'
import { IKravPriorityList, TKravQL } from '../constants'
import { CodelistService, TLovCode, TTemaCode } from '../services/Codelist'

interface IProps {
  tema: TTemaCode
  kravliste: TKravQL[]
  allKravPriority: IKravPriorityList[]
}

export const getKravForTema = (props: IProps) => {
  const { tema, kravliste, allKravPriority } = props
  const [codelistUtils] = CodelistService()

  const lover: TLovCode[] = codelistUtils.getCodesForTema(tema.code)
  const lovCodes: string[] = lover.map((lov: TLovCode) => lov.code)
  const krav: TKravQL[] = kravliste.filter((krav: TKravQL) =>
    krav.regelverk
      .map((regelverk: any) => regelverk.lov.code)
      .some((lov: any) => lovCodes.includes(lov))
  )
  const kravPriorityForTema: IKravPriorityList = allKravPriority.filter(
    (kravPriority) => kravPriority.temaId === tema.code
  )[0]

  const kravPriority: IKravPriorityList = kravPriorityForTema
    ? kravPriorityForTema
    : kravPrioritingMapToFormValue({})

  return filterKrav(kravPriority, krav)
}
