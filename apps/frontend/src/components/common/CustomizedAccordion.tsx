import {Accordion, AccordionProps, Panel, PanelProps} from 'baseui/accordion'
import {ettlevColors, theme} from '../../util/theme'
import {Block} from 'baseui/block'
import {HeadingLarge} from 'baseui/typography'
import {faChevronDown, faChevronRight} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'


export const CustomizedAccordion = (props: AccordionProps) => {

  return (
    <Accordion {...props}
               overrides={{}}/>
  )
}

export const CustomizedPanel = (props: PanelProps) => {
  const {expanded} = props
  return (
    <Panel {...props} overrides={{
      ToggleIcon: {
        component: () => null
      },
      Header: {
        style: {
          backgroundColor: ettlevColors.grey50,
          borderBottomStyle: 'hidden',
          ':hover': {
            textDecoration: 'underline'
          }
        }
      },
      Content: {
        style: {
          backgroundColor: ettlevColors.grey50,
          paddingLeft: theme.sizing.scale100,
          paddingRight: theme.sizing.scale100,
          paddingTop: 0,
          paddingBottom: expanded ? theme.sizing.scale100 : 0,
          borderStyle: 'hidden',
          marginBottom: theme.sizing.scale100
        }
      }
    }} title={<Block>
      <HeadingLarge marginTop={theme.sizing.scale100} marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
        {expanded ? <FontAwesomeIcon icon={faChevronDown}/> : <FontAwesomeIcon icon={faChevronRight}/>}
        <span> </span>
        {props.title}
      </HeadingLarge>
    </Block>}/>
  )
}
