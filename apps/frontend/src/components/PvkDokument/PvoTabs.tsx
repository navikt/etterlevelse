import { Label, Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { EPVO, IPvkDokumentListItem } from '../../constants'
import { PvoTilbakemeldingsList } from './PvoTilbakemeldingsList'

type TSection = 'siste' | 'alle'

interface IProps {
  allPvkDocumentListItem: IPvkDokumentListItem[]
  isLoading: false
}

const PvoTabs = ({ allPvkDocumentListItem, isLoading }: IProps) => {
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
        navigate(`${EPVO.url}/${args}`)
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
        <div className="w-full justify-center my-4">
          <div className="flex justify-center content-center w-full">
            <div className="flex justify-start align-middle w-full">
              <Label size="medium">
                {/* {kravene.totalElements ? kravene.totalElements : 0}  */}
                {allPvkDocumentListItem.length} PVK dokumenter
              </Label>
            </div>
          </div>
        </div>

        <PvoTilbakemeldingsList
          allPvkDocumentListItem={allPvkDocumentListItem}
          isLoading={isLoading}
        />
      </Tabs.Panel>
    </Tabs>
  )
}

export default PvoTabs
