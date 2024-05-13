import { Button } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'
import { AccordionList } from '../focusList/AccordionList'

interface IProps {
  focusList: [string]

  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  temaListe: TTemaCode[]
}

export const FocusList = (props: IProps) => {
  const { focusList, relevanteStats, temaListe, utgaattStats } = props
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

        {isEditMode && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => {
                submitForm()
                setIsEditMode(false)
              }}
            >
              Lagre endringer
            </Button>

            <Button type="button" variant="secondary" onClick={() => setIsEditMode(false)}>
              Avbryt
            </Button>
          </div>
        )}
      </div>
      {!isEditMode && <div>Fokus liste</div>}
      {isEditMode && (
        <div>
          <AccordionList
            temaListe={temaListe}
            kravliste={relevanteStats}
            utgattKravliste={utgaattStats}
          />
        </div>
      )}
    </div>
  )
}

export default FocusList
