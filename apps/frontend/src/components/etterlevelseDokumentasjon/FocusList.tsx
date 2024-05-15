import { Button } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { IKravPriorityList, TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'
import { AccordionList } from '../focusList/AccordionList'

interface IProps {
  focusList: string[]
  allKravPriority: IKravPriorityList[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  temaListe: TTemaCode[]
}

export const FocusList = (props: IProps) => {
  const { focusList, relevanteStats, temaListe, utgaattStats, allKravPriority } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  const submitForm = () => {
    console.debug('submit')
  }

  useEffect(() => {
    if (focusList.length >= 1) {
      focusList.map((l) => l)
    }
  }, [focusList])

  return (
    <div>
      <div>
        {!isEditMode && (
          <Button type="button" onClick={() => setIsEditMode(true)}>
            Velg krav
          </Button>
        )}
      </div>
      {!isEditMode && <div>Fokus liste</div>}
      {isEditMode && (
        <div className="mt-4">
          <AccordionList
            focusList={focusList}
            allKravPriority={allKravPriority}
            temaListe={temaListe}
            kravliste={relevanteStats}
            utgattKravliste={utgaattStats}
          />
        </div>
      )}
      {isEditMode && (
        <div className="border-border-subtle flex -mt-1 items-center gap-2 sticky bottom-0 border-black border-t-2 bg-bg-default z-10 py-4">
          <Button
            type="button"
            onClick={() => {
              submitForm()
              setIsEditMode(false)
            }}
          >
            Lagre
          </Button>

          <Button type="button" variant="secondary" onClick={() => setIsEditMode(false)}>
            Avbryt
          </Button>
        </div>
      )}
    </div>
  )
}

export default FocusList
