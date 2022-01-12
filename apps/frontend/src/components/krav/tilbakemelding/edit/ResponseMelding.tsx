import {Block} from 'baseui/block'
import {LabelSmall, ParagraphMedium, ParagraphSmall} from 'baseui/typography'
import moment from 'moment'
import {Tilbakemelding, TilbakemeldingMelding, TilbakemeldingRolle} from '../../../../constants'
import {theme} from '../../../../util'
import {ettlevColors} from '../../../../util/theme'
import {PersonName} from '../../../common/PersonName'
import {Portrait} from '../../../common/Portrait'
import EndretInfo from './EndreInfo'
import MeldingKnapper from './MeldingKnapper'

export const ResponseMelding = (props: {
  m: TilbakemeldingMelding
  tilbakemelding: Tilbakemelding
  oppdater: (t: Tilbakemelding) => void
  remove: (t: Tilbakemelding) => void
}) => {
  const { m, tilbakemelding, oppdater, remove } = props
  const melder = m.rolle === TilbakemeldingRolle.MELDER
  const sisteMelding = m.meldingNr === tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1].meldingNr

  return (
    <Block
      display={'flex'}
      flexDirection={'column'}
      marginBottom={theme.sizing.scale600}
      backgroundColor={melder ? 'inherit' : ettlevColors.grey50}
      padding={"8px"}
    >
      <Block display="flex" width="100%">
        <Portrait ident={m.fraIdent} />
        <Block display="flex" flexDirection="column" marginLeft={theme.sizing.scale400} width="100%">
          <Block display="flex" width="100%">
            <Block display="flex" alignItems="center" width="100%">
              <LabelSmall>{melder ? <PersonName ident={m.fraIdent} /> : 'Kraveier'}</LabelSmall>
              <ParagraphSmall marginTop={0} marginBottom={0} marginLeft="24px" $style={{ fontSize: '14px' }}>
                Sendt: {moment(m.tid).format('lll')}
              </ParagraphSmall>
            </Block>
          </Block>
          <Block display="flex" width="100%">
            <ParagraphMedium marginBottom={0} marginRight="29px" marginTop="4px">
              {m.innhold}
            </ParagraphMedium>
          </Block>
        </Block>
      </Block>
      <Block display="flex" width="100%" alignItems="center" marginTop="17px" paddingLeft={theme.sizing.scale1200}>
        {sisteMelding && <MeldingKnapper melding={m} tilbakemeldingId={tilbakemelding.id} oppdater={oppdater} remove={remove} />}
        <EndretInfo melding={m} />
      </Block>
    </Block>
  )
}
export default ResponseMelding
