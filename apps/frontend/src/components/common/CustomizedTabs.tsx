import * as React from 'react'
import {Tab, TabProps, Tabs, TabsProps} from 'baseui/tabs'
import {StyleObject} from 'styletron-standard'
import {borderColor, borderStyle, borderWidth, marginZero, padding, paddingZero} from './Style'

export const CustomizedTab = (props: TabProps) => {
  return (
    <Tab {...props} >{props.children}</Tab>
  )
}

interface CustomizedTabsProps {
  fontColor?: string,
  activeColor?: string,
  tabBackground?: string
}

type CustomProps = TabsProps & CustomizedTabsProps

export const CustomizedTabs = (props: CustomProps) => {
  const [activeKey, setActiveKey] = React.useState('0')
  const fontColor = props.fontColor || 'black'
  const activeColor = props.activeColor || fontColor

  const hoverFocusStyle: StyleObject = {
    color: activeColor,
    borderBottomColor: fontColor,
    borderBottomStyle: 'solid',
    borderBottomWidth: '4px',
  }

  return (
    <Tabs
      {...props}
      overrides={{
        Tab: {
          style: (tabProps) => ({
            paddingTop: '20px',
            paddingLeft: '10px',
            paddingRight: '10px',
            ...marginZero,
            marginRight: '0px',
            height: '58px',
            fontSize: '20px',
            fontWeight: tabProps.$active ? 700 : 600,
            color: tabProps.$active ? activeColor : fontColor,

            ...borderColor(props.tabBackground),
            borderBottomColor: fontColor,
            // ...borderStyle('solid'),
            ...borderStyle('hidden'),
            borderBottomStyle: 'solid',
            ...borderWidth('4px'),
            ':hover': hoverFocusStyle,
            ':focus-visible': {
              ...hoverFocusStyle,

              paddingTop: '16px',
              paddingLeft: '6px',
              paddingRight: '6px',

              ...borderStyle('solid'),
              ...borderColor(fontColor),
              outlineOffset: '0px',
            }
          })
        },
        TabBar: {
          style: {
            backgroundColor: props.tabBackground,
            justifyContent: 'space-between',
            ...padding('0', '4px'),
          }
        },
        TabContent: {
          style: {
            marginTop: '56px',
            backgroundColor: '#F8F8F8',
            ...paddingZero
          }
        }
      }}
      onChange={({activeKey}) => {
        setActiveKey(activeKey.toString())
      }}
      activeKey={activeKey}
    >
      {props.children}
    </Tabs>
  )
}
export default CustomizedTabs
