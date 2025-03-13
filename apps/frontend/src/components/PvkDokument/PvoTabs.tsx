import { Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { PvoList } from './PvoList'

type TSection = 'siste' | 'alle'

const PvoTabs = () => {
  const navigate: NavigateFunction = useNavigate()
  const params: Readonly<
    Partial<{
      tab?: string
    }>
  > = useParams<{ tab?: string }>()
  const [tab, setTab] = useState<string>(params.tab || 'siste')

  useEffect(() => {
    setTab((params.tab as TSection) || 'siste')
  }, [params])

  return (
    <Tabs
      defaultValue={tab}
      onChange={(args: string) => {
        setTab(args)
        navigate(`/pvoliste/${args}`)
      }}
    >
      <Tabs.List>
        <Tabs.Tab value="siste" label="Mine sist redigerte" />
        <Tabs.Tab value="alle" label="Alle PVKer" />
      </Tabs.List>
      <Tabs.Panel value="siste">
        HER SKAL DET VÆRE SISTE REDIGERTE {/* <SistRedigertKrav /> */}
      </Tabs.Panel>
      <Tabs.Panel value="alle">
        <PvoList />
      </Tabs.Panel>
    </Tabs>
  )
}

export default PvoTabs
