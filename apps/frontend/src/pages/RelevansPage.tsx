import { useParams } from 'react-router-dom'
import { Block } from 'baseui/block'
import React from 'react'
import { HeadingMedium, HeadingSmall, ParagraphMedium } from 'baseui/typography'
import { codelist, ListName } from '../services/Codelist'
import RouteLink from '../components/common/RouteLink'
import { theme } from '../util'
import { KravFilterTable } from '../components/common/KravFilterTable'
import { EtterlevelseDokumentasjonFilterTable } from '../components/common/EtterlevelseDokumentasjonFilterTable'
import { maxPageWidth, responsivePaddingSmall, responsiveWidthSmall } from '../util/theme'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'

export const RelevansPage = () => {
  const { relevans } = useParams<{ relevans: string }>()

  ampli.logEvent('sidevisning', { side: 'Relevans side', sidetittel: 'Admin side for relevans side' })

  if (!relevans) {
    return (
      <Block id="content" overrides={{ Block: { props: { role: 'main' } } }} maxWidth={maxPageWidth} width="100%">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Velg relevans</title>
        </Helmet>
        <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} width={responsiveWidthSmall} display="flex" justifyContent="center">
          <Block>
            <HeadingMedium>Velg relevans</HeadingMedium>
            <Block>
              {codelist.getCodes(ListName.RELEVANS).map((code) => (
                <Block key={code.code} marginBottom={theme.sizing.scale400}>
                  <RouteLink href={`/relevans/${code.code}`}>{code.shortName}</RouteLink>
                </Block>
              ))}
            </Block>
          </Block>
        </Block>
      </Block>
    )
  }

  const code = codelist.getCode(ListName.RELEVANS, relevans)
  return (
    <Block id="content" overrides={{ Block: { props: { role: 'main' } } }} maxWidth={maxPageWidth} width="100%">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{code?.shortName} </title>
      </Helmet>
      <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} width={responsiveWidthSmall} display="flex" justifyContent="center">
        <Block>
          <HeadingMedium>Relevans: {code?.shortName}</HeadingMedium>
          <ParagraphMedium>{code?.description}</ParagraphMedium>

          <Block marginTop={theme.sizing.scale1200}>
            <HeadingSmall marginBottom={theme.sizing.scale200}>Krav</HeadingSmall>
            <KravFilterTable filter={{ relevans: [relevans] }} />
          </Block>

          <Block marginTop={theme.sizing.scale1200}>
            <HeadingSmall marginBottom={theme.sizing.scale200}>Behandlinger</HeadingSmall>
            <EtterlevelseDokumentasjonFilterTable filter={{ relevans: [relevans] }} />
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
