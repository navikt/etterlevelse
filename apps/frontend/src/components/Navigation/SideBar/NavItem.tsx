import * as React from 'react'
import { Block } from 'baseui/block'
import { Paragraph2 } from 'baseui/typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { useLocation } from 'react-router-dom'
import RouteLink from '../../common/RouteLink'

interface NavItemProps {
  text: string;
  to: string;
}

const NavItem = (props: NavItemProps) => (
  <RouteLink href={props.to} style={{ textDecoration: 'none' }}>
    <Block display="flex" alignItems="center">
      <Block marginRight="scale400">
        <FontAwesomeIcon
          icon={useLocation().pathname.split("/")[1].includes(props.to.split("/")[1]) ? faChevronDown : faChevronRight}
          color="white"
          size="lg" />
      </Block>

      <Paragraph2 color="white">{props.text}</Paragraph2>
    </Block>
  </RouteLink>
)

export default NavItem
