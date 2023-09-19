import { Behandling } from '../../../constants'
import { ReactNode } from 'react'
import { Block, Responsive } from 'baseui/block'
import { Helmet } from 'react-helmet'
import { HeadingXXLarge, LabelSmall } from 'baseui/typography'
import { ettlevColors } from '../../../util/theme'
import { Teams } from '../../common/TeamName'
import { ExternalButton } from '../../common/Button'
import { env } from '../../../util/env'
import { ExternalLinkWrapper } from '../../common/RouteLink'

export const responsiveDisplayBehandlingPage: Responsive<any> = ['block', 'block', 'block', 'block', 'flex', 'flex']

export const getMainHeader = (behandling: Behandling, helmet?: ReactNode) => (
  <Block display={responsiveDisplayBehandlingPage} justifyContent="space-between" marginBottom="32px" marginTop="38px">
    {helmet ? (
      helmet
    ) : (
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          B{behandling.nummer.toString()} {behandling.navn.toString()}
        </title>
      </Helmet>
    )}
    <Block width="100%">
      <LabelSmall color={ettlevColors.green600}>
        B{behandling.nummer} {behandling.overordnetFormaal.shortName}
      </LabelSmall>
      <HeadingXXLarge marginTop="0" color={ettlevColors.green800}>
        {behandling.navn}
      </HeadingXXLarge>
      <Block display="flex" alignItems="center" width="100%" marginTop={'24px'}>
        <Block display={'flex'} width="100%">
          <LabelSmall $style={{ lineHeight: '22px', marginRight: '10px', fontSize: '16px', color: ettlevColors.green600 }}>Team: </LabelSmall>
          <Teams teams={behandling.teams} link fontColor={ettlevColors.green800} style={{ fontSize: '16px', lineHeight: '22px', fontWeight: 400 }} />
        </Block>
        <Block display="flex" justifyContent="flex-end" alignContent="center" $style={{ whiteSpace: 'nowrap' }}>
          <ExternalButton kind={'secondary'} href={`${env.pollyBaseUrl}process/${behandling.id}`} size="mini">
            Til behandlingskatalogen
          </ExternalButton>
        </Block>
      </Block>
    </Block>
  </Block>
)

export const getNewestKravVersjon = (list: any[]) => {
  let relevanteStatusListe = [...list]

  relevanteStatusListe = relevanteStatusListe.filter((value, index, self) => index === self.findIndex((k) => k.kravNummer === value.kravNummer))

  return relevanteStatusListe
}
