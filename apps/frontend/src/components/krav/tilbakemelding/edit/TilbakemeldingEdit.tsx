import { Block } from 'baseui/block'
import Button from '../../../common/Button'
import { useState } from 'react'
import { tilbakemeldingEditMelding } from '../../../../api/TilbakemeldingApi'
import { Tilbakemelding, TilbakemeldingMelding } from '../../../../constants'
import CustomizedTextarea from '../../../common/CustomizedTextarea'
import { Notification } from 'baseui/notification'

export const TilbakemeldingEdit = ({ tilbakemeldingId, melding, close }: { tilbakemeldingId: string; melding: TilbakemeldingMelding; close: (t: Tilbakemelding) => void }) => {
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
    <Block display="flex" alignItems="flex-end">
      <CustomizedTextarea rows={15} onChange={(e) => setResponse((e.target as HTMLTextAreaElement).value)} value={response} disabled={loading} />
      <Button size="compact" marginLeft disabled={!response || loading} onClick={submit}>
        Lagre
      </Button>
      {error && (
        <Notification kind="negative" overrides={{ Body: { style: { marginBottom: '-25px' } } }}>
          {error}
        </Notification>
      )}
    </Block>
  )
}
export default TilbakemeldingEdit
