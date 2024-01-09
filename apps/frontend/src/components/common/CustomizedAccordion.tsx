import { Accordion, AccordionProps, Panel, PanelOverrides, PanelProps } from 'baseui/accordion'
import { ettlevColors, theme } from '../../util/theme'
import { Block } from 'baseui/block'
import { HeadingLarge } from 'baseui/typography'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { borderColor, borderRadius, borderStyle, borderWidth, paddingAll } from './Style'
import _ from 'lodash'

export const CustomizedAccordion = (props: Partial<AccordionProps>) => {
  return <Accordion {...props} overrides={{}} />
}

interface ICustomizedPanelProps {
  HeaderBackgroundColor?: string
  HeaderActiveBackgroundColor?: string
  noUnderLine?: boolean
  toggleIcon?: { expanded: React.ReactElement<any, any>; unexpanded: React.ReactElement<any, any> }
}

type CustomProps = ICustomizedPanelProps & PanelProps

export const CustomizedPanel = (props: CustomProps) => {
  const { expanded } = props

  const customOverrides: PanelOverrides = {
    ToggleIcon: {
      component: () => {
        if (props.toggleIcon) {
          return expanded ? props.toggleIcon.expanded : props.toggleIcon.unexpanded
        } else {
          return expanded ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />
        }
      },
    },
    Header: {
      style: {
        backgroundColor: ettlevColors.white,
        ...borderRadius('4px'),
        paddingTop: theme.sizing.scale300,
        paddingBottom: theme.sizing.scale300,
        ':hover': {
          textDecoration: props.noUnderLine ? 'none' : 'underline',
          color: ettlevColors.green800,
          ...(expanded
            ? {
                boxShadow: 'none',
              }
            : {
                boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.12)',
              }),
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
        ...borderRadius('4px'),
        backgroundColor: ettlevColors.grey50,
        ...paddingAll('0px'),
        overflow: 'visible', // fix box shadows of content
      },
    },
    PanelContainer: {
      style: {
        ...(expanded
          ? {
              ...borderColor(ettlevColors.grey200),
            }
          : {
              ...borderColor(ettlevColors.grey100),
            }),
        ...borderStyle('solid'),
        ...borderWidth('1px'),
        ...borderRadius('4px'),
        marginBottom: theme.sizing.scale200,
        backgroundColor: ettlevColors.white,
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

export const CustomPanelDivider = (props: { children: React.ReactNode; fullWidth?: boolean }) => (
  <Block backgroundColor={ettlevColors.white} $style={{ ...borderRadius('4px') }}>
    <Block
      width={props.fullWidth ? '100%' : 'calc(100% - 48px)'}
      backgroundColor={ettlevColors.grey100}
      height="1px"
      marginLeft={props.fullWidth ? '0px' : theme.sizing.scale800}
      marginRight={props.fullWidth ? '0px' : theme.sizing.scale800}
    />
    {props.children}
  </Block>
)
