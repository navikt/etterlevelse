import * as React from 'react'
import {useState} from 'react'
import {Tab, TabProps, Tabs, TabsProps} from 'baseui/tabs'
import {StyleObject} from 'styletron-standard'
import {borderColor, borderStyle, borderWidth, marginZero, paddingZero} from './Style'
import {theme} from '../../util'

export const CustomizedTab = (props: TabProps) => {
  return (
    <Tab {...props}/>
  )
}

interface CustomizedTabsProps {
  fontColor?: string,
  activeColor?: string,
  tabBackground?: string
}

type CustomProps = TabsProps & CustomizedTabsProps

export const CustomizedTabs = (props: CustomProps) => {
  const [activeKeyInternal, setActiveKeyInternal] = useState<React.Key>(0)
  let {fontColor, activeColor, tabBackground, ...restProps} = props
  fontColor = fontColor || 'black'
  activeColor = activeColor || fontColor

  const hoverAndFocusStyle: StyleObject = {
    color: activeColor,
    borderBottomColor: fontColor,
    borderBottomWidth: '4px',
  }

  return (
    <Tabs
      {...restProps}
      overrides={{
        Tab: {
          style: (tabProps) => ({
            ...marginZero,
            height: '50px',
            fontSize: '20px',
            fontWeight: tabProps.$active ? 700 : 600,
            color: tabProps.$active ? activeColor : fontColor,

            paddingBottom: '6px',
            paddingTop: '20px',
            paddingLeft: '4px',
            paddingRight: '4px',

            ...borderWidth('4px'),
            ...borderColor(tabBackground),
            borderBottomColor: fontColor,
            // Avoid cut horizontal line on bottom border
            ...borderStyle('hidden'),
            borderBottomStyle: 'solid',
            ':hover': hoverAndFocusStyle,
            ':focus-visible': {
              ...hoverAndFocusStyle,

              // from non-focus style minus borderWidth to account for border
              paddingTop: '16px',
              paddingLeft: '0',
              paddingRight: '0',

              ...borderStyle('solid'),
              ...borderColor(fontColor),
              outlineOffset: '0px',
            },
            ':active': {
              color: activeColor
            }
          })
        },
        TabBar: {
          style: {
            backgroundColor: tabBackground,
            justifyContent: 'space-between',
            ...paddingZero,
            marginLeft: '-2px',
            marginRight: '-2px'
          }
        },
        TabContent: {
          style: {
            marginTop: theme.sizing.scale1600,
            backgroundColor: '#F8F8F8',
            ...paddingZero
          }
        }
      }}
      onChange={({activeKey}) => {
        if (props.onChange) props.onChange({activeKey})
        else setActiveKeyInternal(activeKey)
      }}
      activeKey={props.activeKey || activeKeyInternal}
    />
  )
}
export default CustomizedTabs
