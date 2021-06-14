import {Accordion, AccordionProps, Panel, PanelProps} from 'baseui/accordion'
import {ettlevColors, theme} from '../../util/theme'
import {Block} from 'baseui/block'
import {HeadingLarge} from 'baseui/typography'
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons'
import * as React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {borderColor, borderRadius, borderStyle, borderWidth} from './Style'
import _ from 'lodash'
import {resetCaches} from '@apollo/client'

export const CustomizedAccordion = (props: AccordionProps) => {
  return <Accordion {...props} overrides={{}} />
}

export const CustomizedPanel = (props: PanelProps) => {
  const {expanded} = props

  const customOverrides = {
    ToggleIcon: {
      component: () =>
        expanded ? (
          <FontAwesomeIcon icon={faChevronUp} />
        ) : (
          <FontAwesomeIcon icon={faChevronDown} />
        ),
    },
    Header: {
      style: {
        backgroundColor: expanded ? ettlevColors.grey50 : ettlevColors.white,
        ...borderStyle('solid'),
        ...borderWidth('1px'),
        ...borderColor(ettlevColors.grey100),
        ...borderRadius('4px'),
        ':hover': {
          textDecoration: 'underline',
        },
      },
    },
    Content: {
      style: {
        backgroundColor: ettlevColors.grey50,
        paddingLeft: theme.sizing.scale100,
        paddingRight: theme.sizing.scale100,
        paddingTop: 0,
        paddingBottom: expanded ? theme.sizing.scale100 : 0,
      },
    },
    PanelContainer: {
      style: {
        marginBottom: theme.sizing.scale200,
        borderStyle: 'hidden',
      },
    },
  }

  const overrides = _.merge(customOverrides, props.overrides)

  const getTitle = () => {
    if (typeof props.title !== 'string') {
      return props.title
    } else {
      return (
        <Block>
          <HeadingLarge
            marginTop={theme.sizing.scale100}
            marginBottom={theme.sizing.scale100}
            color={ettlevColors.green600}
          >
            {props.title}
          </HeadingLarge>
        </Block>
      )
    }
  }

  return <Panel {...props} overrides={overrides} title={getTitle()} />
}
