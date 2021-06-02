import {Narrow, Page, Wide} from '../components/scaffold/Page'
import {ettlevColors, theme} from '../util/theme'
import {Block} from 'baseui/block'
import {HeadingXLarge, HeadingXXLarge, ParagraphMedium} from 'baseui/typography'
import {PanelLinkCard} from '../components/common/PanelLink'
import {grafIconBg, paperPenIconBg, paragrafIconBg} from '../components/Images'
import {Card} from 'baseui/card'
import Button from '../components/common/Button'
import {faPlay} from '@fortawesome/free-solid-svg-icons'
import {borderRadius} from '../components/common/Style'


export const MainPageV2 = () => {
  const cardHeight = '340px'
  const cardWidth = '270px'

  return (
    <Page headerBackgroundColor={ettlevColors.green800} backgroundColor={ettlevColors.grey50}
          headerOverlap={'100px'}
          rawMain
          header={
            <HeadingXXLarge display={'flex'} flexDirection={'column'} color={ettlevColors.white}
                            marginTop={theme.sizing.scale1400}
                            marginBottom={theme.sizing.scale1400}
            >
              <span style={{fontWeight: 400}}>Støtte til etterlevelse av krav</span>
              <span>som sikrer rettssikkerheten til brukerne våre</span>
            </HeadingXXLarge>
          }>

      <Block display={'flex'} flexDirection={'column'} alignItems={'center'} width={'100%'}>

        <Wide>
          <Block display={'flex'} justifyContent={'space-evenly'}>

            <PanelLinkCard height={cardHeight} width={'32%'} maxWidth={cardWidth}
                           requireLogin
                           href={'/behandlinger'} tittel={'Dokumentere etterlevelse'} icon={paperPenIconBg}
                           beskrivelse={'Få oversikt over hvilke krav som gjelder din løsning og dokumenter hvor godt løsningen etterlever kravene.'}/>

            <PanelLinkCard height={cardHeight} width={'32%'} maxWidth={cardWidth}
                           href={'/status'} tittel={'Status i organisasjonen'} icon={grafIconBg}
                           beskrivelse={'Følg med på status i dashbord, lag egne oversikter, og se hvor godt NAV sine produktområder  dokumenterer på kravene'}/>

            <PanelLinkCard height={cardHeight} width={'32%'} maxWidth={cardWidth}
                           href={'/tema'} tittel={'Les kravene'} icon={paragrafIconBg}
                           beskrivelse={'Få oversikt over kravene, og bli trygg på at du kjenner til alle relevante krav for det du lager'}/>

          </Block>
        </Wide>

        <Narrow>
          <Block marginTop={theme.sizing.scale1600}>
            <Card overrides={{
              Root: {
                style: {
                  ...borderRadius('4px')
                }
              }
            }}>
              <Block
                $style={{
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: theme.sizing.scale4800,
                  paddingBottom: theme.sizing.scale4800,
                  backgroundColor: ettlevColors.grey100,
                }}>
                <Button icon={faPlay} kind={'secondary'}>Se video</Button>
              </Block>
            </Card>
          </Block>

          <Block marginTop={theme.sizing.scale1600}>
            <HeadingXLarge display={'flex'} flexDirection={'column'} color={ettlevColors.green800}>
              <span style={{fontWeight: 400}}>Her kan det stå</span>
              <span>litt tekst som beskriver animasjonsfilmen</span>
            </HeadingXLarge>

            <Block>
              <ParagraphMedium>
                Kjerneinnholdet / budskapet i filmen.
              </ParagraphMedium>

              <ParagraphMedium>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Gravida venenatis, a mattis ut tempor, proin aliquam aenean. Nec amet tincidunt ut odio habitant vel
                blandit et id. At in sed enim cursus nisi. A fermentum pellentesque nulla lacus viverra a, ultrices.
              </ParagraphMedium>
            </Block>
          </Block>
        </Narrow>

      </Block>
    </Page>
  )
}
