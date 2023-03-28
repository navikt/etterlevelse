import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Block } from 'baseui/block'
import { theme } from '../util'
import { HeadingXXLarge } from 'baseui/typography'
import { intl } from '../util/intl/intl'
import notFound from '../resources/notfound.svg'
import { maxPageWidth } from '../util/theme'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import { user } from '../services/User'

const Forbidden = () => {
  const navigate = useNavigate()

  setTimeout(() => {
    if (user.isLoggedIn()) {
      navigate(-1)
    }
  }, 1)

  ampli.logEvent('sidevisning', { side: 'Forbidden', sidetittel: '403 forbidden' })

  return (
    <Block id="content" overrides={{ Block: { props: { role: 'main' } } }} maxWidth={maxPageWidth} width="100%">
      <Helmet>
        <meta charSet="utf-8" />
        <title>403 forbidden</title>
      </Helmet>
      <Block paddingLeft="40px" paddingRight="40px" width="calc(100%-80px)" display="flex" justifyContent="center" alignContent="center" marginTop={theme.sizing.scale2400}>
        <HeadingXXLarge>Du prøvde å komme inn i en side du ikke har tilgang til.</HeadingXXLarge>
        <img src={notFound} alt={intl.pageNotFound} style={{ maxWidth: '65%' }} />
      </Block>
    </Block>
  )
}

export default Forbidden
