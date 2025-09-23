import { Button } from '@navikt/ds-react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { etterlevelseDokumentasjonCreateUrl } from '../components/common/RouteLinkEtterlevelsesdokumentasjon'
import { DokumentasjonTabs } from '../components/etterlevelseDokumentasjon/tabs/DokumentasjonsTabs'
import { ListPageHeader } from '../components/scaffold/ListPageHeader'
import { PageLayout } from '../components/scaffold/Page'
import { ITeam } from '../constants'

interface IDokumentasjonCount {
  dokumentasjonCount?: number
}

export type TCustomTeamObject = IDokumentasjonCount & ITeam

export const MyEtterlevelseDokumentasjonerPage = () => {
  const navigate: NavigateFunction = useNavigate()
  // ampli.logEvent('sidevisning', {
  //   side: 'Side for Dokumentasjoner',
  //   sidetittel: 'Dokumentere etterlevelse',
  //   ...userRoleEventProp,
  // })

  return (
    <PageLayout pageTitle='Dokumentere etterlevelse' currentPage='Dokumentere etterlevelse'>
      <div className='pb-52 w-full'>
        <ListPageHeader headingText='Dokumentere etterlevelse'>
          <Button
            onClick={() => {
              navigate(etterlevelseDokumentasjonCreateUrl)
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

export type TVariables = {
  pageNumber?: number
  pageSize?: number
  sistRedigert?: number
  mineEtterlevelseDokumentasjoner?: boolean
  sok?: string
  teams?: string[]
  behandlingId?: string
}
