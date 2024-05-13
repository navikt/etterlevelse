import { Button } from '@navikt/ds-react'
import { useState } from 'react'

export const FocusList = () => {
  const [isEditMode, setIsEditMode] = useState<boolean>(true)

  return (
    <div>
      <div>
        <Button onClick={() => setIsEditMode(!isEditMode)}>Velg krav</Button>
      </div>
      {!isEditMode && <div>Fokus liste</div>}
      {isEditMode && <div>Editer fokus liste</div>}
    </div>
  )
}

export default FocusList
