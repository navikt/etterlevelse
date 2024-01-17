import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Block } from 'baseui/block'
import { HeadingXLarge, ParagraphSmall } from 'baseui/typography'
import { TEtterlevelseDokumentasjonQL } from '../../../constants'
import {
  EtterlevelseDokumentasjonerPanels,
  TCustomTeamObject,
  tabMarginBottom,
} from '../../../pages/MyEtterlevelseDokumentasjonerPage'
import { theme } from '../../../util'
import { env } from '../../../util/env'
import { ettlevColors } from '../../../util/theme'
import { bamseIcon } from '../../Images'
import { ExternalButton } from '../../common/Button'
import { InfoBlock2 } from '../../common/InfoBlock'

export const MineEtterlevelseDokumentasjoner = ({
  etterlevelseDokumentasjoner,
  teams,
  loading,
}: {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
  teams: TCustomTeamObject[]
  loading: boolean
}) => {
  if (loading)
    return (
      <>
        <EtterlevelseDokumentasjonerPanels etterlevelseDokumentasjoner={[]} loading />
        <Block height={'60px'} />
        <EtterlevelseDokumentasjonerPanels etterlevelseDokumentasjoner={[]} loading />
      </>
    )
  return (
    <Block marginBottom={tabMarginBottom}>
      {!etterlevelseDokumentasjoner.length && !teams.length && (
        <ParagraphSmall>Du er ikke medlem av team med registrerte dokumentasjoner</ParagraphSmall>
      )}

      {teams.map((t) => {
        const teamDokumentasjoner = etterlevelseDokumentasjoner
          .filter((e) => e.teamsData?.find((t2) => t2.id === t.id))
          .filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (etterlevelseDokumentasjon) => etterlevelseDokumentasjon.id === value.id
              )
          )
        return (
          <Block key={t.id} marginBottom={theme.sizing.scale900}>
            <Block display={'flex'} justifyContent={'space-between'}>
              <Block>
                <HeadingXLarge marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
                  {t.name}
                </HeadingXLarge>
                <ParagraphSmall marginTop={0}>
                  Teamet skal etterleve krav i{' '}
                  <span style={{ fontWeight: 700 }}>
                    {teamDokumentasjoner.length} dokumentasjoner
                  </span>
                </ParagraphSmall>
              </Block>
              {/* <Block alignSelf={'flex-end'} marginBottom={theme.sizing.scale400}>
                  <ExternalButton href={`${env.pollyBaseUrl}process/team/${t.id}`} underlineHover size={'mini'}>
                    Legg til behandling <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </ExternalButton>
                </Block> */}
            </Block>

            <EtterlevelseDokumentasjonerPanels etterlevelseDokumentasjoner={teamDokumentasjoner} />
          </Block>
        )
      })}

      <Block maxWidth={'800px'} marginTop={'200px'}>
        <InfoBlock2
          icon={bamseIcon}
          alt={'Bamseikon'}
          title={'Savner du teamet ditt?'}
          beskrivelse={
            'Legg til teamet i teamkatalogen, så henter vi dokumentasjoner som skal etterleve krav'
          }
          backgroundColor={ettlevColors.grey25}
        >
          <Block marginTop={theme.sizing.scale600}>
            <ExternalButton href={`${env.teamKatBaseUrl}`}>
              Teamkatalogen <FontAwesomeIcon icon={faExternalLinkAlt} />
            </ExternalButton>
          </Block>
        </InfoBlock2>
      </Block>
    </Block>
  )
}
