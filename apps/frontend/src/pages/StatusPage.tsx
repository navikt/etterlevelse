import * as React from 'react'
import { maxPageWidth, theme } from '../util/theme'
import { HeadingXXLarge, Paragraph1 } from 'baseui/typography'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { Block } from 'baseui/block'
import { Helmet } from 'react-helmet'

export const StatusPage = () => {
  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Status i organisasjonen</title>
      </Helmet>
      <Block width="100%" display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <CustomizedBreadcrumbs currentPage="Status i organisasjonene" />
            <HeadingXXLarge marginTop="0">Status i organisasjonen</HeadingXXLarge>
          </Block>
        </Block>
      </Block>

      <Block display={'flex'} justifyContent="center" width="100%">
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <Paragraph1>
              Vi jobber med å få på plass nyttig statistikk og oversikter over etterlevels Har du innspill hører vi gjerne fra deg på <strong>#etterlevelse</strong>.
            </Paragraph1>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
