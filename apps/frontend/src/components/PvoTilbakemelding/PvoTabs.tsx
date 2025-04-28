import { Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { pvoTabQueryUrl } from '../common/RouteLinkPvo'
import PvoSistRedigertView from './PvoSistRedigertView'
import { PvoTilbakemeldingsList } from './PvoTilbakemeldingsList'

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
      onChange={(tabQuery: string) => {
        setTab(tabQuery)
        navigate(pvoTabQueryUrl(tabQuery))
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='siste' label='Mine sist redigerte' />
        <Tabs.Tab value='alle' label='Alle PVKer' />
      </Tabs.List>
      <Tabs.Panel value='siste'>
        <PvoSistRedigertView />
      </Tabs.Panel>
      <Tabs.Panel value='alle'>
        <PvoTilbakemeldingsList />
      </Tabs.Panel>
    </Tabs>
  )
}

export default PvoTabs
