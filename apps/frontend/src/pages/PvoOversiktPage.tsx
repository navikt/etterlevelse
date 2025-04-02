import PvoTabs from '../components/PvkDokument/PvoTabs'
import { ListPageHeader } from '../components/scaffold/ListPageHeader'
import { PageLayout } from '../components/scaffold/Page'
import { EPVO } from '../constants'

export const PvoOversiktPage = () => {
  return (
    <PageLayout pageTitle={EPVO.overskrift} currentPage={EPVO.overskrift}>
      <div className='pb-52 w-full'>
        <ListPageHeader headingText={EPVO.overskrift} />
        <div className='flex justify-center w-full'>
          <div className='w-full'>
            <div className='pt-6'>
              <PvoTabs />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default PvoOversiktPage
