import { MineSistDokumenterte } from '@/components/frontpage/MineSistDokumenterte'
import { Heading } from '@navikt/ds-react'
import ForstaKravene from './components/frontpage/ForstaKravene'
import StatusIOrganisasjonen from './components/frontpage/StatusIOrganisasjonen'
import { PageLayout } from './components/others/scaffold/scaffold'

export default function Home() {
  return (
    <PageLayout noPadding fullWidth>
      <div className='bg-blue-50 py-10 flex justify-center'>
        <div className='max-w-7xl w-full px-2'>
          <div className='flex flex-col'>
            <Heading className='flex justify-center' size='large' level='1'>
              Etterlevelse i Nav
            </Heading>
            <span className='flex justify-center'>Forstå og dokumentér</span>
          </div>
          <MineSistDokumenterte />
        </div>
      </div>
      <div className='flex flex-col items-center w-full'>
        <div className='max-w-7xl w-full px-2'>
          <div className='flex my-10'>
            <ForstaKravene />
            <StatusIOrganisasjonen />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
