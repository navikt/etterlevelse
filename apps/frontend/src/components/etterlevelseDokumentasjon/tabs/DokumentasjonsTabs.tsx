import { useQuery } from '@apollo/client'
import { Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { useMyTeams } from '../../../api/TeamApi'
import { emptyPage } from '../../../api/util/EmptyPageConstant'
import { IPageResponse, ITeam, TEtterlevelseDokumentasjonQL } from '../../../constants'
import { TCustomTeamObject, TVariables } from '../../../pages/MyEtterlevelseDokumentasjonerPage'
import { getEtterlevelseDokumentasjonListQuery } from '../../../query/EtterlevelseDokumentasjonQuery'
import { etterlevelseDokumentasjonerUrl } from '../../common/RouteLinkEtterlevelsesdokumentasjon'
import { AlleEtterlevelsesDokumentasjoner } from './AlleEtterlevelsesDokumentasjoner'
import BehandlingSok from './BehandlingSok'
import { MineEtterlevelseDokumentasjoner } from './MineEtterlevelseDokumentasjoner'
import { SisteEtterlevelseDokumentasjoner } from './SisteEtterlevelseDokumentasjoner'

type TSection = 'mine' | 'siste' | 'alle' | 'behandlingsok'

export const DokumentasjonTabs = () => {
  const params = useParams<{ tab?: TSection }>()
  const navigate: NavigateFunction = useNavigate()
  const [tab, setTab] = useState<TSection>(params.tab || 'mine')
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
    if (!doneLoading && tab === 'alle') setDoneLoading(true)
    if (!data || etterlevelseDokumentasjonLoading || doneLoading) return
    else if (tab === 'mine' && !etterlevelseDokumentasjoner.totalElements) setTab('siste')
    else if (tab === 'siste' && !etterlevelseDokumentasjoner.totalElements) setTab('alle')
    else setDoneLoading(true)
  }, [etterlevelseDokumentasjoner, etterlevelseDokumentasjonLoading])

  useEffect(() => {
    switch (tab) {
      case 'mine':
        setVariables({ mineEtterlevelseDokumentasjoner: true })
        break
      case 'siste':
        setVariables({ sistRedigert: 20 })
        break
    }
    if (tab !== params.tab) navigate(etterlevelseDokumentasjonerUrl(tab), { replace: true })
  }, [tab])

  useEffect(() => {
    setSortedTeams(sortTeams(teams))
  }, [teams])

  return (
    <Tabs
      defaultValue={tab}
      value={tab}
      onChange={(args) => {
        setTab(args as TSection)
        // ampli.logEvent('knapp klikket', {
        //   tekst: 'Valgt dokumentasjons Tab',
        //   pagePath: etterlevelseDokumentasjonerUrl(args),
        // })
        navigate(etterlevelseDokumentasjonerUrl(args))
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='mine' label='Mine dokumentasjoner' />
        <Tabs.Tab value='siste' label='Mine siste dokumentasjoner' />
        <Tabs.Tab value='alle' label='Alle' />
        <Tabs.Tab value='behandlingsok' label='Søk med behandling' />
      </Tabs.List>
      <Tabs.Panel value='mine'>
        <MineEtterlevelseDokumentasjoner
          teams={sortedTeams}
          etterlevelseDokumentasjoner={etterlevelseDokumentasjoner.content}
          loading={loading}
        />
      </Tabs.Panel>
      <Tabs.Panel value='siste'>
        <SisteEtterlevelseDokumentasjoner
          etterlevelseDokumentasjoner={etterlevelseDokumentasjoner.content}
          loading={loading}
        />
      </Tabs.Panel>
      <Tabs.Panel value='alle'>
        <AlleEtterlevelsesDokumentasjoner />
      </Tabs.Panel>
      <Tabs.Panel value='behandlingsok'>
        <BehandlingSok />
      </Tabs.Panel>
    </Tabs>
  )
}
