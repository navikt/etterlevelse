'use client'

import { ListPageHeader } from '@/components/krav/kravlistePage/listPageHeader/listPageHeader'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { etterlevelseDokumentasjonCreateUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { Button } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import DokumentasjonTabs from './dokumentasjonTabs'

export const EtterlevelseDokumentasjonListPage = () => {
  const router = useRouter()
  return (
    <PageLayout pageTitle='Dokumentere etterlevelse' currentPage='Dokumentere etterlevelse'>
      <div className='pb-52 w-full'>
        <ListPageHeader headingText='Dokumentere etterlevelse'>
          <Button
            onClick={() => {
              router.push(etterlevelseDokumentasjonCreateUrl)
            }}
            size='medium'
            variant='primary'
            className='whitespace-nowrap ml-5'
          >
            Nytt etterlevelsesdokument
          </Button>
        </ListPageHeader>

        <div className='flex justify-center w-full'>
          <div className='w-full'>
            <div className='pt-6'>
              <DokumentasjonTabs />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default EtterlevelseDokumentasjonListPage
