import { Tabs } from '@navikt/ds-react'
import { PvoList } from './PvoList'

const PvoTabs = () => {
  //   const navigate: NavigateFunction = useNavigate()
  //   const params: Readonly<
  //     Partial<{
  //       tab?: string
  //     }>
  //   > = useParams<{ tab?: string }>()
  //   const [tab, setTab] = useState<string>(params.tab || 'siste')

  //   useEffect(() => {
  //     setTab((params.tab as TSection) || 'siste')
  //   }, [params])

  return (
    <Tabs
    //   defaultValue={tab}
    //   onChange={(args: string) => {
    //     setTab(args)
    //     navigate(`/kravliste/${args}`)
    //   }}
    >
      <Tabs.List>
        <Tabs.Tab value="siste" label="Sist endret av meg" />
        <Tabs.Tab value="tema" label="Endre rekkefølge på krav (Temaoversikt)" />
        <Tabs.Tab value="alle" label="Alle krav" />
      </Tabs.List>
      <Tabs.Panel value="siste">gerbgf{/* <SistRedigertKrav /> */}</Tabs.Panel>
      <Tabs.Panel value="tema">ta b 2{/* <TemaList /> */}</Tabs.Panel>
      <Tabs.Panel value="alle">
        <PvoList />
      </Tabs.Panel>
    </Tabs>
  )
}

export default PvoTabs
