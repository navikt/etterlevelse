import {Block} from 'baseui/block'
import {theme} from '../../util'
import {datajegerSlackLink, documentationLink, githubRepo} from '../../util/config'
import SlackLogo from '../../resources/Slack_Monochrome_White.svg'
import {LabelMedium} from 'baseui/typography'
import {StatefulTooltip} from 'baseui/tooltip'
import {env} from '../../util/env'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCodeBranch} from '@fortawesome/free-solid-svg-icons'
import * as React from 'react'
import {ExternalLink} from '../common/RouteLink'
import {navImage} from '../Images'


export const Footer = () => {
  return (
    <Block display='flex' justifyContent='space-between'
           width='100%' maxWidth='600px' marginBottom='100px'
           alignItems='center'>

      <img src={navImage} alt='NAV logo' width="85px"/>

      <ExternalLink href={datajegerSlackLink} hideUnderline>
        <Block display="flex" alignItems="center">
          <img src={SlackLogo} width="60px" alt="slack logo"/>
          <LabelMedium>#datajegerne </LabelMedium>
        </Block>
      </ExternalLink>

      <StatefulTooltip content={`Versjon: ${env.githubVersion}`}>
        <span><ExternalLink href={githubRepo} hideUnderline><FontAwesomeIcon icon={faCodeBranch}/> Github</ExternalLink></span>
      </StatefulTooltip>

      <ExternalLink href={documentationLink} hideUnderline>
        <LabelMedium marginLeft={theme.sizing.scale200}>Dokumentasjon</LabelMedium>
      </ExternalLink>
    </Block>
  )
}
