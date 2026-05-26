'use client'

import {
  getDashboardAvdelingStats,
  getDashboardStats,
  getKravDashboardStats,
  getTemaDashboardStats,
} from '@/api/dashboard/dashboardApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IAvdelingDashboardStats,
  IKravDashboardStats,
  ISeksjonOption,
  ITemaDashboardStats,
} from '@/constants/dashboard/dashboardConstants'
import { DownloadIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Detail, Heading, LocalAlert, Select, Tabs, Tag } from '@navikt/ds-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RechartsStackedBar } from './RechartsStackedBar'
import {
  IBarSegment,
  KRAV_COLORS,
  SUKSESS_COLORS,
  formatPct,
  roundedPercentages,
} from './chartUtils'

interface IProps {
  temaCode: string
}

const KravStatsCard = ({ krav }: { krav: IKravDashboardStats }) => {
  const kravData: IBarSegment[] = [
    { name: 'Under arbeid', value: krav.antallUnderArbeid, color: KRAV_COLORS.underArbeid },
    { name: 'Ferdig vurdert', value: krav.antallFerdigVurdert, color: KRAV_COLORS.ferdigVurdert },
  ]

  const suksessData: IBarSegment[] = [
    {
      name: 'Under arbeid',
      value: krav.antallSuksesskriterierUnderArbeid,
      color: SUKSESS_COLORS.underArbeid,
    },
    { name: 'Oppfylt', value: krav.antallSuksesskriterierOppfylt, color: SUKSESS_COLORS.oppfylt },
    {
      name: 'Ikke oppfylt',
      value: krav.antallSuksesskriterierIkkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value: krav.antallSuksesskriterierIkkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  const ferdigSuksessData: IBarSegment[] = [
    {
      name: 'Oppfylt',
      value: krav.antallFerdigUtfyltKravSuksesskriterierOppfylt,
      color: SUKSESS_COLORS.oppfylt,
    },
    {
      name: 'Ikke oppfylt',
      value: krav.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value: krav.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  const ikkeFerdigSuksessData: IBarSegment[] = [
    {
      name: 'Under arbeid',
      value: krav.antallSuksesskriterierUnderArbeid,
      color: SUKSESS_COLORS.underArbeid,
    },
    {
      name: 'Oppfylt',
      value:
        krav.antallSuksesskriterierOppfylt - krav.antallFerdigUtfyltKravSuksesskriterierOppfylt,
      color: SUKSESS_COLORS.oppfylt,
    },
    {
      name: 'Ikke oppfylt',
      value:
        krav.antallSuksesskriterierIkkeOppfylt -
        krav.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value:
        krav.antallSuksesskriterierIkkeRelevant -
        krav.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <Detail>
        <strong>
          K{krav.kravNummer}.{krav.kravVersjon}
        </strong>
      </Detail>
      <Heading size='small' level='3'>
        {krav.kravNavn}
      </Heading>
      <Detail className='uppercase mt-2'>{krav.etterlevelseTotal} etterlevelsesdokumenter</Detail>
      {krav.kravStatus === 'UTGAATT' && (
        <div className='mt-1'>
          <Tag variant='error' className='h-fit'>
            <Detail className='whitespace-nowrap'>Utgått uten ny versjon</Detail>
          </Tag>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4'>
        <div>
          <Heading size='xsmall' level='4' className='min-h-12'>
            Gjennomføringsstatus (krav) ({krav.etterlevelseTotal})
          </Heading>
          <RechartsStackedBar data={kravData} showPercentage />
        </div>

        <div>
          <Heading size='xsmall' level='4' className='min-h-12'>
            Etterlevelse (suksesskriterier)
          </Heading>
          <RechartsStackedBar data={suksessData} percentageOnly />
        </div>

        <div>
          <Heading size='xsmall' level='4' className='min-h-12'>
            Suksesskriterier der kravet er ferdig utfylt
          </Heading>
          <RechartsStackedBar data={ferdigSuksessData} percentageOnly />
        </div>

        <div>
          <Heading size='xsmall' level='4' className='min-h-12'>
            Suksesskriterier der kravet ikke er ferdig utfylt
          </Heading>
          <RechartsStackedBar data={ikkeFerdigSuksessData} percentageOnly />
        </div>
      </div>
    </div>
  )
}

const exportKravToCsv = (
  kravStats: IKravDashboardStats[],
  temaName: string,
  filters: { avdeling?: string; seksjon?: string }
) => {
  const BOM = '\uFEFF'

  const filterLines = [
    `Tema;${temaName}`,
    `Avdeling;${filters.avdeling || 'Alle avdelinger'}`,
    `Seksjon;${filters.seksjon || 'Alle seksjoner'}`,
    '',
  ]

  const header = [
    'Kravnavn',
    'Status',
    'Antall etterlevelser totalt',
    'Etterlevelser under arbeid',
    'Etterlevelser ferdig vurdert',
    'Alle suksesskriterier - under arbeid',
    'Alle suksesskriterier - oppfylt',
    'Alle suksesskriterier - ikke oppfylt',
    'Alle suksesskriterier - ikke relevant',
    'Ferdig utfylt krav suksesskriterier - oppfylt',
    'Ferdig utfylt krav suksesskriterier - ikke oppfylt',
    'Ferdig utfylt krav suksesskriterier - ikke relevant',
    'Ikke ferdig utfylt krav suksesskriterier - under arbeid',
    'Ikke ferdig utfylt krav suksesskriterier - oppfylt',
    'Ikke ferdig utfylt krav suksesskriterier - ikke oppfylt',
    'Ikke ferdig utfylt krav suksesskriterier - ikke relevant',
  ].join(';')

  const escapeCsvField = (field: string | number) => {
    const str = String(field)
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = kravStats.map((k) =>
    [
      escapeCsvField(`K${k.kravNummer} ${k.kravNavn}`),
      escapeCsvField(k.kravStatus),
      k.etterlevelseTotal,
      k.antallUnderArbeid,
      k.antallFerdigVurdert,
      k.antallSuksesskriterierUnderArbeid,
      k.antallSuksesskriterierOppfylt,
      k.antallSuksesskriterierIkkeOppfylt,
      k.antallSuksesskriterierIkkeRelevant,
      k.antallFerdigUtfyltKravSuksesskriterierOppfylt,
      k.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt,
      k.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant,
      k.antallSuksesskriterierUnderArbeid,
      k.antallSuksesskriterierOppfylt - k.antallFerdigUtfyltKravSuksesskriterierOppfylt,
      k.antallSuksesskriterierIkkeOppfylt - k.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt,
      k.antallSuksesskriterierIkkeRelevant - k.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant,
    ].join(';')
  )

  const csv = BOM + [...filterLines, header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `krav-${temaName}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const TemaDetailPage = ({ temaCode }: IProps) => {
  const [temaStats, setTemaStats] = useState<ITemaDashboardStats | null>(null)
  const [kravStats, setKravStats] = useState<IKravDashboardStats[]>([])
  const [avdelinger, setAvdelinger] = useState<IAvdelingDashboardStats[]>([])
  const [seksjoner, setSeksjoner] = useState<ISeksjonOption[]>([])
  const [kravSeksjoner, setKravSeksjoner] = useState<ISeksjonOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isKravLoading, setIsKravLoading] = useState(true)
  const [selectedAvdeling, setSelectedAvdeling] = useState<string>('')
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>('')
  const [selectedKravAvdeling, setSelectedKravAvdeling] = useState<string>('')
  const [selectedKravSeksjon, setSelectedKravSeksjon] = useState<string>('')
  const [selectedKrav] = useState<string>('')
  const temaRequestId = useRef(0)
  const kravRequestId = useRef(0)
  const seksjonRequestId = useRef(0)
  const kravSeksjonRequestId = useRef(0)

  useEffect(() => {
    getDashboardStats()
      .then(setAvdelinger)
      .catch((err) => console.error('Failed to fetch avdelinger:', err))
  }, [])

  useEffect(() => {
    const requestId = ++temaRequestId.current
    getTemaDashboardStats(temaCode, selectedAvdeling || undefined, selectedSeksjon || undefined)
      .then((data) => {
        if (requestId === temaRequestId.current) {
          setTemaStats(data[0] || null)
        }
      })
      .catch((err) => console.error('Failed to fetch tema stats:', err))
      .finally(() => {
        if (requestId === temaRequestId.current) {
          setIsLoading(false)
        }
      })
  }, [temaCode, selectedAvdeling, selectedSeksjon])

  useEffect(() => {
    const requestId = ++kravRequestId.current
    getKravDashboardStats(
      temaCode,
      selectedKravAvdeling || undefined,
      selectedKravSeksjon || undefined
    )
      .then((data) => {
        if (requestId === kravRequestId.current) {
          setKravStats(data)
        }
      })
      .catch((err) => console.error('Failed to fetch krav stats:', err))
      .finally(() => {
        if (requestId === kravRequestId.current) {
          setIsKravLoading(false)
        }
      })
  }, [temaCode, selectedKravAvdeling, selectedKravSeksjon])

  useEffect(() => {
    const requestId = ++seksjonRequestId.current
    if (selectedAvdeling) {
      getDashboardAvdelingStats(selectedAvdeling)
        .then((data) => {
          if (requestId === seksjonRequestId.current) {
            setSeksjoner(data.seksjoner || [])
          }
        })
        .catch(() => {
          if (requestId === seksjonRequestId.current) {
            setSeksjoner([])
          }
        })
    }
  }, [selectedAvdeling])

  useEffect(() => {
    const requestId = ++kravSeksjonRequestId.current
    if (selectedKravAvdeling) {
      getDashboardAvdelingStats(selectedKravAvdeling)
        .then((data) => {
          if (requestId === kravSeksjonRequestId.current) {
            setKravSeksjoner(data.seksjoner || [])
          }
        })
        .catch(() => {
          if (requestId === kravSeksjonRequestId.current) {
            setKravSeksjoner([])
          }
        })
    }
  }, [selectedKravAvdeling])

  const filteredKrav = useMemo(() => {
    if (!kravStats) return []
    if (selectedKrav) return kravStats.filter((k) => k.kravId === selectedKrav)
    return kravStats
  }, [kravStats, selectedKrav])

  const sortedKrav = useMemo(() => {
    if (!filteredKrav) return []
    return filteredKrav
  }, [filteredKrav])

  if (isLoading && !temaStats) {
    return (
      <PageLayout pageTitle='Dashboard' currentPage='Dashboard' breadcrumbPaths={[]}>
        <CenteredLoader />
      </PageLayout>
    )
  }

  const temaName = temaStats?.temaName || temaCode

  const kravData: IBarSegment[] = temaStats
    ? [
        { name: 'Under arbeid', value: temaStats.kravUnderArbeid, color: KRAV_COLORS.underArbeid },
        {
          name: 'Ferdig vurdert',
          value: temaStats.kravFerdigVurdert,
          color: KRAV_COLORS.ferdigVurdert,
        },
      ]
    : []

  const suksessData: IBarSegment[] = temaStats
    ? [
        {
          name: 'Under arbeid',
          value: temaStats.suksesskriterierUnderArbeid,
          color: SUKSESS_COLORS.underArbeid,
        },
        {
          name: 'Oppfylt',
          value: temaStats.suksesskriterierOppfylt,
          color: SUKSESS_COLORS.oppfylt,
        },
        {
          name: 'Ikke oppfylt',
          value: temaStats.suksesskriterierIkkeOppfylt,
          color: SUKSESS_COLORS.ikkeOppfylt,
        },
        {
          name: 'Ikke relevant',
          value: temaStats.suksesskriterierIkkeRelevant,
          color: SUKSESS_COLORS.ikkeRelevant,
        },
      ]
    : []

  const ferdigSuksessData: IBarSegment[] = temaStats
    ? [
        {
          name: 'Oppfylt',
          value: temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0,
          color: SUKSESS_COLORS.oppfylt,
        },
        {
          name: 'Ikke oppfylt',
          value: temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0,
          color: SUKSESS_COLORS.ikkeOppfylt,
        },
        {
          name: 'Ikke relevant',
          value: temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0,
          color: SUKSESS_COLORS.ikkeRelevant,
        },
      ]
    : []

  const ikkeFerdigSuksessData: IBarSegment[] = temaStats
    ? [
        {
          name: 'Under arbeid',
          value: temaStats.suksesskriterierUnderArbeid,
          color: SUKSESS_COLORS.underArbeid,
        },
        {
          name: 'Oppfylt',
          value:
            temaStats.suksesskriterierOppfylt -
            (temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0),
          color: SUKSESS_COLORS.oppfylt,
        },
        {
          name: 'Ikke oppfylt',
          value:
            temaStats.suksesskriterierIkkeOppfylt -
            (temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0),
          color: SUKSESS_COLORS.ikkeOppfylt,
        },
        {
          name: 'Ikke relevant',
          value:
            temaStats.suksesskriterierIkkeRelevant -
            (temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0),
          color: SUKSESS_COLORS.ikkeRelevant,
        },
      ]
    : []

  return (
    <PageLayout
      pageTitle={`Tema: ${temaName}`}
      currentPage={temaName}
      breadcrumbPaths={[
        { href: '/dashboard', pathName: 'Dashboard' },
        { href: '/dashboard/tema', pathName: 'Tema' },
      ]}
    >
      <div className='mt-4'>
        <Heading size='large' level='1'>
          Tema: {temaName}
        </Heading>
      </div>

      <LocalAlert status='announcement' className='mt-4' aria-live='off'>
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

      <div className='rounded-lg p-6 mt-8' style={{ backgroundColor: '#e3eff7' }}>
        <Heading size='medium' level='2'>
          Overordnet for {temaName}
        </Heading>
        <div className='grid grid-cols-1 sm:flex sm:flex-row sm:flex-wrap gap-4 mt-4 sm:items-end'>
          <Select
            label='Filtrer etter avdeling'
            className='sm:w-fit sm:min-w-64'
            style={{ width: '100%' }}
            value={selectedAvdeling}
            onChange={(e) => {
              setSelectedAvdeling(e.target.value)
              setSelectedSeksjon('')
              setIsLoading(true)
              if (!e.target.value) {
                setSeksjoner([])
              }
            }}
          >
            <option value=''>Alle avdelinger</option>
            {avdelinger.map((a) => (
              <option key={a.avdelingId} value={a.avdelingId}>
                {a.avdelingNavn}
              </option>
            ))}
          </Select>

          {(() => {
            const avdelingNavn = avdelinger.find(
              (a) => a.avdelingId === selectedAvdeling
            )?.avdelingNavn
            const filteredSeksjoner = seksjoner.filter(
              (s) => s.navn !== avdelingNavn && s.id !== 'ingen-seksjon'
            )
            return selectedAvdeling && filteredSeksjoner.length > 0 ? (
              <Select
                label='Filtrer etter seksjon'
                className='sm:w-fit sm:min-w-64'
                style={{ width: '100%' }}
                value={selectedSeksjon}
                onChange={(e) => {
                  setSelectedSeksjon(e.target.value)
                  setIsLoading(true)
                }}
              >
                <option value=''>Alle seksjoner</option>
                {filteredSeksjoner.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.navn}
                  </option>
                ))}
              </Select>
            ) : null
          })()}

          <Button
            variant='tertiary'
            size='small'
            icon={<DownloadIcon aria-hidden />}
            onClick={() => {
              if (!temaStats) return
              const BOM = '\uFEFF'
              const filterLines = [
                `Tema;${temaName}`,
                `Avdeling;${avdelinger.find((a) => a.avdelingId === selectedAvdeling)?.avdelingNavn || 'Alle avdelinger'}`,
                `Seksjon;${seksjoner.find((s) => s.id === selectedSeksjon)?.navn || 'Alle seksjoner'}`,
                '',
              ]
              const header = [
                'Krav totalt',
                'Krav under arbeid',
                'Krav ferdig vurdert',
                'Suksesskriterier under arbeid',
                'Suksesskriterier oppfylt',
                'Suksesskriterier ikke oppfylt',
                'Suksesskriterier ikke relevant',
                'Ferdig utfylt krav - suksesskriterier oppfylt',
                'Ferdig utfylt krav - suksesskriterier ikke oppfylt',
                'Ferdig utfylt krav - suksesskriterier ikke relevant',
                'Ikke ferdig utfylt krav - suksesskriterier under arbeid',
                'Ikke ferdig utfylt krav - suksesskriterier oppfylt',
                'Ikke ferdig utfylt krav - suksesskriterier ikke oppfylt',
                'Ikke ferdig utfylt krav - suksesskriterier ikke relevant',
              ].join(';')
              const row = [
                temaStats.kravTotal,
                temaStats.kravUnderArbeid,
                temaStats.kravFerdigVurdert,
                temaStats.suksesskriterierUnderArbeid,
                temaStats.suksesskriterierOppfylt,
                temaStats.suksesskriterierIkkeOppfylt,
                temaStats.suksesskriterierIkkeRelevant,
                temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0,
                temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0,
                temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0,
                temaStats.suksesskriterierUnderArbeid,
                temaStats.suksesskriterierOppfylt -
                  (temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0),
                temaStats.suksesskriterierIkkeOppfylt -
                  (temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0),
                temaStats.suksesskriterierIkkeRelevant -
                  (temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0),
              ].join(';')
              const csv = BOM + [...filterLines, header, row].join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `overordnet-${temaName}-${new Date().toISOString().slice(0, 10)}.csv`
              link.click()
              URL.revokeObjectURL(url)
            }}
            disabled={isLoading || !temaStats}
            className='pr-4'
          >
            Last ned nøkkeltall utvalg som CSV
          </Button>
        </div>

        {temaStats && (
          <Tabs className='mt-6' defaultValue='figurer'>
            <Tabs.List>
              <Tabs.Tab value='figurer' label='Vis figurer' />
              <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
            </Tabs.List>
            <Tabs.Panel value='figurer'>
              <div className='border border-gray-300 rounded-lg p-6 bg-white mt-6'>
                <Detail uppercase className='mb-4'>
                  {(temaStats.etterlevelseDokumentCount ?? 0).toLocaleString('nb-NO')}{' '}
                  ETTERLEVELSESDOKUMENTER
                </Detail>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
                  <div>
                    <Heading size='xsmall' level='3' className='min-h-[3rem]'>
                      Vurdering av etterlevelseskrav
                    </Heading>
                    <RechartsStackedBar data={kravData} percentageOnly />
                  </div>
                  <div>
                    <Heading size='xsmall' level='3' className='min-h-[3rem]'>
                      Etterlevelse: suksesskriterier
                    </Heading>
                    <RechartsStackedBar data={suksessData} percentageOnly />
                  </div>
                  <div>
                    <Heading size='xsmall' level='3' className='min-h-[3rem]'>
                      Suksesskriterier der kravet er ferdig utfylt
                    </Heading>
                    <RechartsStackedBar data={ferdigSuksessData} percentageOnly />
                  </div>
                  <div>
                    <Heading size='xsmall' level='3' className='min-h-[3rem]'>
                      Suksesskriterier der kravet ikke er ferdig utfylt
                    </Heading>
                    <RechartsStackedBar data={ikkeFerdigSuksessData} percentageOnly />
                  </div>
                </div>
              </div>
            </Tabs.Panel>
            <Tabs.Panel value='nokkeltall'>
              <div className='border border-gray-300 rounded-lg p-6 bg-white mt-6'>
                <Detail uppercase className='mb-4'>
                  {(temaStats.etterlevelseDokumentCount ?? 0).toLocaleString('nb-NO')}{' '}
                  ETTERLEVELSESDOKUMENTER
                </Detail>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-4'>
                  <div>
                    {(() => {
                      const kravPcts = roundedPercentages([
                        temaStats.kravUnderArbeid,
                        temaStats.kravFerdigVurdert,
                      ])
                      return (
                        <>
                          <Heading size='xsmall' level='3' className='mb-2'>
                            Gjennomføringsstatus: krav ({temaStats.kravTotal})
                          </Heading>
                          <BodyShort>
                            Under arbeid{' '}
                            <span className='font-bold'>{temaStats.kravUnderArbeid}</span>
                            {temaStats.kravTotal > 0 &&
                              ` (${formatPct(kravPcts[0], temaStats.kravUnderArbeid)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ferdig vurdert{' '}
                            <span className='font-bold'>{temaStats.kravFerdigVurdert}</span>
                            {temaStats.kravTotal > 0 &&
                              ` (${formatPct(kravPcts[1], temaStats.kravFerdigVurdert)}%)`}
                          </BodyShort>
                        </>
                      )
                    })()}
                  </div>
                  <div>
                    {(() => {
                      const totalSuksess =
                        temaStats.suksesskriterierUnderArbeid +
                        temaStats.suksesskriterierOppfylt +
                        temaStats.suksesskriterierIkkeOppfylt +
                        temaStats.suksesskriterierIkkeRelevant
                      const sukPcts = roundedPercentages([
                        temaStats.suksesskriterierUnderArbeid,
                        temaStats.suksesskriterierOppfylt,
                        temaStats.suksesskriterierIkkeOppfylt,
                        temaStats.suksesskriterierIkkeRelevant,
                      ])
                      return (
                        <>
                          <Heading size='xsmall' level='3' className='mb-2'>
                            Etterlevelse: suksesskriterier ({totalSuksess})
                          </Heading>
                          <BodyShort>
                            Under arbeid{' '}
                            <span className='font-bold'>
                              {temaStats.suksesskriterierUnderArbeid}
                            </span>
                            {totalSuksess > 0 &&
                              ` (${formatPct(sukPcts[0], temaStats.suksesskriterierUnderArbeid)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Oppfylt{' '}
                            <span className='font-bold'>{temaStats.suksesskriterierOppfylt}</span>
                            {totalSuksess > 0 &&
                              ` (${formatPct(sukPcts[1], temaStats.suksesskriterierOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke oppfylt{' '}
                            <span className='font-bold'>
                              {temaStats.suksesskriterierIkkeOppfylt}
                            </span>
                            {totalSuksess > 0 &&
                              ` (${formatPct(sukPcts[2], temaStats.suksesskriterierIkkeOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke relevant{' '}
                            <span className='font-bold'>
                              {temaStats.suksesskriterierIkkeRelevant}
                            </span>
                            {totalSuksess > 0 &&
                              ` (${formatPct(sukPcts[3], temaStats.suksesskriterierIkkeRelevant)}%)`}
                          </BodyShort>
                        </>
                      )
                    })()}
                  </div>
                  <div>
                    {(() => {
                      const totalFerdig =
                        (temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0) +
                        (temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0) +
                        (temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0)
                      const ferdigPcts = roundedPercentages([
                        temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0,
                        temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0,
                        temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0,
                      ])
                      return (
                        <>
                          <Heading size='xsmall' level='3' className='mb-2'>
                            Suksesskriterier der kravet er ferdig utfylt ({totalFerdig})
                          </Heading>
                          <BodyShort>
                            Oppfylt{' '}
                            <span className='font-bold'>
                              {temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0}
                            </span>
                            {totalFerdig > 0 &&
                              ` (${formatPct(ferdigPcts[0], temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke oppfylt{' '}
                            <span className='font-bold'>
                              {temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0}
                            </span>
                            {totalFerdig > 0 &&
                              ` (${formatPct(ferdigPcts[1], temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke relevant{' '}
                            <span className='font-bold'>
                              {temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0}
                            </span>
                            {totalFerdig > 0 &&
                              ` (${formatPct(ferdigPcts[2], temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0)}%)`}
                          </BodyShort>
                        </>
                      )
                    })()}
                  </div>
                  <div>
                    {(() => {
                      const ikkeFerdigUnderArbeid = temaStats.suksesskriterierUnderArbeid
                      const ikkeFerdigOppfylt =
                        temaStats.suksesskriterierOppfylt -
                        (temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0)
                      const ikkeFerdigIkkeOppfylt =
                        temaStats.suksesskriterierIkkeOppfylt -
                        (temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0)
                      const ikkeFerdigIkkeRelevant =
                        temaStats.suksesskriterierIkkeRelevant -
                        (temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0)
                      const totalIkkeFerdig =
                        ikkeFerdigUnderArbeid +
                        ikkeFerdigOppfylt +
                        ikkeFerdigIkkeOppfylt +
                        ikkeFerdigIkkeRelevant
                      const ikkeFerdigPcts = roundedPercentages([
                        ikkeFerdigUnderArbeid,
                        ikkeFerdigOppfylt,
                        ikkeFerdigIkkeOppfylt,
                        ikkeFerdigIkkeRelevant,
                      ])
                      return (
                        <>
                          <Heading size='xsmall' level='3' className='mb-2'>
                            Suksesskriterier der kravet ikke er ferdig utfylt ({totalIkkeFerdig})
                          </Heading>
                          <BodyShort>
                            Under arbeid <span className='font-bold'>{ikkeFerdigUnderArbeid}</span>
                            {totalIkkeFerdig > 0 &&
                              ` (${formatPct(ikkeFerdigPcts[0], ikkeFerdigUnderArbeid)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Oppfylt <span className='font-bold'>{ikkeFerdigOppfylt}</span>
                            {totalIkkeFerdig > 0 &&
                              ` (${formatPct(ikkeFerdigPcts[1], ikkeFerdigOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke oppfylt <span className='font-bold'>{ikkeFerdigIkkeOppfylt}</span>
                            {totalIkkeFerdig > 0 &&
                              ` (${formatPct(ikkeFerdigPcts[2], ikkeFerdigIkkeOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke relevant{' '}
                            <span className='font-bold'>{ikkeFerdigIkkeRelevant}</span>
                            {totalIkkeFerdig > 0 &&
                              ` (${formatPct(ikkeFerdigPcts[3], ikkeFerdigIkkeRelevant)}%)`}
                          </BodyShort>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </Tabs.Panel>
          </Tabs>
        )}
      </div>

      <div className='rounded-lg p-6 mt-8' style={{ backgroundColor: '#e3eff7' }}>
        <Heading size='medium' level='2'>
          Krav tilknyttet {temaName}
        </Heading>
        <div className='grid grid-cols-1 sm:flex sm:flex-row sm:flex-wrap gap-4 mt-4 sm:items-end'>
          {/* ToDo This Select is used to selct krav and filter by krav. Waiting for user feedback */}
          {/* <Select
          label='Velg krav'
          className='sm:w-fit sm:min-w-64'
          style={{ width: '100%' }}
          value={selectedKrav}
          onChange={(e) => setSelectedKrav(e.target.value)}
        >
          <option value=''>Alle krav</option>
          {kravStats.map((k) => (
            <option key={k.kravId} value={k.kravId}>
              {k.kravNavn}
            </option>
          ))}
        </Select> */}

          <Select
            label='Filtrer etter avdeling'
            className='sm:w-fit sm:min-w-64'
            style={{ width: '100%' }}
            value={selectedKravAvdeling}
            onChange={(e) => {
              setSelectedKravAvdeling(e.target.value)
              setSelectedKravSeksjon('')
              setIsKravLoading(true)
              if (!e.target.value) {
                setKravSeksjoner([])
              }
            }}
          >
            <option value=''>Alle avdelinger</option>
            {avdelinger.map((a) => (
              <option key={a.avdelingId} value={a.avdelingId}>
                {a.avdelingNavn}
              </option>
            ))}
          </Select>

          {(() => {
            const avdelingNavn = avdelinger.find(
              (a) => a.avdelingId === selectedKravAvdeling
            )?.avdelingNavn
            const filteredSeksjoner = kravSeksjoner.filter(
              (s) => s.navn !== avdelingNavn && s.id !== 'ingen-seksjon'
            )
            return selectedKravAvdeling && filteredSeksjoner.length > 0 ? (
              <Select
                label='Filtrer etter seksjon'
                className='sm:w-fit sm:min-w-64'
                style={{ width: '100%' }}
                value={selectedKravSeksjon}
                onChange={(e) => {
                  setSelectedKravSeksjon(e.target.value)
                  setIsKravLoading(true)
                }}
              >
                <option value=''>Alle seksjoner</option>
                {filteredSeksjoner.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.navn}
                  </option>
                ))}
              </Select>
            ) : null
          })()}

          <Button
            variant='tertiary'
            size='small'
            icon={<DownloadIcon aria-hidden />}
            onClick={() =>
              exportKravToCsv(filteredKrav, temaName, {
                avdeling: avdelinger.find((a) => a.avdelingId === selectedKravAvdeling)
                  ?.avdelingNavn,
                seksjon: kravSeksjoner.find((s) => s.id === selectedKravSeksjon)?.navn,
              })
            }
            disabled={isKravLoading || filteredKrav.length === 0}
            className='pr-4'
          >
            Last ned nøkkeltall utvalg som CSV
          </Button>
        </div>

        {isKravLoading && <CenteredLoader />}

        {!isKravLoading && (
          <Tabs className='mt-6' defaultValue='figurer'>
            <Tabs.List>
              <Tabs.Tab value='figurer' label='Vis figurer' />
              <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
            </Tabs.List>
            <Tabs.Panel value='figurer'>
              <div className='flex flex-col gap-6 mt-6'>
                {sortedKrav.map((krav) => (
                  <KravStatsCard key={krav.kravId} krav={krav} />
                ))}
                {sortedKrav.length === 0 && (
                  <BodyShort className='text-gray-500'>Ingen krav for dette temaet</BodyShort>
                )}
              </div>
            </Tabs.Panel>
            <Tabs.Panel value='nokkeltall'>
              <div className='flex flex-col gap-6 mt-6'>
                {sortedKrav.map((krav) => {
                  const kravTotal = krav.antallUnderArbeid + krav.antallFerdigVurdert
                  const kravPcts = roundedPercentages([
                    krav.antallUnderArbeid,
                    krav.antallFerdigVurdert,
                  ])
                  const totalSuksess =
                    krav.antallSuksesskriterierUnderArbeid +
                    krav.antallSuksesskriterierOppfylt +
                    krav.antallSuksesskriterierIkkeOppfylt +
                    krav.antallSuksesskriterierIkkeRelevant
                  const sukPcts = roundedPercentages([
                    krav.antallSuksesskriterierUnderArbeid,
                    krav.antallSuksesskriterierOppfylt,
                    krav.antallSuksesskriterierIkkeOppfylt,
                    krav.antallSuksesskriterierIkkeRelevant,
                  ])
                  const totalFerdig =
                    krav.antallFerdigUtfyltKravSuksesskriterierOppfylt +
                    krav.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt +
                    krav.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant
                  const ferdigPcts = roundedPercentages([
                    krav.antallFerdigUtfyltKravSuksesskriterierOppfylt,
                    krav.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt,
                    krav.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant,
                  ])
                  const ikkeFerdigUnderArbeid = krav.antallSuksesskriterierUnderArbeid
                  const ikkeFerdigOppfylt =
                    krav.antallSuksesskriterierOppfylt -
                    krav.antallFerdigUtfyltKravSuksesskriterierOppfylt
                  const ikkeFerdigIkkeOppfylt =
                    krav.antallSuksesskriterierIkkeOppfylt -
                    krav.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt
                  const ikkeFerdigIkkeRelevant =
                    krav.antallSuksesskriterierIkkeRelevant -
                    krav.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant
                  const totalIkkeFerdig =
                    ikkeFerdigUnderArbeid +
                    ikkeFerdigOppfylt +
                    ikkeFerdigIkkeOppfylt +
                    ikkeFerdigIkkeRelevant
                  const ikkeFerdigPcts = roundedPercentages([
                    ikkeFerdigUnderArbeid,
                    ikkeFerdigOppfylt,
                    ikkeFerdigIkkeOppfylt,
                    ikkeFerdigIkkeRelevant,
                  ])

                  return (
                    <div
                      key={krav.kravId}
                      className='border border-gray-300 rounded-lg p-6 bg-white'
                    >
                      <Detail>
                        <strong>
                          K{krav.kravNummer}.{krav.kravVersjon}
                        </strong>
                      </Detail>
                      <Heading size='small' level='3'>
                        {krav.kravNavn}
                      </Heading>
                      {krav.kravStatus === 'UTGAATT' && (
                        <div className='mt-1'>
                          <Tag variant='error' className='h-fit'>
                            <Detail className='whitespace-nowrap'>Utgått uten ny versjon</Detail>
                          </Tag>
                        </div>
                      )}
                      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-4 mt-4'>
                        <div>
                          <Heading size='xsmall' level='4' className='mb-2'>
                            Gjennomføringsstatus: krav ({kravTotal})
                          </Heading>
                          <BodyShort>
                            Under arbeid <span className='font-bold'>{krav.antallUnderArbeid}</span>
                            {kravTotal > 0 &&
                              ` (${formatPct(kravPcts[0], krav.antallUnderArbeid)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ferdig vurdert{' '}
                            <span className='font-bold'>{krav.antallFerdigVurdert}</span>
                            {kravTotal > 0 &&
                              ` (${formatPct(kravPcts[1], krav.antallFerdigVurdert)}%)`}
                          </BodyShort>
                        </div>
                        <div>
                          <Heading size='xsmall' level='4' className='mb-2'>
                            Etterlevelse: suksesskriterier ({totalSuksess})
                          </Heading>
                          <BodyShort>
                            Under arbeid{' '}
                            <span className='font-bold'>
                              {krav.antallSuksesskriterierUnderArbeid}
                            </span>
                            {totalSuksess > 0 &&
                              ` (${formatPct(sukPcts[0], krav.antallSuksesskriterierUnderArbeid)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Oppfylt{' '}
                            <span className='font-bold'>{krav.antallSuksesskriterierOppfylt}</span>
                            {totalSuksess > 0 &&
                              ` (${formatPct(sukPcts[1], krav.antallSuksesskriterierOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke oppfylt{' '}
                            <span className='font-bold'>
                              {krav.antallSuksesskriterierIkkeOppfylt}
                            </span>
                            {totalSuksess > 0 &&
                              ` (${formatPct(sukPcts[2], krav.antallSuksesskriterierIkkeOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke relevant{' '}
                            <span className='font-bold'>
                              {krav.antallSuksesskriterierIkkeRelevant}
                            </span>
                            {totalSuksess > 0 &&
                              ` (${formatPct(sukPcts[3], krav.antallSuksesskriterierIkkeRelevant)}%)`}
                          </BodyShort>
                        </div>
                        <div>
                          <Heading size='xsmall' level='4' className='mb-2'>
                            Suksesskriterier der kravet er ferdig utfylt ({totalFerdig})
                          </Heading>
                          <BodyShort>
                            Oppfylt{' '}
                            <span className='font-bold'>
                              {krav.antallFerdigUtfyltKravSuksesskriterierOppfylt}
                            </span>
                            {totalFerdig > 0 &&
                              ` (${formatPct(ferdigPcts[0], krav.antallFerdigUtfyltKravSuksesskriterierOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke oppfylt{' '}
                            <span className='font-bold'>
                              {krav.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt}
                            </span>
                            {totalFerdig > 0 &&
                              ` (${formatPct(ferdigPcts[1], krav.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke relevant{' '}
                            <span className='font-bold'>
                              {krav.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant}
                            </span>
                            {totalFerdig > 0 &&
                              ` (${formatPct(ferdigPcts[2], krav.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant)}%)`}
                          </BodyShort>
                        </div>
                        <div>
                          <Heading size='xsmall' level='4' className='mb-2'>
                            Suksesskriterier der kravet ikke er ferdig utfylt ({totalIkkeFerdig})
                          </Heading>
                          <BodyShort>
                            Under arbeid <span className='font-bold'>{ikkeFerdigUnderArbeid}</span>
                            {totalIkkeFerdig > 0 &&
                              ` (${formatPct(ikkeFerdigPcts[0], ikkeFerdigUnderArbeid)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Oppfylt <span className='font-bold'>{ikkeFerdigOppfylt}</span>
                            {totalIkkeFerdig > 0 &&
                              ` (${formatPct(ikkeFerdigPcts[1], ikkeFerdigOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke oppfylt <span className='font-bold'>{ikkeFerdigIkkeOppfylt}</span>
                            {totalIkkeFerdig > 0 &&
                              ` (${formatPct(ikkeFerdigPcts[2], ikkeFerdigIkkeOppfylt)}%)`}
                          </BodyShort>
                          <BodyShort>
                            Ikke relevant{' '}
                            <span className='font-bold'>{ikkeFerdigIkkeRelevant}</span>
                            {totalIkkeFerdig > 0 &&
                              ` (${formatPct(ikkeFerdigPcts[3], ikkeFerdigIkkeRelevant)}%)`}
                          </BodyShort>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {sortedKrav.length === 0 && (
                  <BodyShort className='text-gray-500'>Ingen krav for dette temaet</BodyShort>
                )}
              </div>
            </Tabs.Panel>
          </Tabs>
        )}
      </div>
    </PageLayout>
  )
}

export default TemaDetailPage
