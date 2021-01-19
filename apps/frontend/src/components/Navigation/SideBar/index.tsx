import * as React from 'react'
import {theme} from '../../../util'
import {Block, BlockProps} from 'baseui/block'
import {H6, Paragraph4} from 'baseui/typography'
import NavLogo from '../../../resources/navlogo.svg'
import {StyledLink} from 'baseui/link'
import NavItem from './NavItem'
import SlackLogo from '../../../resources/Slack_Monochrome_White.svg'
import {StatefulTooltip} from 'baseui/tooltip'
import {env} from '../../../util/env'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCodeBranch} from '@fortawesome/free-solid-svg-icons'
import {datajegerSlackLink, documentationLink, githubRepo} from '../../../util/config'

const sideBarProps: BlockProps = {
  position: 'fixed',
  height: '100%',
  width: ['0', '0', '180px', '180px'],
  backgroundColor: theme.colors.primaryA,
}

const items: BlockProps = {
  paddingLeft: '1rem'
}

const Brand = () => (
  <Block display="flex" flexDirection={"column"} padding="1rem" marginTop="1rem">
    <StyledLink style={{textDecoration: 'none', textAlign: 'center'}} href="/">
      <H6 color="white" marginTop="1rem" marginLeft="5px" marginBottom="2rem">Etterlevelse</H6>
    </StyledLink>
  </Block>
)

const SideBar = () => {
  return (
    <Block {...sideBarProps}>
      <Brand/>
      <Block {...items}>
        <NavItem to="/krav" text="Krav"/>
        <NavItem to="/etterlevelse" text="Etterlevelse"/>
        <NavItem to="/behandling" text="Behandling"/>

        <Block height={theme.sizing.scale600}/>

        <NavItem to="/relevans" text="Relevans" yMargin={theme.sizing.scale200}/>
        <NavItem to="/underavdeling" text="Underavdeling" yMargin={theme.sizing.scale200}/>
      </Block>
      <Block position="absolute" bottom="0" width="100%">
        <Block display="flex" justifyContent="center">
          <Block paddingBottom={theme.sizing.scale600} width="40%">
            <img src={NavLogo} alt='NAV logo' width="100%"/>
          </Block>
        </Block>
        <a href={datajegerSlackLink} style={{textDecoration: 'none'}}
           target="_blank" rel="noopener noreferrer">
          <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
            <img src={SlackLogo} width="60px" alt="slack logo"/>
            <Paragraph4 color={theme.colors.white}>#datajegerne </Paragraph4>
          </Block>
        </a>
        <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
          <StatefulTooltip content={`Versjon: ${env.githubVersion}`}>
            <a href={githubRepo} style={{textDecoration: 'none'}}
               target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon color={theme.colors.white} icon={faCodeBranch}/></a>
          </StatefulTooltip>
          <a href={documentationLink} style={{textDecoration: 'none'}} target="_blank" rel="noopener noreferrer">
            <Paragraph4 marginLeft={theme.sizing.scale200} color={theme.colors.white}>Dokumentasjon </Paragraph4>
          </a>
        </Block>
      </Block>
    </Block>
  )
}

export default SideBar
