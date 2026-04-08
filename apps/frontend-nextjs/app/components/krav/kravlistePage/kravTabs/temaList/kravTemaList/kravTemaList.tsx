import { useKravPriorityList } from '@/api/kravPriorityList/kravPriorityListApi'
import { IKrav } from '@/constants/krav/kravConstants'
import { sortKravListeByPriority } from '@/util/krav/kravUtil'
import { Button, List } from '@navikt/ds-react'
import { useMemo, useState } from 'react'
import { EditPriorityModal } from './editPriorityModal/editPriorityModal'
import { KravTemaRowsWithLabel } from './kravTemaRowsWithLabel/kravTemaRowsWithLabel'

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

  const activeKravSortedWithPriority = useMemo<IKrav[]>(() => {
    const withPriority = activeKravList.map((krav: IKrav) => ({
      ...krav,
      prioriteringsId: kravPriorityList.priorityList.indexOf(krav.kravNummer) + 1,
    }))
    return sortKravListeByPriority(withPriority)
  }, [activeKravList, kravPriorityList])

  return (
    <div className='flex flex-col gap-2'>
      <List>
        <KravTemaRowsWithLabel kravListe={draftKrav} tema={tema} />
        <KravTemaRowsWithLabel kravListe={activeKravSortedWithPriority} tema={tema} />
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
