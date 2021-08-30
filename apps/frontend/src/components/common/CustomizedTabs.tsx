import * as React from 'react'
import { useState } from 'react'
import { Tab, TabProps, Tabs, TabsProps } from 'baseui/tabs-motion'
import { StyleObject } from 'styletron-standard'
import { borderColor, borderStyle, borderWidth, marginZero, paddingZero } from './Style'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'

interface AdditionalTabProps {
  fontColor?: string
  activeColor?: string
  tabBackground?: string
  backgroundColor?: string
  small?: boolean
}

type customTabProps = AdditionalTabProps & TabProps

export const CustomizedTab = (props: customTabProps) => {

  let { fontColor, activeColor, tabBackground } = props
  fontColor = fontColor || 'black'
  activeColor = activeColor || fontColor

  const hoverAndFocusStyle: StyleObject = {
    color: activeColor,
    borderBottomColor: fontColor,
  }

  return <Tab
    overrides={{
      Tab: {
        style: (tabProps) => ({
          ...marginZero,
          fontSize: '20px',
          fontWeight: tabProps.$isActive ? 700 : 600,
          fontColor: tabProps.$isActive ? activeColor : fontColor,
          backgroundColor: 'red',
          paddingBottom: '6px',
          paddingTop: '20px',
          paddingLeft: '4px',
          paddingRight: '4px',
          ...(props.small
            ? {
              marginRight: theme.sizing.scale1000,
              fontSize: '18px',
            }
            : {}),
        }),
      },
      TabPanel: {
        style: {
          marginTop: theme.sizing.scale1600,
          backgroundColor: props.backgroundColor || ettlevColors.grey25,
          ...paddingZero,
        },
      },
    }}>
    {props.children}
  </Tab>
}

interface CustomizedTabsProps {
  fontColor?: string
  activeColor?: string
  tabBackground?: string
  backgroundColor?: string
  small?: boolean
}

type CustomProps = TabsProps & CustomizedTabsProps

export const CustomizedTabs = (props: CustomProps) => {
  const [activeKeyInternal, setActiveKeyInternal] = useState<React.Key>(0)
  let { fontColor, activeColor, tabBackground, ...restProps } = props
  fontColor = fontColor || 'black'
  activeColor = activeColor || fontColor

  return (
    <Tabs
      {...restProps}
      overrides={{
        TabList: {
          style: {
            backgroundColor: tabBackground,
            justifyContent: props.small ? 'flex-start' : 'space-between',
            ...paddingZero,
            marginLeft: '-2px',
            marginRight: '-2px',
            height: '50px',
            whiteSpace: 'nowrap'
          },
        },
        TabBorder: {
          style: {
            backgroundColor: tabBackground
          }
        },
        TabHighlight: {
          style: {
            backgroundColor: tabBackground,
            ':hover': {
              backgroundColor: activeColor
            }
          }
        }
      }}
      onChange={({ activeKey }) => {
        if (props.onChange) props.onChange({ activeKey })
        else setActiveKeyInternal(activeKey)
      }}
      activeKey={props.activeKey || activeKeyInternal}
    >
      {props.children}
    </Tabs>
  )
}

export default CustomizedTabs
