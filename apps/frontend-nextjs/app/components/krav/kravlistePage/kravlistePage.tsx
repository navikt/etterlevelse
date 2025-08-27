import { PageLayout } from '@/components/others/scaffold/scaffold'
import { kravlisteOpprettUrl } from '@/routes/krav/kravRoutes'
import { user } from '@/services/user/userService'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { KravTabs } from './kravTabs/kravTabs'
import { ListPageHeader } from './listPageHeader/listPageHeader'

export const KravlistePage = () => (
  <PageLayout pageTitle='Forvalte og opprette krav' currentPage='Forvalte og opprette krav'>
    <div className='pb-52 w-full'>
      <ListPageHeader headingText='Forvalte og opprette krav'>
        {user.isKraveier() && (
          <Button
            iconPosition='left'
            icon={<PlusIcon area-label='' aria-hidden />}
            size='medium'
            as='a'
            href={kravlisteOpprettUrl()}
          >
            Nytt krav
          </Button>
        )}
      </ListPageHeader>
      <div className='flex justify-center w-full'>
        <div className='w-full'>
          <div className='pt-6'>
            <KravTabs />
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
)
