import { useParams } from 'react-router-dom'
import { Block } from 'baseui/block'
import React from 'react'
import { HeadingMedium, HeadingSmall, ParagraphMedium } from 'baseui/typography'
import { codelist, ListName } from '../services/Codelist'
import RouteLink from '../components/common/RouteLink'
import { theme } from '../util'
import { KravFilterTable } from '../components/common/KravFilterTable'
import { maxPageWidth, responsivePaddingSmall, responsiveWidthSmall } from '../util/theme'
import { Helmet } from 'react-helmet'

export const UnderavdelingPage = () => {
  const { underavdeling } = useParams<{ underavdeling: string }>()

  if (!underavdeling) {
    return (
      <Block maxWidth={maxPageWidth} width="100%">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Velg underavdeling</title>
        </Helmet>
        <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} width={responsiveWidthSmall} display="flex" justifyContent="center">
          <Block>
            <HeadingMedium>Velg underavdeling</HeadingMedium>
            <Block>
              {codelist.getCodes(ListName.UNDERAVDELING).map((code) => (
                <Block key={code.code} marginBottom={theme.sizing.scale400}>
                  <RouteLink href={`/underavdeling/${code.code}`}>{code.shortName}</RouteLink>
                </Block>
              ))}
            </Block>
          </Block>
        </Block>
      </Block>
    )
  }

  const code = codelist.getCode(ListName.UNDERAVDELING, underavdeling)
  return (
    <Block id="content" overrides={{ Block: { props: { role: 'main' } } }} maxWidth={maxPageWidth} width="100%">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{code?.shortName ? code?.shortName : ''} </title>
      </Helmet>
      <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} width={responsiveWidthSmall} display="flex" justifyContent="center">
        <Block>
          <HeadingMedium>Underavdeling: {code?.shortName}</HeadingMedium>
          <ParagraphMedium>{code?.description}</ParagraphMedium>

          <Block marginTop={theme.sizing.scale1200}>
            <Block>
              <HeadingSmall marginBottom={theme.sizing.scale200}>Krav</HeadingSmall>
              <KravFilterTable filter={{ underavdeling }} exclude={['underavdeling']} />
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
