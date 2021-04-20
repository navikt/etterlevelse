import { Block } from 'baseui/block'
import { theme } from '../../util'
import { datajegerSlackLink, documentationLink, githubRepo } from '../../util/config'
import SlackLogo from '../../resources/Slack_Monochrome_White.svg'
import { LabelMedium } from 'baseui/typography'
import { StatefulTooltip } from 'baseui/tooltip'
import { env } from '../../util/env'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import * as React from 'react'
import { ExternalLink } from '../common/RouteLink'
import ToTopCircle from '../../resources/ToTopCircle.svg'


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

    return () =>  window.removeEventListener('scroll', checkScrollTop)
  }, [pageScroll])

  return (
    <Block display='flex' width='calc(100% - 80px)' height='100px' backgroundColor='#112724' paddingRight='40px' paddingLeft='40px' position='relative' $style={{left:0, right: 0, bottom: 0}}>
      <Block display='flex'
        width='100%' minHeight='100px'
        justifyContent='center'
        alignItems='center' overrides={{ Block: { props: { role: 'contentinfo' } } }}
      >
        <Block width='100%'  display={['block','block','flex','flex']} justifyContent={['space-around']} alignItems='center' overrides={{ Block: { props: { role: 'navigation', 'aria-label': 'Ekstern lenker' } } }}>
          <ExternalLink href={datajegerSlackLink} hideUnderline>
            <Block display="flex" alignItems="center">
              <img src={SlackLogo} width="60px" alt="slack logo" />
              <LabelMedium color='#F8F8F8'>#datajegerne </LabelMedium>
            </Block>
          </ExternalLink>

          <StatefulTooltip content={`Versjon: ${env.githubVersion}`}>
            <span><ExternalLink fontColor='#F8F8F8' href={githubRepo} hideUnderline><FontAwesomeIcon color='#F8F8F8' icon={faCodeBranch} /> Github</ExternalLink></span>
          </StatefulTooltip>

          <ExternalLink href={documentationLink} hideUnderline>
            <LabelMedium color='#F8F8F8' marginLeft={theme.sizing.scale200}>Dokumentasjon</LabelMedium>
          </ExternalLink>
        </Block>
      </Block>

      {showButtonToTop && (<Block position='relative' display='flex' justifyContent='flex-end' $style={{ cursor: 'pointer', top: '-50px' }} onClick={() => window.scrollTo(0, 0)}>
        <img src={ToTopCircle} alt='Til toppen av siden' />
      </Block>)}

    </Block>
  )
}