'use client'

import {
  getDashboardAvdelingStats,
  getDashboardStats,
  getTemaDashboardStats,
} from '@/api/dashboard/dashboardApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IAvdelingDashboardStats,
  ISeksjonOption,
  ITemaDashboardStats,
} from '@/constants/dashboard/dashboardConstants'
import { DownloadIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Heading, LocalAlert, Select, Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const KRAV_COLORS = {
  underArbeid: '#fa4d56',
  ferdigVurdert: '#005d5d',
}

const SUKSESS_COLORS = {
  underArbeid: '#1192e8',
  oppfylt: '#005d5d',
  ikkeOppfylt: '#fa4d56',
  ikkeRelevant: '#9f1853',
}

interface IBarSegment {
  name: string
  value: number
  color: string
}

const RechartsStackedBar = ({
  data,
  showPercentage,
}: {
  data: IBarSegment[]
  showPercentage?: boolean
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) return <BodyShort className='text-gray-500 mt-2'>Ingen data</BodyShort>

  const chartData = [
    data.reduce((acc, d) => ({ ...acc, [d.name]: d.value }), {} as Record<string, number>),
  ]

  return (
    <div style={{ marginTop: '12px', maxWidth: '300px' }}>
      <ResponsiveContainer width='100%' height={32}>
        <BarChart
          layout='vertical'
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis type='number' hide />
          <YAxis type='category' hide />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value)} (${Math.round((Number(value) / total) * 100)}%)`,
              String(name),
            ]}
          />
          {data
            .filter((d) => d.value > 0)
            .map((d) => (
              <Bar key={d.name} dataKey={d.name} stackId='stack' fill={d.color} />
            ))}
        </BarChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
        {data.map((d) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: d.color,
                flexShrink: 0,
              }}
            />
            <BodyShort size='small'>
              {d.name}{' '}
              <strong>
                {d.value}
                {showPercentage ? ` (${Math.round((d.value / total) * 100)}%)` : ''}
              </strong>
            </BodyShort>
          </div>
        ))}
      </div>
    </div>
  )
}

const TemaStatsCard = ({ stats }: { stats: ITemaDashboardStats }) => {
  const kravData: IBarSegment[] = [
    { name: 'Under arbeid', value: stats.kravUnderArbeid, color: KRAV_COLORS.underArbeid },
    { name: 'Ferdig vurdert', value: stats.kravFerdigVurdert, color: KRAV_COLORS.ferdigVurdert },
  ]

  const suksessData: IBarSegment[] = [
    {
      name: 'Under arbeid',
      value: stats.suksesskriterierUnderArbeid,
      color: SUKSESS_COLORS.underArbeid,
    },
    { name: 'Oppfylt', value: stats.suksesskriterierOppfylt, color: SUKSESS_COLORS.oppfylt },
    {
      name: 'Ikke oppfylt',
      value: stats.suksesskriterierIkkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value: stats.suksesskriterierIkkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  const totalSuksess =
    stats.suksesskriterierUnderArbeid +
    stats.suksesskriterierOppfylt +
    stats.suksesskriterierIkkeOppfylt +
    stats.suksesskriterierIkkeRelevant

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <Heading size='small' level='2'>
        {stats.temaName}
      </Heading>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginTop: '16px',
        }}
      >
        <div>
          <Heading size='xsmall' level='3'>
            Gjennomføringsstatus (krav) ({stats.kravTotal})
          </Heading>
          <RechartsStackedBar data={kravData} showPercentage />
        </div>

        <div>
          <Heading size='xsmall' level='3'>
            Etterlevelse (suksesskriterier) ({totalSuksess})
          </Heading>
          <RechartsStackedBar data={suksessData} />
        </div>
      </div>
    </div>
  )
}

const TemaStatsKeyMetrics = ({ stats }: { stats: ITemaDashboardStats }) => {
  const totalSuksess =
    stats.suksesskriterierUnderArbeid +
    stats.suksesskriterierOppfylt +
    stats.suksesskriterierIkkeOppfylt +
    stats.suksesskriterierIkkeRelevant

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <Heading size='small' level='2'>
        {stats.temaName}
      </Heading>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: '32px',
          rowGap: '16px',
          marginTop: '16px',
          whiteSpace: 'nowrap',
        }}
      >
        <div>
          <BodyShort weight='semibold'>Gjennomføringsstatus (krav) ({stats.kravTotal})</BodyShort>
          <BodyShort>
            Under arbeid <span className='font-bold'>{stats.kravUnderArbeid}</span>
          </BodyShort>
          <BodyShort>
            Ferdig vurdert <span className='font-bold'>{stats.kravFerdigVurdert}</span>
          </BodyShort>
        </div>

        <div>
          <BodyShort weight='semibold'>Etterlevelse (suksesskriterier) ({totalSuksess})</BodyShort>
          <BodyShort>
            Under arbeid <span className='font-bold'>{stats.suksesskriterierUnderArbeid}</span>
          </BodyShort>
          <BodyShort>
            Oppfylt <span className='font-bold'>{stats.suksesskriterierOppfylt}</span>
          </BodyShort>
          <BodyShort>
            Ikke oppfylt <span className='font-bold'>{stats.suksesskriterierIkkeOppfylt}</span>
          </BodyShort>
          <BodyShort>
            Ikke relevant <span className='font-bold'>{stats.suksesskriterierIkkeRelevant}</span>
          </BodyShort>
        </div>
      </div>
    </div>
  )
}

const exportToCsv = (stats: ITemaDashboardStats[]) => {
  const BOM = '\uFEFF'
  const header = [
    'Tema',
    'Krav totalt',
    'Krav under arbeid',
    'Krav ferdig vurdert',
    'Suksesskriterier under arbeid',
    'Suksesskriterier oppfylt',
    'Suksesskriterier ikke oppfylt',
    'Suksesskriterier ikke relevant',
  ].join(';')

  const rows = stats.map((s) =>
    [
      s.temaName,
      s.kravTotal,
      s.kravUnderArbeid,
      s.kravFerdigVurdert,
      s.suksesskriterierUnderArbeid,
      s.suksesskriterierOppfylt,
      s.suksesskriterierIkkeOppfylt,
      s.suksesskriterierIkkeRelevant,
    ].join(';')
  )

  const csv = BOM + [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `status-pr-tema-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const TemaDashboardPage = () => {
  const [temaStats, setTemaStats] = useState<ITemaDashboardStats[]>([])
  const [avdelinger, setAvdelinger] = useState<IAvdelingDashboardStats[]>([])
  const [seksjoner, setSeksjoner] = useState<ISeksjonOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTema, setSelectedTema] = useState<string>('')
  const [selectedAvdeling, setSelectedAvdeling] = useState<string>('')
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>('')

  useEffect(() => {
    getDashboardStats()
      .then(setAvdelinger)
      .catch((err) => console.error('Failed to fetch avdelinger:', err))
  }, [])

  useEffect(() => {
    setIsLoading(true)
    getTemaDashboardStats(selectedAvdeling || undefined, selectedSeksjon || undefined)
      .then(setTemaStats)
      .catch((err) => console.error('Failed to fetch tema stats:', err))
      .finally(() => setIsLoading(false))
  }, [selectedAvdeling, selectedSeksjon])

  useEffect(() => {
    if (selectedAvdeling) {
      getDashboardAvdelingStats(selectedAvdeling)
        .then((data) => setSeksjoner(data.seksjoner || []))
        .catch(() => setSeksjoner([]))
    } else {
      setSeksjoner([])
      setSelectedSeksjon('')
    }
  }, [selectedAvdeling])

  const filteredTemaStats = selectedTema
    ? temaStats.filter((s) => s.temaCode === selectedTema)
    : temaStats

  return (
    <PageLayout
      pageTitle='Etterlevelsestema'
      currentPage='Etterlevelsestema'
      breadcrumbPaths={[{ href: '/dashboard', pathName: 'Dashboard' }]}
    >
      <div className='flex justify-between items-center mt-4'>
        <Heading size='large' level='1'>
          Etterlevelsestema
        </Heading>
      </div>

      <LocalAlert status='announcement' className='mt-4'>
        <LocalAlert.Header>
          <LocalAlert.Title as='h2'>
            Obs! Disse sidene er fortsatt under utvikling.
          </LocalAlert.Title>
        </LocalAlert.Header>
        <LocalAlert.Content>
          Dersom dere finner feil eller har forslag til forbedringer, ta kontakt på #etterlevelse på
          slack.
        </LocalAlert.Content>
      </LocalAlert>

      <Heading size='medium' level='2' className='mt-6'>
        Tema
      </Heading>

      <div className='flex gap-4 mt-4 items-end'>
        <Select
          label='Velg tema'
          className='w-fit min-w-64'
          value={selectedTema}
          onChange={(e) => setSelectedTema(e.target.value)}
        >
          <option value=''>Alle temaer</option>
          {temaStats.map((t) => (
            <option key={t.temaCode} value={t.temaCode}>
              {t.temaName}
            </option>
          ))}
        </Select>

        <Select
          label='Filtrer etter avdeling'
          className='w-fit min-w-64'
          value={selectedAvdeling}
          onChange={(e) => {
            setSelectedAvdeling(e.target.value)
            setSelectedSeksjon('')
          }}
        >
          <option value=''>Alle avdelinger</option>
          {avdelinger.map((a) => (
            <option key={a.avdelingId} value={a.avdelingId}>
              {a.avdelingNavn}
            </option>
          ))}
        </Select>

        {selectedAvdeling && seksjoner.length > 0 && (
          <Select
            label='Filtrer etter seksjon'
            className='w-fit min-w-64'
            value={selectedSeksjon}
            onChange={(e) => setSelectedSeksjon(e.target.value)}
          >
            <option value=''>Alle seksjoner</option>
            {seksjoner.map((s) => (
              <option key={s.id} value={s.id}>
                {s.navn}
              </option>
            ))}
          </Select>
        )}

        <Button
          variant='tertiary'
          size='small'
          icon={<DownloadIcon aria-hidden />}
          onClick={() => exportToCsv(filteredTemaStats)}
          disabled={isLoading || filteredTemaStats.length === 0}
        >
          Last ned CSV
        </Button>
      </div>

      {isLoading && (
        <div className='mt-8'>
          <CenteredLoader />
        </div>
      )}

      {!isLoading && (
        <Tabs className='mt-4' defaultValue='figurer'>
          <Tabs.List>
            <Tabs.Tab value='figurer' label='Vis figurer' />
            <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
          </Tabs.List>

          <Tabs.Panel value='figurer'>
            <div className='flex flex-col gap-6 mt-6'>
              {filteredTemaStats.map((stats) => (
                <TemaStatsCard key={stats.temaCode} stats={stats} />
              ))}
              {filteredTemaStats.length === 0 && (
                <BodyShort className='text-gray-500'>Ingen data for valgt filter</BodyShort>
              )}
            </div>
          </Tabs.Panel>

          <Tabs.Panel value='nokkeltall'>
            <div className='flex flex-col gap-6 mt-6'>
              {filteredTemaStats.map((stats) => (
                <TemaStatsKeyMetrics key={stats.temaCode} stats={stats} />
              ))}
              {filteredTemaStats.length === 0 && (
                <BodyShort className='text-gray-500'>Ingen data for valgt filter</BodyShort>
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
      )}
    </PageLayout>
  )
}

export default TemaDashboardPage
