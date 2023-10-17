import { Block } from 'baseui/block'
import Button from '../../../common/Button'
import { Dispatch, SetStateAction, useState } from 'react'
import { tilbakemeldingEditMelding } from '../../../../api/TilbakemeldingApi'
import { Tilbakemelding, TilbakemeldingMelding } from '../../../../constants'
import CustomizedTextarea from '../../../common/CustomizedTextarea'
import { Notification } from 'baseui/notification'
import { theme } from '../../../../util'

export const TilbakemeldingEdit = ({
  tilbakemeldingId,
  melding,
  close,
  setEditModal,
}: {
  tilbakemeldingId: string
  melding: TilbakemeldingMelding
  close: (t: Tilbakemelding) => void
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
    <Block alignItems="flex-end">
      <CustomizedTextarea rows={15} onChange={(e) => setResponse((e.target as HTMLTextAreaElement).value)} value={response} disabled={loading} />
      <Block marginTop={theme.sizing.scale400} display="flex" justifyContent={'flex-end'}>
        <Button kind={'secondary'} size={'compact'} onClick={() => setEditModal(false)}>
          Avbryt
        </Button>
        <Button marginLeft size="compact" disabled={!response || loading} onClick={submit}>
          Lagre
        </Button>
      </Block>
      {error && (
        <Notification kind="negative" overrides={{ Body: { style: { marginBottom: '-25px' } } }}>
          {error}
        </Notification>
      )}
    </Block>
  )
}
export default TilbakemeldingEdit
