import { kravPrioritingMapToFormValue } from '../api/KravPriorityListApi'
import { filterKrav } from '../components/etterlevelseDokumentasjonTema/common/utils'
import { IKravPriorityList, TKravQL } from '../constants'
import { TTemaCode, codelist } from '../services/Codelist'

interface IProps {
  tema: TTemaCode
  kravliste: TKravQL[]
  allKravPriority: IKravPriorityList[]
}

export const getKravForTema = (props: IProps) => {
  const { tema, kravliste, allKravPriority } = props

  const lover = codelist.getCodesForTema(tema.code)
  const lovCodes = lover.map((lov) => lov.code)
  const krav = kravliste.filter((krav) =>
    krav.regelverk
      .map((regelverk: any) => regelverk.lov.code)
      .some((lov: any) => lovCodes.includes(lov))
  )
  const kravPriorityForTema = allKravPriority.filter(
    (kravPriority) => kravPriority.temaId === tema.code
  )[0]

  const kravPriority = kravPriorityForTema ? kravPriorityForTema : kravPrioritingMapToFormValue({})

  return filterKrav(kravPriority, krav)
}
