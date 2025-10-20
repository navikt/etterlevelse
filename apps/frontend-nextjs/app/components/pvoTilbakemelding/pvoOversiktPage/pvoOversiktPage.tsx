import { ListPageHeader } from '@/components/krav/kravlistePage/listPageHeader/listPageHeader'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EPVO } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernombudetsTilbakemelding/personvernombudetsTilbakemeldingConstants'
import PvoTabs from './pvoTabs'

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
