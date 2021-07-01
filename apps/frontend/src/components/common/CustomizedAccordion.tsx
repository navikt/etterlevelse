import { Accordion, AccordionProps, Panel, PanelOverrides, PanelProps } from 'baseui/accordion'
import { ettlevColors, theme } from '../../util/theme'
import { Block } from 'baseui/block'
import { HeadingLarge } from 'baseui/typography'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { borderColor, borderStyle, borderWidth, paddingAll } from './Style'
import _ from 'lodash'

export const CustomizedAccordion = (props: AccordionProps) => {
  return <Accordion {...props} overrides={{}} />
}

interface CustomizedPanelProps {
  HeaderBackgroundColor?: string
  HeaderActiveBackgroundColor?: string
}

type CustomProps = CustomizedPanelProps & PanelProps

export const CustomizedPanel = (props: CustomProps) => {
  const { expanded } = props

  const headerBackgroundColor = props.HeaderBackgroundColor ? props.HeaderBackgroundColor : ettlevColors.white
  const headerActiveBackgroundColor = props.HeaderActiveBackgroundColor ? props.HeaderActiveBackgroundColor : ettlevColors.grey50

  const customOverrides: PanelOverrides<any> = {
    ToggleIcon: {
      component: () => (expanded ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />),
    },
    Header: {
      style: {
        backgroundColor: expanded ? headerActiveBackgroundColor : headerBackgroundColor,
        ...borderStyle('solid'),
        ...borderWidth('1px'),
        ...borderColor(ettlevColors.grey100),
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        ...(expanded
          ? {}
          : {
              borderBottomLeftRadius: '4px',
              borderBottomRightRadius: '4px',
            }),
        ':hover': {
          textDecoration: 'underline',
        },
      },
    },
    ContentAnimationContainer: {
      style: {
        overflow: 'visible', // fix box shadows of content
      },
    },
    Content: {
      style: {
        backgroundColor: ettlevColors.grey50,
        ...paddingAll('0'),
        overflow: 'visible', // fix box shadows of content
      },
    },
    PanelContainer: {
      style: {
        marginBottom: theme.sizing.scale200,
        ...borderStyle('hidden'),
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
          <HeadingLarge marginTop={theme.sizing.scale100} marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
            {props.title}
          </HeadingLarge>
        </Block>
      )
    }
  }

  return <Panel {...props} overrides={overrides} title={getTitle()} />
}
