import * as React from 'react'
import { ettlevColors, maxPageWidth, theme } from '../util/theme'
import { HeadingXXLarge, Paragraph1 } from 'baseui/typography'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { Block } from 'baseui/block'
import { ExternalLink } from '../components/common/RouteLink'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'

export const FAQ = () => {
  ampli.logEvent('sidevisning', { side: 'FAQ side', sidetittel: 'Om Støtte til etterlevelse' })

  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Om Støtte til etterlevelse</title>
      </Helmet>
      <Block width="100%" display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <CustomizedBreadcrumbs currentPage="Om Støtte til etterlevelse" />
            <HeadingXXLarge marginTop="0">Om Støtte til etterlevelse</HeadingXXLarge>
          </Block>
        </Block>
      </Block>

      <Block display={'flex'} justifyContent="center" width="100%">
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800} maxWidth="600px">
            <Paragraph1 $style={{ fontSize: '22px', color: ettlevColors.green800 }}>
              På denne siden ønsker vi å gi teamene den informasjonen de trenger for å komme godt igang med etterlevelse.
            </Paragraph1>
            <Paragraph1 $style={{ fontSize: '22px', color: ettlevColors.green800 }}>
              Siden er under arbeid, og vi tar gjerne imot innspill på Slack <strong>#etterlevelse.</strong>
            </Paragraph1>
            <Paragraph1 $style={{ fontSize: '22px', color: ettlevColors.green800 }}>
              Inntil videre kan dere lese om{' '}
              <ExternalLink href={'https://navno.sharepoint.com/sites/fag-og-ytelser-informasjonsforvaltning/SitePages/Etterlevelseskrav-for-systemutvikling.aspx'}>
                Støtte til etterlevelse på Navet
              </ExternalLink>
              .
            </Paragraph1>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
