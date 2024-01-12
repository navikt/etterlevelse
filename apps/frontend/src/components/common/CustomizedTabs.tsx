import { FILL, ORIENTATION, Tab, TabProps, Tabs, TabsOverrides } from 'baseui/tabs-motion'
import _ from 'lodash'
import * as React from 'react'
import { ReactNode, useState } from 'react'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import { borderColor, borderStyle, borderWidth, marginZero, paddingZero } from './Style'

export const CustomizedTab = (props: TabProps) => {
  return <Tab {...props}>{props.children}</Tab>
}

interface ITabsContent {
  title?: string
  key?: string
  content?: ReactNode
}

interface ICustomizedTabsProps {
  fontColor?: string
  activeColor?: string
  tabBackground?: string
  backgroundColor?: string
  small?: boolean
  tabs?: ITabsContent[]

  children?: ReactNode
  activeKey?: React.Key
  disabled?: boolean
  fill?: (typeof FILL)[keyof typeof FILL]
  orientation?: (typeof ORIENTATION)[keyof typeof ORIENTATION]
  activateOnFocus?: boolean
  renderAll?: boolean
  onChange?: (params: { activeKey: React.Key }) => void
  overrides?: TabsOverrides
  uid?: string
}

export const CustomizedTabs = (props: ICustomizedTabsProps) => {
  const [activeKeyInternal, setActiveKeyInternal] = useState<React.Key>(0)
  const { tabBackground, tabs, overrides, ...restProps } = props
  let { fontColor, activeColor } = props
  fontColor = fontColor || 'black'
  activeColor = activeColor || fontColor

  const hoverAndFocusStyle = {
    color: activeColor,
    borderBottomColor: fontColor,
    background: 'transparent',
  }

  const customOverrides = {
    TabList: {
      style: {
        backgroundColor: tabBackground,
        justifyContent: props.small ? 'flex-start' : 'space-between',
        ...paddingZero,
        marginLeft: '-2px',
        marginRight: '-2px',
        height: '50px',
        whiteSpace: 'nowrap',
      },
    },
    TabBorder: {
      style: {
        backgroundColor: 'transparent',
      },
    },
    TabHighlight: {
      style: {
        backgroundColor: 'transparent',
      },
    },
  }

  return (
    <Tabs
      {...restProps}
      overrides={_.merge(customOverrides, overrides)}
      onChange={({ activeKey }) => {
        if (props.onChange) props.onChange({ activeKey })
        else setActiveKeyInternal(activeKey)
      }}
      activeKey={props.activeKey || activeKeyInternal}
    >
      {tabs?.map((tab: ITabsContent, index: number) => {
        return (
          <CustomizedTab
            title={tab.title}
            key={tab.key}
            overrides={{
              Tab: {
                style: (tabProps) => ({
                  ...marginZero,
                  fontWeight: tabProps.$isActive ? 700 : 600,
                  color: tabProps.$isActive ? ettlevColors.green800 : ettlevColors.green600,
                  background: tabBackground,
                  paddingBottom: '6px',
                  paddingTop: '20px',
                  paddingLeft: '4px',
                  paddingRight: '4px',

                  ...borderWidth('4px !important'),
                  ...borderColor(tabBackground),
                  borderBottomColor: tabProps.$isActive ? activeColor : 'transparent',

                  // Avoid cut horizontal line on bottom border
                  ...borderStyle('hidden'),

                  borderBottomStyle: 'solid',
                  ':hover': hoverAndFocusStyle,
                  ':focus-visible': hoverAndFocusStyle,
                  ':active': hoverAndFocusStyle,

                  ...(props.small
                    ? {
                        marginRight: theme.sizing.scale1000,
                        fontSize: '18px',
                      }
                    : {
                        marginLeft: index === 0 ? 0 : theme.sizing.scale1000,
                        fontSize: '20px',
                      }),
                }),
              },
              TabPanel: {
                style: {
                  marginTop: theme.sizing.scale1600,
                  backgroundColor: props.backgroundColor || ettlevColors.grey25,
                  ...paddingZero,
                },
              },
            }}
          >
            {tab.content}
          </CustomizedTab>
        )
      })}
    </Tabs>
  )
}

export default CustomizedTabs
