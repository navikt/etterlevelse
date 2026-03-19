'use client'

import { useMyTeams } from '@/api/teamkatalogen/teamkatalogenApi'
import { IPageResponse } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ITeam } from '@/constants/teamkatalogen/teamkatalogConstants'
import { getEtterlevelseDokumentasjonListQuery } from '@/query/etterlevelseDokumentasjon/etterlevelseDokumentasjonQuery'
import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { emptyPage } from '@/util/common/emptyPageUtil'
import { useQuery } from '@apollo/client/react'
import { Tabs } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { AlleEtterlevelsesDokumentasjoner } from './tabs/alleEtterlevelsesDokumentasjoner'
import BehandlingSok from './tabs/behandlingSok'
import MineEtterlevelseDokumentasjoner from './tabs/mineEtterlevelseDokumentasjoner'
import { SisteEtterlevelseDokumentasjoner } from './tabs/sisteEtterlevelseDokumentasjoner'

enum ETab {
  MINE = 'mine',
  SISTE = 'siste',
  ALLE = 'alle',
  BEHANDLINGSOK = 'behandlingsok',
}

interface IDokumentasjonCount {
  dokumentasjonCount?: number
}

export type TCustomTeamObject = IDokumentasjonCount & ITeam

export const DokumentasjonTabs = () => {
  const router = useRouter()
  const queryParams = useSearchParams()

  const tabQuery = queryParams.get('tab')
  const selectedTab: ETab =
    tabQuery && Object.values(ETab).includes(tabQuery as ETab) ? (tabQuery as ETab) : ETab.MINE

  const variables = useMemo<TVariables>(() => {
    switch (selectedTab) {
      case ETab.MINE:
        return { mineEtterlevelseDokumentasjoner: true }
      case ETab.SISTE:
        return { sistRedigert: 20 }
      default:
        return {}
    }
  }, [selectedTab])

  const { data, loading: etterlevelseDokumentasjonLoading } = useQuery<
    { etterlevelseDokumentasjoner: IPageResponse<TEtterlevelseDokumentasjonQL> },
    TVariables
  >(getEtterlevelseDokumentasjonListQuery, {
    variables,
  })

  const [teams, teamsLoading] = useMyTeams()

  const etterlevelseDokumentasjoner = data?.etterlevelseDokumentasjoner || emptyPage

  const loading = teamsLoading || etterlevelseDokumentasjonLoading

  const sortTeams = (unSortedTeams: ITeam[]) => {
    return unSortedTeams
      .map((team) => {
        const teamDokumentasjoner = etterlevelseDokumentasjoner.content.filter((e) =>
          e.teamsData?.find((t2) => t2.id === team.id)
        )

        return {
          ...team,
          etterlevelseDokumentasjonCount: teamDokumentasjoner.length,
        }
      })
      .sort((a, b) => {
        if (a.etterlevelseDokumentasjonCount === 0) {
          return 1
        } else if (b.etterlevelseDokumentasjonCount === 0) {
          return -1
        } else {
          return a.name > b.name ? 1 : -1
        }
      })
  }

  const sortedTeams = useMemo(() => sortTeams(teams), [teams, etterlevelseDokumentasjoner])

  useEffect(() => {
    if (!data || etterlevelseDokumentasjonLoading) return
    else if (selectedTab === ETab.MINE && !etterlevelseDokumentasjoner.totalElements)
      router.push(etterlevelseDokumentasjonerUrl(ETab.SISTE))
    else if (selectedTab === ETab.SISTE && !etterlevelseDokumentasjoner.totalElements)
      router.push(etterlevelseDokumentasjonerUrl(ETab.ALLE))
  }, [
    data,
    etterlevelseDokumentasjonLoading,
    selectedTab,
    etterlevelseDokumentasjoner.totalElements,
    router,
  ])

  return (
    <Tabs
      defaultValue={ETab.MINE}
      value={selectedTab}
      onChange={(tabQuery: string) => {
        router.push(`/dokumentasjoner?tab=${tabQuery}`)
      }}
    >
      <Tabs.List>
        <Tabs.Tab value={ETab.MINE} label='Mine dokumentasjoner' />
        <Tabs.Tab value={ETab.SISTE} label='Siste dokumentasjoner' />
        <Tabs.Tab value={ETab.ALLE} label='Alle' />
        <Tabs.Tab value={ETab.BEHANDLINGSOK} label='Søk med behandling' />
      </Tabs.List>

      <Tabs.Panel value={ETab.MINE}>
        <MineEtterlevelseDokumentasjoner
          teams={sortedTeams}
          etterlevelseDokumentasjoner={etterlevelseDokumentasjoner.content}
          loading={loading}
        />
      </Tabs.Panel>
      <Tabs.Panel value={ETab.SISTE}>
        <SisteEtterlevelseDokumentasjoner
          etterlevelseDokumentasjoner={etterlevelseDokumentasjoner.content}
          loading={loading}
        />
      </Tabs.Panel>
      <Tabs.Panel value={ETab.ALLE}>
        <AlleEtterlevelsesDokumentasjoner />
      </Tabs.Panel>
      <Tabs.Panel value={ETab.BEHANDLINGSOK}>
        <BehandlingSok />
      </Tabs.Panel>
    </Tabs>
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

export default DokumentasjonTabs
