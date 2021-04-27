import * as React from 'react'
import {Tab, TabProps, Tabs, TabsProps} from 'baseui/tabs'
import {StyleObject} from 'styletron-standard'
import {marginZero, paddingZero} from './Style'

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
  const borderColor = fontColor


  const hoverFocusStyle: StyleObject = {
    color: activeColor,
    borderBottomColor: borderColor,
    borderBottomStyle: 'solid',
    borderBottomWidth: '2px',
  }

  return (
    <Tabs
      {...props}
      overrides={{
        Tab: {
          style: (tabProps) => ({
            paddingLeft: '6px',
            paddingRight: '6px',
            ...marginZero,
            marginRight: '0px',
            height: '58px',
            fontSize: '20px',
            fontWeight: tabProps.$active ? 700 : 600,
            color: tabProps.$active ? activeColor : fontColor,
            borderColor: borderColor,
            ':hover': hoverFocusStyle,
            ':focus': hoverFocusStyle,
          })
        },
        TabBar: {
          style: {
            backgroundColor: props.tabBackground,
            justifyContent: 'space-between',
            ...paddingZero
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
