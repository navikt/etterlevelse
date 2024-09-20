import { PlusIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { useState } from 'react'
import { ListPageHeader } from '../components/scaffold/ListPageHeader'
import { PageLayout } from '../components/scaffold/Page'
import { AllVirkemiddel } from '../components/virkemiddelList/AllVirkemiddel'
import { ampli } from '../services/Amplitude'
import { user } from '../services/User'

export const VirkemiddelListPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  ampli.logEvent('sidevisning', {
    side: 'Kraveier side',
    sidetittel: 'Forvalte og opprette virkemiddel',
  })

  return (
    <PageLayout
      pageTitle="Forvalte og opprette virkemiddel"
      currentPage="Forvalte og opprette virkemiddel"
    >
      <div className="pb-52 w-full">
        <ListPageHeader headingText="Forvalte og opprette virkemiddel">
          {user.isKraveier() && (
            <Button
              iconPosition="left"
              icon={<PlusIcon area-label="" aria-hidden />}
              size="medium"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Nytt virkemiddel
            </Button>
          )}
        </ListPageHeader>

        <AllVirkemiddel
          isCreateModalOpen={isCreateModalOpen}
          setIsCreateModalOpen={setIsCreateModalOpen}
        />
      </div>
    </PageLayout>
  )
}
