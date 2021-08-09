import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { Block } from 'baseui/block'
import { theme } from '../util'
import { Paragraph1 } from 'baseui/typography'
import { intl } from '../util/intl/intl'
import notFound from '../resources/notfound.svg'
import { maxPageWidth } from '../util/theme'

const NotFound = () => {
  const location = useLocation()
  return (
    <Block id="content" overrides={{ Block: { props: { role: 'main' } } }} maxWidth={maxPageWidth} width="100%">
      <Block paddingLeft="40px" paddingRight="40px" width="calc(100%-80px)" display="flex" justifyContent="center" alignContent="center" marginTop={theme.sizing.scale2400}>
        <Paragraph1>
          {intl.pageNotFound} - {location.pathname}
        </Paragraph1>
        <img src={notFound} alt={intl.pageNotFound} style={{ maxWidth: '65%' }} />
      </Block>
    </Block>
  )
}

export default NotFound
