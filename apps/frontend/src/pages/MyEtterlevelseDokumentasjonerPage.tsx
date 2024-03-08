import EditEtterlevelseDokumentasjonModal from '../components/etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonModal'
import { DokumentasjonTabs } from '../components/etterlevelseDokumentasjon/tabs/DokumentasjonsTabs'
import { ListPageHeader } from '../components/scaffold/ListPageHeader'
import { PageLayout } from '../components/scaffold/Page'
import { ITeam } from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'

interface IDokumentasjonCount {
  dokumentasjonCount?: number
}

export type TCustomTeamObject = IDokumentasjonCount & ITeam

export const MyEtterlevelseDokumentasjonerPage = () => {
  ampli.logEvent('sidevisning', {
    side: 'Side for Dokumentasjoner',
    sidetittel: 'Dokumentere etterlevelse',
    ...userRoleEventProp,
  })

  return (
    <PageLayout pageTitle="Dokumentere etterlevelse" currentPage="Dokumentere etterlevelse">
      <div className="pb-52 w-full">
        <ListPageHeader headingText="Dokumentere etterlevelse">
          <EditEtterlevelseDokumentasjonModal />
        </ListPageHeader>

        <div className="flex justify-center w-full">
          <div className="w-full">
            <div className="pt-6">
              <DokumentasjonTabs />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export type TVariables = {
  pageNumber?: number
  pageSize?: number
  sistRedigert?: number
  mineEtterlevelseDokumentasjoner?: boolean
  sok?: string
  teams?: string[]
  behandlingId?: string
}
