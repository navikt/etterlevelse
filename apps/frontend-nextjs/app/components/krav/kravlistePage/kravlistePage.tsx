'use client'

import { PageLayout } from '@/components/others/scaffold/scaffold'
import { UserContext } from '@/provider/user/userProvider'
import { kravlisteOpprettUrl } from '@/routes/krav/kravRoutes'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { useContext } from 'react'
import { KravTabs } from './kravTabs/kravTabs'
import { ListPageHeader } from './listPageHeader/listPageHeader'

export const KravlistePage = () => {
  const { isKraveier } = useContext(UserContext)

  return (
    <PageLayout pageTitle='Forvalte og opprette krav' currentPage='Forvalte og opprette krav'>
      <div className='pb-52 w-full'>
        <ListPageHeader headingText='Forvalte og opprette krav'>
          {isKraveier() && (
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
}
