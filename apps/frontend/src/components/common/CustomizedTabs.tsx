import * as React from 'react'
import { Tabs, TabsProps, Tab, TabProps } from 'baseui/tabs'

export const CustomizedTab = (props: TabProps) => {
  return (
    <Tab {...props} >{props.children}</Tab>
  )
}

export const CustomizedTabs = (props: TabsProps ) => {
  const [activeKey, setActiveKey] = React.useState('0')

  return (
    <Tabs
      {...props}
      overrides={{
        Tab: { style: { padding: '0px', margin: '0px', marginRight: '0px', height: '58px', color: '#112624', borderColor: '#112624' } },
        TabBar: { style: { backgroundColor: '#CBD9D7', padding: '0px', justifyContent: 'space-between' } },
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
