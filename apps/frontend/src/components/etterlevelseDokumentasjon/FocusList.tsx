import { Button } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'

interface IProps {
  focusList: [string]

  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  temaListe: TTemaCode[]
}

export const FocusList = (props: IProps) => {
  const { focusList } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(true)

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
      {isEditMode && <div>Editer fokus liste</div>}
    </div>
  )
}

export default FocusList
