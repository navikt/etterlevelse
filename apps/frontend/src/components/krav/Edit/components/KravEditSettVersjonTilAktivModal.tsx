import { Button, Modal } from '@navikt/ds-react'
import { getKravByKravNumberAndVersion } from '../../../../api/KravApi'
import { EKravStatus, IKrav, TKravQL } from '../../../../constants'

interface IPropsKravEditSettVersjonTilAktivModal {
  aktivKravMessage: boolean
  setAktivKravMessage: (value: React.SetStateAction<boolean>) => void
  krav: TKravQL
  updateKrav(krav: TKravQL): Promise<IKrav>
  kravMapToFormVal(krav: Partial<TKravQL>): TKravQL
  values: TKravQL
  submitForm: () => Promise<void>
}

export const KravEditSettVersjonTilAktivModal = ({
  aktivKravMessage,
  setAktivKravMessage,
  krav,
  updateKrav,
  kravMapToFormVal,
  values,
  submitForm,
}: IPropsKravEditSettVersjonTilAktivModal) => (
  <Modal
    header={{
      closeButton: false,
      heading: 'Sikker på at du vil sette versjonen til aktiv?',
    }}
    open={aktivKravMessage}
    onClose={() => setAktivKravMessage(false)}
  >
    <Modal.Body>Kravet har en nyere versjon som settes til utkast</Modal.Body>
    <Modal.Footer>
      <Button
        type="button"
        variant="primary"
        onClick={async () => {
          const newVersionOfKrav = await getKravByKravNumberAndVersion(
            krav.kravNummer,
            krav.kravVersjon + 1
          )
          if (newVersionOfKrav) {
            updateKrav(
              kravMapToFormVal({
                ...newVersionOfKrav,
                status: EKravStatus.UTKAST,
              }) as TKravQL
            ).then(() => {
              values.status = EKravStatus.AKTIV
              submitForm()
              setAktivKravMessage(false)
            })
          } else {
            values.status = EKravStatus.AKTIV
            submitForm()
            setAktivKravMessage(false)
          }
        }}
      >
        Ja, sett til aktiv
      </Button>
      <Button type="button" variant="secondary" onClick={() => setAktivKravMessage(false)}>
        Nei, avbryt handlingen
      </Button>
    </Modal.Footer>
  </Modal>
)
