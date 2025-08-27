import { useKravPriorityList } from '@/api/krav/kravliste/kravPriorityList/kravPriorityList'
import { IKrav } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { sortKravListeByPriority } from '@/util/krav/kravUtil'
import { Button, List } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { EditPriorityModal } from './editPriorityModal/editPriorityModal'
import { getKravTemaRowsWithLabel } from './getKravTemaRowsWithLabel/getKravTemaRowsWithLabel'

interface IKravTemaListProps {
  activeKravList: IKrav[]
  tema: string
  temaCode: string
  draftKrav: IKrav[]
}

export const KravTemaList = (props: IKravTemaListProps) => {
  const { activeKravList, tema, temaCode, draftKrav } = props
  const [isEditPriorityModalOpen, setIsEditPriorityModalOpen] = useState(false)
  const [kravPriorityList, kravPriorityLoading, refresh] = useKravPriorityList(temaCode)
  const [activeKravSortedWithPriority, setActiveKravSortedWithPriority] = useState<IKrav[]>([])

  const setPriorityToKravList = (kravList: IKrav[], priorityList: IKravPriorityList): IKrav[] => {
    return kravList.map((krav: IKrav) => {
      const priorityForTema: number = priorityList.priorityList.indexOf(krav.kravNummer) + 1
      krav.prioriteringsId = priorityForTema
      return krav
    })
  }

  useEffect(() => {
    const activeKravListWithPriorityId = setPriorityToKravList(activeKravList, kravPriorityList)
    setActiveKravSortedWithPriority(sortKravListeByPriority(activeKravListWithPriorityId))
  }, [kravPriorityList])

  return (
    <div className='flex flex-col gap-2'>
      <List>
        {getKravTemaRowsWithLabel(draftKrav, tema)}
        {getKravTemaRowsWithLabel(activeKravSortedWithPriority, tema)}
      </List>
      <div className={'w-full flex flex-row-reverse pt-5'}>
        <Button variant='secondary' size='medium' onClick={() => setIsEditPriorityModalOpen(true)}>
          Endre rekkefølge på krav
        </Button>
      </div>

      {activeKravSortedWithPriority && isEditPriorityModalOpen && !kravPriorityLoading && (
        <EditPriorityModal
          tema={tema}
          temaCode={temaCode}
          isOpen={isEditPriorityModalOpen}
          setIsOpen={setIsEditPriorityModalOpen}
          kravListe={activeKravSortedWithPriority}
          kravPriorityList={kravPriorityList}
          refresh={() => refresh()}
        />
      )}
    </div>
  )
}
