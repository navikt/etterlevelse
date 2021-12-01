import * as React from 'react'
import {maxPageWidth, theme} from '../util/theme'
import {HeadingXXLarge, Paragraph1} from 'baseui/typography'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import {Block} from 'baseui/block'
import {ExternalLink} from "../components/common/RouteLink";

export const FAQ = () => {
  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Block width="100%" display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <CustomizedBreadcrumbs currentPage="Status i organisasjonene" />
            <HeadingXXLarge marginTop="0">Om Etterlevelse</HeadingXXLarge>
          </Block>
        </Block>
      </Block>

      <Block display={'flex'} justifyContent="center" width="100%">
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <Paragraph1>
              <ExternalLink href={'https://navno.sharepoint.com/sites/fag-og-ytelser-informasjonsforvaltning/SitePages/Etterlevelseskrav-for-systemutvikling.aspx'}>
                Hjelp
              </ExternalLink>
            </Paragraph1>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
