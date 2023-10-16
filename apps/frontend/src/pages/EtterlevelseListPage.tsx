import {Block} from 'baseui/block'
import {HeadingXLarge, LabelSmall} from 'baseui/typography'
import React, {useEffect} from 'react'
import {useEtterlevelsePage} from '../api/EtterlevelseApi'
import Button from '../components/common/Button'
import {theme} from '../util'
import RouteLink from '../components/common/RouteLink'
import {etterlevelseName} from './EtterlevelsePage'
import {Spinner} from '../components/common/Spinner'
import {user} from '../services/User'
import {maxPageWidth, pageWidth, responsivePaddingSmall, responsiveWidthSmall} from '../util/theme'
import {Helmet} from 'react-helmet'
import {ampli} from '../services/Amplitude'

export const EtterlevelseListPage = () => {
  const [etterlevelse, prev, next, loading] = useEtterlevelsePage(20)

  useEffect(() => {
    if (!loading) {
      ampli.logEvent('sidevisning', { side: 'Dokumentasjons liste for etterlevelse' })
    }
  }, [loading])

  return (
    <Block id="content" overrides={{ Block: { props: { role: 'main' } } }} maxWidth={maxPageWidth} width="100%">
      <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} width={responsiveWidthSmall} display="flex" justifyContent="center">
        <Block minWidth={pageWidth}>
          <Block display="flex" justifyContent="space-between" alignItems="center">
            <Helmet>
              <meta charSet="utf-8" />
              <title>Dokumentasjons liste for etterlevelse</title>
            </Helmet>
            <HeadingXLarge>Dokumentasjons liste for etterlevelse</HeadingXLarge>

            <Block>
              {user.canWrite() && (
                <RouteLink href={'/etterlevelse/ny'}>
                  <Button >Ny etterlevelse</Button>
                </RouteLink>
              )}
            </Block>
          </Block>

          <Block display="flex" flexDirection="column">
            {!loading &&
              etterlevelse.content.map((k, i) => (
                <Block key={k.id} marginBottom={theme.sizing.scale300}>
                  <RouteLink href={`/etterlevelse/${k.id}`}>
                    #{etterlevelse.pageSize * etterlevelse.pageNumber + i + 1} {etterlevelseName(k)}
                  </RouteLink>
                </Block>
              ))}
            {loading && <Spinner size={"large"} />}
          </Block>
          <Block display="flex" alignItems="center" marginTop={theme.sizing.scale1000}>
            <LabelSmall marginRight={theme.sizing.scale400}>
              Side {etterlevelse.pageNumber + 1}/{etterlevelse.pages}
            </LabelSmall>
            <Button onClick={prev}  disabled={etterlevelse.pageNumber === 0}>
              Forrige
            </Button>
            <Button onClick={next}  disabled={etterlevelse.pageNumber >= etterlevelse.pages - 1}>
              Neste
            </Button>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
