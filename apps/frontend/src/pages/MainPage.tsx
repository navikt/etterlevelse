import { Narrow, Page, Wide } from '../components/scaffold/Page'
import { ettlevColors, theme } from '../util/theme'
import { Block } from 'baseui/block'
import { HeadingXLarge, HeadingXXLarge, ParagraphMedium } from 'baseui/typography'
import { PanelLink, PanelLinkCard } from '../components/common/PanelLink'
import { grafIconBg, grafIconBgSmall, handWithLeaf, paperPenIconBg, paperPenIconBgSmall, paragrafIconBg, paragrafIconBgSmall } from '../components/Images'
import { Card } from 'baseui/card'
import { borderColor, borderRadius, borderStyle, borderWidth, margin, paddingAll } from '../components/common/Style'
import ReactPlayer from 'react-player'
import { Button, SIZE } from 'baseui/button'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { buttonBorderStyle, buttonContentStyle } from '../components/common/Button'
import React, { useEffect, useState } from 'react'
import { Markdown } from '../components/common/Markdown'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../constants'
import { getMeldingByType } from '../api/MeldingApi'
import { ampli } from '../services/Amplitude'
import { getPageWidth } from '../util/pageWidth'

const cardWidth = ['95%', '95%', '95%', '95%', '31%', '31%']
const cardHeight = ['auto', 'auto', 'auto', 'auto', '140px', '140px']
const cardMarginRight = ['none', 'none', 'none', 'none', theme.sizing.scale800, theme.sizing.scale800]

export const MainPage = () => {
  const [forsideVarsel, setForsideVarsle] = useState<Melding>()
  const [pageWidth, setPageWidth] = useState<number>()

  useEffect(() => {
    ;(async () => {
      await getMeldingByType(MeldingType.FORSIDE).then((r) => {
        if (r.numberOfElements > 0) {
          setForsideVarsle(r.content[0])
        }
      })
    })()
  }, [])

  useEffect(() => {
    const reportWindowSize = () => {
      setPageWidth(getPageWidth())
    }
    window.onload = reportWindowSize
    window.onresize = reportWindowSize
  })

  ampli.logEvent('sidevisning', { side: 'Hovedside' })

  return (
    <Page
      hideBackBtn
      headerBackgroundColor={ettlevColors.lysBla}
      backgroundColor={ettlevColors.grey50}
      headerOverlap={'100px'}
      rawMain
      header={
        <HeadingXXLarge display={'flex'} flexDirection={'column'} color={ettlevColors.white} marginTop={theme.sizing.scale1400} marginBottom={theme.sizing.scale1400}>
          <span style={{ fontWeight: 400 }}>Støtte til etterlevelse</span>
          <span>som ivaretar rettssikkerheten til brukerne våre</span>
        </HeadingXXLarge>
      }
    >
      <Block display={'flex'} flexDirection={'column'} alignItems={'center'} width={'100%'}>
        <Wide>
          <div className="flex gap-2 justify-center">
            <PanelLinkCard
              marginRight={cardMarginRight}
              height={cardHeight}
              width={cardWidth}
              verticalMargin={theme.sizing.scale300}
              onClick={() => {
                ampli.logEvent('navigere', { kilde: 'forside-panel', app: 'etterlevelse', til: '/tema', fra: '/' })
              }}
              href={'/tema'}
              tittel={'Forstå kravene'}
              icon={pageWidth && pageWidth >= 768 ? paragrafIconBg : paragrafIconBgSmall}
              beskrivelse={'Få oversikt over krav til etterlevelse, og bli trygg på at du kjenner til alle relevante krav for det du lager'}
            />

            <PanelLinkCard
              marginRight={cardMarginRight}
              height={cardHeight}
              width={cardWidth}
              verticalMargin={theme.sizing.scale300}
              requireLogin
              href={'/dokumentasjoner'}
              onClick={() => {
                ampli.logEvent('navigere', { kilde: 'forside-panel', app: 'etterlevelse', til: '/dokumentasjoner', fra: '/' })
              }}
              tittel={'Dokumentere etterlevelse'}
              icon={pageWidth && pageWidth >= 768 ? paperPenIconBg : paperPenIconBgSmall}
              beskrivelse={'Se hvilke krav som gjelder din løsning og dokumenter hvordan løsningen etterlever kravene'}
            />

            <PanelLinkCard
              height={cardHeight}
              width={cardWidth}
              verticalMargin={theme.sizing.scale300}
              href={'https://metabase.intern.nav.no/dashboard/116-dashboard-for-etterlevelse'}
              onClick={() => {
                ampli.logEvent('navigere', {
                  kilde: 'forside-panel',
                  app: 'etterlevelse',
                  til: 'https://metabase.intern.nav.no/dashboard/117-dashboard-for-etterlevelse',
                  fra: '/',
                })
              }}
              tittel={'Status i organisasjonen'}
              icon={pageWidth && pageWidth >= 768 ? grafIconBg : grafIconBgSmall}
              beskrivelse={'Følg med på status og se hvor godt NAV sine områder dokumenterer på kravene'}
              openinnewtab
            />
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
            <HeadingXLarge $style={{ fontWeight: 300, fontSize: '32px', lineHeight: '42px' }} marginTop="0px" marginBottom="0px">
              Etterlevelseskravene er
            </HeadingXLarge>
            <HeadingXLarge $style={{ wordBreak: 'break-word', fontSize: '32px', lineHeight: '42px' }} marginTop="0px" marginBottom="0px">
              basert på norske lover og regler
            </HeadingXLarge>
            <ParagraphMedium $style={{ maxWidth: '600px', width: '100%' }}>
              Hvorfor er etterlevelse viktig, og hvordan bør vi jobbe med kravene? Se filmen om etterlevelse og få en introduksjon på under 2 minutter
            </ParagraphMedium>
          </Block>

          <Card
            overrides={{
              Root: {
                style: {
                  ...borderRadius('4px'),
                  marginTop: '0px',
                },
              },
            }}
          >
            <Block
              $style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <ReactPlayer
                controls={true}
                playing={true}
                playIcon={
                  <Button
                    onClick={() => {
                      ampli.logEvent('klikk', { title: 'Etterlevelse video spilt', type: 'Se film knapp' })
                    }}
                    kind="secondary"
                    size={SIZE.compact}
                    style={buttonBorderStyle}
                    startEnhancer={<FontAwesomeIcon icon={faPlay} />}
                    overrides={{
                      BaseButton: {
                        style: {
                          ...buttonContentStyle,
                        },
                      },
                    }}
                  >
                    {' '}
                    Se film{' '}
                  </Button>
                }
                width="100%"
                height="414px"
                url="videos/EtterlevelseskravMedTeksting.mp4"
                light={'img/EtterlevelseVideoDark.png'}
              />
            </Block>
          </Card>

          <Block
            $style={{
              ...margin(theme.sizing.scale800, '0'),
              border: `1px solid ${ettlevColors.grey100}`,
              borderRadius: '4px',
              backgroundColor: ettlevColors.white,
            }}
          >
            <PanelLink
              href="/omstottetiletterlevelse"
              title={
                <HeadingXLarge marginBottom={0} marginTop={0}>
                  Mer om etterlevelse i NAV
                </HeadingXLarge>
              }
              panelIcon={<img src={handWithLeaf} alt={''} width="47px" height="47px" />}
              overrides={{
                Block: {
                  style: {
                    width: 'calc(100% - 24px)',
                    maxWidth: '820px',
                    ':hover': {
                      boxSizing: 'content-box',
                    },
                  },
                },
              }}
            />
          </Block>
        </Narrow>
      </Block>
    </Page>
  )
}
