import { Alert, Button, Textarea } from '@navikt/ds-react'
import { Dispatch, SetStateAction, useState } from 'react'
import { tilbakemeldingEditMelding } from '../../../../api/TilbakemeldingApi'
import { ITilbakemelding, ITilbakemeldingMelding } from '../../../../constants'

export const TilbakemeldingEdit = ({
  tilbakemeldingId,
  melding,
  close,
  setEditModal,
}: {
  tilbakemeldingId: string
  melding: ITilbakemeldingMelding
  close: (t: ITilbakemelding) => void
  setEditModal: Dispatch<SetStateAction<boolean>>
}) => {
  const [response, setResponse] = useState(melding.innhold)
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const submit = () => {
    setLoading(true)
    tilbakemeldingEditMelding({ tilbakemeldingId, meldingNr: melding.meldingNr, text: response })
      .then(close)
      .catch((e) => {
        setError(e.error)
        setLoading(false)
      })
  }

  return (
    <div className="items-end">
      <Textarea
        label="Rediger melding"
        hideLabel
        minRows={15}
        onChange={(e) => setResponse((e.target as HTMLTextAreaElement).value)}
        value={response}
        disabled={loading}
      />
      <div className="mt-2.5 flex justify-end">
        <Button variant="secondary" onClick={() => setEditModal(false)}>
          Avbryt
        </Button>
        <Button className="ml-2.5" disabled={!response || loading} onClick={submit}>
          Lagre
        </Button>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  )
}
export default TilbakemeldingEdit
