import { Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { EKravStatus } from '@/constants/krav/kravConstants'

type TPropsKravStandardButtons = {
  submitCancelButton: () => void
  submitSaveButton: () => void
  createMode?: boolean
  kravStatus: EKravStatus
  submitAktivButton: () => void
  isSubmitting: boolean
}

export const KravStandardButtons: FunctionComponent<TPropsKravStandardButtons> = ({
  submitCancelButton,
  submitSaveButton,
  createMode,
  kravStatus,
  submitAktivButton,
  isSubmitting,
}) => {
  const isButtonActive: boolean = createMode || kravStatus !== EKravStatus.AKTIV

  return (
    <div className='flex w-full flex-row-reverse'>
      {isButtonActive && (
        <Button
          type='button'
          className='ml-4'
          variant='primary'
          onClick={submitAktivButton}
          disabled={isSubmitting}
        >
          Publiser og gjør aktiv
        </Button>
      )}

      <Button className='ml-4' variant='primary' onClick={submitSaveButton} disabled={isSubmitting}>
        {isButtonActive
          ? kravStatus === EKravStatus.UTGAATT
            ? 'Lagre'
            : 'Lagre som utkast'
          : 'Publiser endringer'}
      </Button>

      <Button className='ml-4' variant='secondary' type='button' onClick={submitCancelButton}>
        Avbryt
      </Button>
    </div>
  )
}
