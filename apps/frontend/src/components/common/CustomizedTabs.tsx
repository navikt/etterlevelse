import * as React from 'react'
import { Tabs, TabsProps, Tab, TabProps } from 'baseui/tabs'

export const CustomizedTab = (props: TabProps) => {
  return (
    <Tab {...props} >{props.children}</Tab>
  )
}

interface CustomizedTabsProps {
  fontColor?: string,
  tabBackground?: string
}

type CustomProps = TabsProps & CustomizedTabsProps

export const CustomizedTabs = (props: CustomProps ) => {
  const [activeKey, setActiveKey] = React.useState('0')

  return (
    <Tabs
      {...props}
      overrides={{
        Tab: { style: { padding: '0px', margin: '0px', marginRight: '0px', height: '58px', color: props.fontColor? props.fontColor : 'black', borderColor: props.fontColor? props.fontColor : 'black' } },
        TabBar: { style: { backgroundColor: props.tabBackground, padding: '0px', justifyContent: 'space-between' } },
        TabContent: { style: { marginTop: '56px', padding: '0px', backgroundColor: '#F8F8F8' } }
      }}
      onChange={({ activeKey }) => {
        setActiveKey(activeKey.toString())
      }}
      activeKey={activeKey}
    >
      {props.children}
    </Tabs>
  )
}
export default CustomizedTabs
