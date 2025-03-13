import { Loader } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { getAllPvkDokumentListItem } from '../api/PvkDokumentApi'
import PvoTabs from '../components/PvkDokument/PvoTabs'
import { ListPageHeader } from '../components/scaffold/ListPageHeader'
import { PageLayout } from '../components/scaffold/Page'
import { IPvkDokumentListItem } from '../constants'

export const PvoOversiktPage = () => {
  const [allPvkDocumentListItem, setAllPvkDocumentListItem] = useState<IPvkDokumentListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await getAllPvkDokumentListItem().then((response) => {
        setAllPvkDocumentListItem(response)
        setIsLoading(false)
      })
    })()
  }, [])

  return (
    <PageLayout
      pageTitle="Oversikts side for Personvernsombudet"
      currentPage="Oversikts side for Personvernsombudet"
    >
      <div className="pb-52 w-full">
        <ListPageHeader headingText="Oversiktsside for Personvernombudet" />
        {isLoading && (
          <div className="flex w-full justify-center items-center mt-5">
            <Loader size="3xlarge" className="flex justify-self-center" />
          </div>
        )}
        {!isLoading && allPvkDocumentListItem.length !== 0 && (
          <div className="flex justify-center w-full">
            <div className="w-full">
              <div className="pt-6">
                <PvoTabs />
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default PvoOversiktPage
