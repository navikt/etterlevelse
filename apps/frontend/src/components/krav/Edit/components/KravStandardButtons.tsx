import { Button } from '@navikt/ds-react'
import { EKravStatus } from '../../../../constants'

interface IPropsKravStandardButtons {
  submitCancelButton: () => void
  submitSaveButton: () => void
  kravStatus: EKravStatus
  submitAktivButton: () => void
  isSubmitting: boolean
}

export const KravStandardButtons = ({
  submitCancelButton,
  submitSaveButton,
  kravStatus,
  submitAktivButton,
  isSubmitting,
}: IPropsKravStandardButtons) => (
  <div className="flex w-full justify-end">
    <Button className="ml-4" variant="secondary" type="button" onClick={submitCancelButton}>
      Avbryt
    </Button>

    <Button className="ml-4" variant="primary" onClick={submitSaveButton} disabled={isSubmitting}>
      {kravStatus !== EKravStatus.AKTIV ? 'Lagre' : 'Publiser endringer'}
    </Button>

    {kravStatus !== EKravStatus.AKTIV && (
      <Button
        type="button"
        className="ml-4"
        variant="primary"
        onClick={submitAktivButton}
        disabled={isSubmitting}
      >
        Publiser og gjør aktiv
      </Button>
    )}
  </div>
)
