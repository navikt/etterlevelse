import * as React from 'react'
import {useEffect, useState} from 'react'
import {ettlevColors, maxPageWidth, responsivePaddingLarge, responsiveWidthLarge, theme} from '../util/theme'
import {HeadingXLarge, HeadingXXLarge, ParagraphLarge, ParagraphSmall} from 'baseui/typography'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import {Block} from 'baseui/block'
import {Helmet} from 'react-helmet'
import {ampli} from '../services/Amplitude'
import {Melding, MeldingType} from '../constants'
import {getMeldingByType, mapMeldingToFormValue} from '../api/MeldingApi'
import {Markdown} from '../components/common/Markdown'
import moment from 'moment'
import {user} from '../services/User'

export const FAQ = () => {
  const [isLoading, setLoading] = useState<boolean>(false)
  const [melding, setMelding] = useState<Melding>()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const response = await getMeldingByType(MeldingType.OM_ETTERLEVELSE)
      if (response.numberOfElements > 0) {
        setMelding(response.content[0])
      } else {
        setMelding(mapMeldingToFormValue({ meldingType: MeldingType.OM_ETTERLEVELSE }))
      }
      setLoading(false)
    })()
  }, [])

  ampli.logEvent('sidevisning', { side: 'FAQ side', sidetittel: 'Om Støtte til etterlevelse' })

  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Om Støtte til etterlevelse</title>
      </Helmet>
      <Block width="100%" display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width={responsiveWidthLarge} paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge}>
          <Block paddingTop={theme.sizing.scale800}>
            <CustomizedBreadcrumbs currentPage="Om Støtte til etterlevelse" />
          </Block>
        </Block>
      </Block>

      <Block display={'flex'} justifyContent="center" width="100%">
        <Block
          maxWidth={maxPageWidth}
          width={responsiveWidthLarge}
          display="flex"
          justifyContent="center"
          paddingLeft={responsivePaddingLarge}
          paddingRight={responsivePaddingLarge}
        >
          <Block maxWidth="600px">
            <HeadingXXLarge marginTop="54px" marginBottom="32px">
              Om Støtte til etterlevelse
            </HeadingXXLarge>

            <ParagraphLarge marginTop="0px" $style={{ fontSize: '22px', color: ettlevColors.green800 }}>
              {melding?.melding}
            </ParagraphLarge>
            <HeadingXLarge marginTop="56px" marginBottom="24px">
              {melding?.secondaryTittel}
            </HeadingXLarge>
            <Markdown source={melding?.secondaryMelding} p1 fontSize="18px" />

            {/*<ParagraphLarge $style={{ fontSize: '22px', color: ettlevColors.green800 }}>*/}
            {/*  Siden er under arbeid, og vi tar gjerne imot innspill på Slack <strong>#etterlevelse.</strong>*/}
            {/*</ParagraphLarge>*/}
            {/*<ParagraphLarge $style={{ fontSize: '22px', color: ettlevColors.green800 }}>*/}
            {/*  Inntil videre kan dere lese om{' '}*/}
            {/*  <ExternalLink href={'https://navno.sharepoint.com/sites/fag-og-ytelser-informasjonsforvaltning/SitePages/Etterlevelseskrav-for-systemutvikling.aspx'}>*/}
            {/*    Støtte til etterlevelse på Navet*/}
            {/*  </ExternalLink>*/}
            {/*  .*/}
            {/*</ParagraphLarge>*/}

            <Block marginTop="88px">
              {user.isAdmin() && melding && (
                <ParagraphSmall>
                  Sist endret: {moment(melding.changeStamp.lastModifiedDate).format('ll')} av {melding.changeStamp.lastModifiedBy.split('-')[1]}
                </ParagraphSmall>
              )}
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
