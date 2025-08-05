import PersonNavn from '@/components/common/personNavn/personNavn'
import { ITilbakemeldingMelding } from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'

type TProps = { melding: ITilbakemeldingMelding }

export const EndretInfo: FunctionComponent<TProps> = (props) => {
  const { melding } = props

  if (!melding.endretAvIdent) return null

  return (
    <div className='justify-end flex w-full'>
      <BodyShort className='flex'>
        Sist endret av
        <div className='mx-1'>
          <PersonNavn ident={melding.endretAvIdent} />
        </div>
        - {moment(melding.endretTid).format('LLL')}
      </BodyShort>
    </div>
  )
}
export default EndretInfo
