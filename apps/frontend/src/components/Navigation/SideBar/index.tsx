import * as React from 'react'
import {theme} from '../../../util'
import {Block, BlockProps} from 'baseui/block'
import {H6} from 'baseui/typography'
import {StyledLink} from 'baseui/link'
import NavItem from './NavItem'

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
  <Block display="flex" flexDirection={'column'} padding="1rem" marginTop="1rem">
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
        <NavItem to="/behandlinger" text="Behandling"/>

        <Block height={theme.sizing.scale600}/>

        <NavItem to="/relevans" text="Relevans" yMargin={theme.sizing.scale200}/>
        <NavItem to="/underavdeling" text="Underavdeling" yMargin={theme.sizing.scale200}/>
        <NavItem to="/lov" text="Lov" yMargin={theme.sizing.scale200}/>
      </Block>
      <Block position="absolute" bottom="0" width="100%">

      </Block>
    </Block>
  )
}

export default SideBar
