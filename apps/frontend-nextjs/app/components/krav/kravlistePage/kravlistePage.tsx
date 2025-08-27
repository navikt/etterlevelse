import { PageLayout } from '@/components/others/scaffold/scaffold'
import { kravlisteOpprettUrl } from '@/routes/krav/kravRoutes'
import { user } from '@/services/user/userService'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
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
    </div>
  </PageLayout>
)
