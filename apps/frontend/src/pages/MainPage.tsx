import { Narrow, Page, Wide } from '../components/scaffold/Page'
import { ettlevColors, theme } from '../util/theme'
import { Block } from 'baseui/block'
import { HeadingXXLarge } from 'baseui/typography'
import { borderColor, borderStyle, borderWidth, paddingAll } from '../components/common/Style'
import { useEffect, useState } from 'react'
import { Markdown } from '../components/common/Markdown'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../constants'
import { getMeldingByType } from '../api/MeldingApi'
import { ampli } from '../services/Amplitude'
import { TemaListe } from './TemaPage'

export const MainPage = () => {
  const [forsideVarsel, setForsideVarsle] = useState<Melding>()

  useEffect(() => {
    ;(async () => {
      await getMeldingByType(MeldingType.FORSIDE).then((r) => {
        if (r.numberOfElements > 0) {
          setForsideVarsle(r.content[0])
        }
      })
    })()
  }, [])

  ampli.logEvent('sidevisning', { side: 'Hovedside' })

  return (
    <Page
      hideBackBtn
      headerBackgroundColor={ettlevColors.lysBla}
      backgroundColor={ettlevColors.grey50}
      headerOverlap={'100px'}
      rawMain
      header={
        <HeadingXXLarge display={'flex'} flexDirection={'column'} marginTop={theme.sizing.scale1400} marginBottom={theme.sizing.scale1400}>
          <span style={{ fontWeight: 400 }}>Støtte til etterlevelse</span>
          <span>som ivaretar rettssikkerheten til brukerne våre</span>
        </HeadingXXLarge>
      }
    >
      <Block display={'flex'} flexDirection={'column'} alignItems={'center'} width={'100%'}>
        <Wide>
          <div>
            <TemaListe />
          </div>
        </Wide>

        <Narrow>
          <Block $style={{}} marginTop={theme.sizing.scale1600} marginBottom={theme.sizing.scale900} id={'forsideVarselMelding'}>
            {forsideVarsel && forsideVarsel.meldingStatus === MeldingStatus.ACTIVE && (
              <Block
                $style={{
                  ...borderWidth('1px'),
                  ...borderStyle('solid'),
                  ...borderColor(forsideVarsel.alertType === AlertType.INFO ? ettlevColors.navDypBla : ettlevColors.navOransje),
                  backgroundColor: forsideVarsel.alertType === AlertType.INFO ? ettlevColors.navLysBla : ettlevColors.warning50,
                  ...paddingAll('32px'),
                  marginBottom: '64px',
                }}
              >
                <Markdown source={forsideVarsel.melding} />
              </Block>
            )}
          </Block>
        </Narrow>
      </Block>
    </Page>
  )
}
