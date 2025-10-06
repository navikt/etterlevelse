import PersonNavn from '@/components/common/personNavn/personNavn'
import { ITilbakemelding } from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { BodyShort, Label } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'

type TProps = {
  tilbakemelding: ITilbakemelding
}

export const KravTilbakemeldingBruker: FunctionComponent<TProps> = ({ tilbakemelding }) => (
  <div className='flex w-full items-center'>
    <Label>
      <PersonNavn ident={tilbakemelding.melderIdent} />
    </Label>
    <div className='flex ml-6'>
      <BodyShort>Sendt: {moment(tilbakemelding.meldinger[0].tid).format('LLL')}</BodyShort>
      <BodyShort className='ml-3.5'>
        Kravversjon: K{tilbakemelding.kravNummer}.{tilbakemelding.kravVersjon}
      </BodyShort>
    </div>
  </div>
)
