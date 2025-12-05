import { Heading } from '@navikt/ds-react'
import { PageLayout } from '../others/scaffold/scaffold'

export const RisikoeierGodkjenningPage = () => {
  return (
    <PageLayout
      pageTitle='Få etterlevelsen godkjent av risikoeier'
      currentPage='Få etterlevelsen godkjent av risikoeier'
      // må legge til breadcrum her
    >
      <div>
        <Heading level='1' size='large' className='mb-10'>
          Få etterlevelsen godkjent av risikoeier
        </Heading>

        <Heading level='2' size='medium' className='mb-5'>
          Godkjenningshistorikk
        </Heading>
      </div>
    </PageLayout>
  )
}

export default RisikoeierGodkjenningPage
