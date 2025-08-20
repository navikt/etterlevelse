import { tilbakemeldingEditMelding } from '@/api/krav/tilbakemelding/tilbakemeldingApi'
import {
  ITilbakemelding,
  ITilbakemeldingMelding,
} from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { Alert, Button, Textarea } from '@navikt/ds-react'
import { ChangeEvent, Dispatch, FunctionComponent, SetStateAction, useState } from 'react'

type TProps = {
  tilbakemeldingId: string
  melding: ITilbakemeldingMelding
  close: (tilbakemelding: ITilbakemelding) => void
  setEditModal: Dispatch<SetStateAction<boolean>>
}

export const TilbakemeldingEdit: FunctionComponent<TProps> = ({
  tilbakemeldingId,
  melding,
  close,
  setEditModal,
}) => {
  const [response, setResponse] = useState(melding.innhold)
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const submit = () => {
    setLoading(true)
    tilbakemeldingEditMelding({ tilbakemeldingId, meldingNr: melding.meldingNr, text: response })
      .then(close)
      .catch((error: any) => {
        setError(error.error)
        setLoading(false)
      })
  }

  return (
    <div className='items-end'>
      <Textarea
        label='Redigér melding'
        hideLabel
        minRows={15}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
          setResponse((event.target as HTMLTextAreaElement).value)
        }
        value={response}
        disabled={loading}
      />
      <div className='mt-2.5 flex justify-end'>
        <Button variant='secondary' onClick={() => setEditModal(false)}>
          Avbryt
        </Button>
        <Button className='ml-2.5' disabled={!response || loading} onClick={submit}>
          Lagre
        </Button>
      </div>
      {error && <Alert variant='error'>{error}</Alert>}
    </div>
  )
}
