import { Block } from 'baseui/block'
import { datajegerSlackLink, documentationLink, githubRepo } from '../../util/config'
import * as React from 'react'
import { ExternalLink } from '../common/RouteLink'
import ToTopCircle from '../../resources/ToTopCircle.svg'
import { ettlevColors, maxPageWidth, responsivePaddingSmall, responsiveWidthSmall } from '../../util/theme'
import Button from '../common/Button'
import { KIND } from 'baseui/button'

export const Footer = () => {
  const [showButtonToTop, setShowButtonToTop] = React.useState(false)
  const [pageScroll, setPageScroll] = React.useState(window.pageYOffset)

  React.useEffect(() => {
    const checkScrollTop = () => {
      setPageScroll(window.pageYOffset)
      if (!showButtonToTop && window.pageYOffset > 100) {
        setShowButtonToTop(true)
      } else if (showButtonToTop && window.pageYOffset <= 100) {
        setShowButtonToTop(false)
      }
    }

    window.addEventListener('scroll', checkScrollTop)

    return () => window.removeEventListener('scroll', checkScrollTop)
  }, [pageScroll])

  return (
    <Block backgroundColor={ettlevColors.green800} width="100%" justifyContent="center" display="flex" position="absolute" bottom="0">
      <Block maxWidth={maxPageWidth} width="100%">
        <Block
          display="flex"
          width={responsiveWidthSmall}
          height="100px"
          paddingRight={responsivePaddingSmall}
          paddingLeft={responsivePaddingSmall}
          position="relative"
          $style={{ left: 0, right: 0, bottom: 0 }}
        >
          <div className="w-full min-h-[100px] flex items-center">
            <div className="w-full flex justify-around items-center">
              <ExternalLink href={datajegerSlackLink} className="text-white" openOnSamePage>
                  #etterlevelse på Slack
              </ExternalLink>
              <ExternalLink href={githubRepo} openOnSamePage className="text-white">
                Github
              </ExternalLink>
              <ExternalLink href={documentationLink} openOnSamePage className="text-white">
                Dokumentasjon
              </ExternalLink>
            </div>
          </div>

          {showButtonToTop && (
            <Block position="relative" display="flex" justifyContent="flex-end" $style={{ cursor: 'pointer', top: '-50px' }} onClick={() => window.scrollTo(0, 0)}>
              <Button kind={KIND.tertiary} $style={{ ':hover': { backgroundColor: 'transparent' } }}>
                <img src={ToTopCircle} alt="Til toppen av siden" />
              </Button>
            </Block>
          )}
        </Block>
      </Block>
    </Block>
  )
}
