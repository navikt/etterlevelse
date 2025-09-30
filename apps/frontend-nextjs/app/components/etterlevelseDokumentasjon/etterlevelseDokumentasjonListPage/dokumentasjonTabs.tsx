'use client'

import { useMyTeams } from '@/api/teamkatalogen/teamkatalogenApi'
import { IPageResponse } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ITeam } from '@/constants/teamkatalogen/teamkatalogConstants'
import { getEtterlevelseDokumentasjonListQuery } from '@/query/etterlevelse/etterlevelseDokumentasjonQuery'
import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { emptyPage } from '@/util/common/emptyPageUtil'
import { useQuery } from '@apollo/client/react'
import { Tabs } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import MineEtterlevelseDokumentasjoner from './tabs/mineEtterlevelseDokumentasjoner'

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
  const [selectedTab, setSelectedTab] = useState<ETab>(ETab.MINE)

  const [doneLoading, setDoneLoading] = useState(false)
  const [variables, setVariables] = useState<TVariables>({})
  const { data, loading: etterlevelseDokumentasjonLoading } = useQuery<
    { etterlevelseDokumentasjoner: IPageResponse<TEtterlevelseDokumentasjonQL> },
    TVariables
  >(getEtterlevelseDokumentasjonListQuery, {
    variables,
  })

  const [teams, teamsLoading] = useMyTeams()

  const etterlevelseDokumentasjoner = data?.etterlevelseDokumentasjoner || emptyPage

  const loading = teamsLoading || etterlevelseDokumentasjonLoading

  const [sortedTeams, setSortedTeams] = useState<TCustomTeamObject[]>([])

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

  useEffect(() => {
    const tabQuery = queryParams.get('tab')

    if (tabQuery) {
      setSelectedTab(tabQuery as ETab)
    }
  }, [])

  useEffect(() => {
    const tabQuery = queryParams.get('tab')
    switch (selectedTab) {
      case ETab.MINE:
        setVariables({ mineEtterlevelseDokumentasjoner: true })
        break
      case ETab.SISTE:
        setVariables({ sistRedigert: 20 })
        break
    }
    if (selectedTab !== tabQuery) router.push(etterlevelseDokumentasjonerUrl(selectedTab))
  }, [selectedTab])

  useEffect(() => {
    setSortedTeams(sortTeams(teams))
  }, [teams])

  useEffect(() => {
    if (!doneLoading && selectedTab === ETab.ALLE) setDoneLoading(true)
    if (!data || etterlevelseDokumentasjonLoading || doneLoading) return
    else if (selectedTab === ETab.MINE && !etterlevelseDokumentasjoner.totalElements)
      setSelectedTab(ETab.SISTE)
    else if (selectedTab === ETab.SISTE && !etterlevelseDokumentasjoner.totalElements)
      setSelectedTab(ETab.ALLE)
    else setDoneLoading(true)
  }, [etterlevelseDokumentasjoner, etterlevelseDokumentasjonLoading])

  return (
    <Tabs
      defaultValue={ETab.MINE}
      value={selectedTab}
      onChange={(tabQuery: string) => {
        setSelectedTab(tabQuery as ETab)
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
      <Tabs.Panel value={ETab.SISTE}>Siste</Tabs.Panel>
      <Tabs.Panel value={ETab.ALLE}>Alle</Tabs.Panel>
      <Tabs.Panel value={ETab.BEHANDLINGSOK}>Behandlingsøk</Tabs.Panel>
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
