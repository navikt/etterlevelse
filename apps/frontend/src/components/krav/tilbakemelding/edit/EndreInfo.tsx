import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { ITilbakemeldingMelding } from '../../../../constants'
import { PersonName } from '../../../common/PersonName'

export const EndretInfo = (props: { melding: ITilbakemeldingMelding }) => {
  if (!props.melding.endretAvIdent) return null
  return (
    <div className="justify-end flex w-full">
      <BodyShort className="flex">
        Sist endret av
        <div className="mx-1">
          <PersonName ident={props.melding.endretAvIdent} />
        </div>
        - {moment(props.melding.endretTid).format('lll')}
      </BodyShort>
    </div>
  )
}
export default EndretInfo
