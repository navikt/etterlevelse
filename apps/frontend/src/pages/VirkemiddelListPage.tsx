import { Block } from 'baseui/block'
import { HeadingXXLarge } from 'baseui/typography'
import React from 'react'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { user } from '../services/User'
import { theme } from '../util'
import { ettlevColors, maxPageWidth, responsivePaddingLarge } from '../util/theme'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import { AllVirkemiddel } from '../components/virkemiddelList/AllVirkemiddel'
import { EditVirkemiddelModal } from '../components/virkemiddel/edit/EditVirkemiddelModal'

export const VirkemiddelListPage = () => {
  ampli.logEvent('sidevisning', { side: 'Kraveier side', sidetittel: 'Forvalte og opprette virkemiddel' })

  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Forvalte og opprette virkemiddel</title>
      </Helmet>
      <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge} paddingTop={theme.sizing.scale800}>
            <CustomizedBreadcrumbs currentPage="Forvalte og opprette virkemiddel" />
            <Block display="flex">
              <Block flex="1">
                <HeadingXXLarge marginTop="0">Forvalte og opprette virkemiddel</HeadingXXLarge>
              </Block>
              <Block display="flex" justifyContent="flex-end">
                {user.isKraveier() && <EditVirkemiddelModal />}
              </Block>
            </Block>
          </Block>
        </Block>
      </Block>

      <Block display={'flex'} justifyContent="center" width="100%">
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge} paddingTop={theme.sizing.scale800}>
            <AllVirkemiddel />
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
