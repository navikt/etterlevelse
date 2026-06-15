'use client'

import {
  getDashboardAvdelingStats,
  getDashboardStats,
  getTemaDashboardStats,
} from '@/api/dashboard/dashboardApi'
import { getEnheterBySeksjonId } from '@/api/nom/nomApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IAvdelingDashboardStats,
  ISeksjonOption,
  ITemaDashboardStats,
} from '@/constants/dashboard/dashboardConstants'
import { IOrgEnhet } from '@/constants/teamkatalogen/teamkatalogConstants'
import { DownloadIcon, InformationSquareIcon } from '@navikt/aksel-icons'
import {
  Link as AkselLink,
  BodyShort,
  Button,
  Detail,
  Heading,
  InfoCard,
  List,
  ReadMore,
  Select,
  Tabs,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { TemaDashboardReadmore } from './DashboardReadmore/TemaDashboardReadmore'
import { RechartsStackedBar } from './RechartsStackedBar'
import {
  IBarSegment,
  KRAV_COLORS,
  SUKSESS_COLORS,
  formatPct,
  roundedPercentages,
} from './chartUtils'

const TemaDokumentCount = ({ count }: { count?: number }) => (
  <Detail uppercase className='mt-2 mb-4'>
    {(count ?? 0).toLocaleString('nb-NO')} ETTERLEVELSESDOKUMENTER
  </Detail>
)

const TemaStatsCard = ({ stats }: { stats: ITemaDashboardStats }) => {
  const kravData: IBarSegment[] = [
    { name: 'Under arbeid', value: stats.kravUnderArbeid, color: KRAV_COLORS.underArbeid },
    { name: 'Ferdig vurdert', value: stats.kravFerdigVurdert, color: KRAV_COLORS.ferdigVurdert },
  ]

  const suksessData: IBarSegment[] = [
    {
      name: 'Ikke påbegynt',
      value: stats.suksesskriterierIkkePaabegynt,
      color: SUKSESS_COLORS.ikkePaabegynt,
    },
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

  const ferdigSuksessData: IBarSegment[] = [
    {
      name: 'Oppfylt',
      value: stats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0,
      color: SUKSESS_COLORS.oppfylt,
    },
    {
      name: 'Ikke oppfylt',
      value: stats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value: stats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  const ikkeFerdigSuksessData: IBarSegment[] = [
    {
      name: 'Ikke påbegynt',
      value: stats.suksesskriterierIkkePaabegynt,
      color: SUKSESS_COLORS.ikkePaabegynt,
    },
    {
      name: 'Under arbeid',
      value: stats.suksesskriterierUnderArbeid,
      color: SUKSESS_COLORS.underArbeid,
    },
    {
      name: 'Oppfylt',
      value: stats.suksesskriterierOppfylt - (stats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0),
      color: SUKSESS_COLORS.oppfylt,
    },
    {
      name: 'Ikke oppfylt',
      value:
        stats.suksesskriterierIkkeOppfylt -
        (stats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0),
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value:
        stats.suksesskriterierIkkeRelevant -
        (stats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0),
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <div className='flex items-center gap-4'>
        <Heading size='small' level='3'>
          {stats.temaName}
        </Heading>
        <AkselLink href={`/dashboard/tema/${stats.temaCode}`}>
          Les mer om etterlevelse under {stats.temaName}
        </AkselLink>
      </div>

      <TemaDokumentCount count={stats.etterlevelseDokumentCount} />

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4'>
        <div>
          <Heading size='xsmall' level='4' className='min-h-[3rem]'>
            Vurdering av etterlevelseskrav
          </Heading>
          <RechartsStackedBar data={kravData} percentageOnly />
        </div>

        <div>
          <Heading size='xsmall' level='4' className='min-h-[3rem]'>
            Etterlevelse: suksesskriterier
          </Heading>
          <RechartsStackedBar data={suksessData} percentageOnly />
        </div>

        <div>
          <Heading size='xsmall' level='4' className='min-h-[3rem]'>
            Suksesskriterier der kravet er ferdig utfylt
          </Heading>
          <RechartsStackedBar data={ferdigSuksessData} percentageOnly />
        </div>

        <div>
          <Heading size='xsmall' level='4' className='min-h-[3rem]'>
            Suksesskriterier der kravet ikke er ferdig utfylt
          </Heading>
          <RechartsStackedBar data={ikkeFerdigSuksessData} percentageOnly />
        </div>
      </div>

      <TemaDashboardReadmore />
    </div>
  )
}

const TemaStatsKeyMetrics = ({ stats }: { stats: ITemaDashboardStats }) => {
  const totalSuksess =
    stats.suksesskriterierIkkePaabegynt +
    stats.suksesskriterierUnderArbeid +
    stats.suksesskriterierOppfylt +
    stats.suksesskriterierIkkeOppfylt +
    stats.suksesskriterierIkkeRelevant

  const totalFerdigSuksess =
    (stats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0) +
    (stats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0) +
    (stats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0)

  const totalIkkeFerdigSuksess = totalSuksess - totalFerdigSuksess

  const ikkeFerdigUnderArbeid = stats.suksesskriterierUnderArbeid
  const ikkeFerdigIkkePaabegynt = stats.suksesskriterierIkkePaabegynt
  const ikkeFerdigOppfylt =
    stats.suksesskriterierOppfylt - (stats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0)
  const ikkeFerdigIkkeOppfylt =
    stats.suksesskriterierIkkeOppfylt - (stats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0)
  const ikkeFerdigIkkeRelevant =
    stats.suksesskriterierIkkeRelevant - (stats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0)

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <div className='flex items-center gap-4'>
        <Heading size='small' level='3'>
          {stats.temaName}
        </Heading>
        <AkselLink href={`/dashboard/tema/${stats.temaCode}`}>
          Les mer om etterlevelse under {stats.temaName}
        </AkselLink>
      </div>

      <TemaDokumentCount count={stats.etterlevelseDokumentCount} />

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-4 mt-4'>
        <div>
          {(() => {
            const kravPcts = roundedPercentages([stats.kravUnderArbeid, stats.kravFerdigVurdert])
            return (
              <>
                <Heading size='xsmall' level='4' className='mb-2'>
                  Gjennomføringsstatus: krav ({stats.kravTotal})
                </Heading>
                <BodyShort>
                  Under arbeid <span className='font-bold'>{stats.kravUnderArbeid}</span>
                  {stats.kravTotal > 0 && ` (${formatPct(kravPcts[0], stats.kravUnderArbeid)}%)`}
                </BodyShort>
                <BodyShort>
                  Ferdig vurdert <span className='font-bold'>{stats.kravFerdigVurdert}</span>
                  {stats.kravTotal > 0 && ` (${formatPct(kravPcts[1], stats.kravFerdigVurdert)}%)`}
                </BodyShort>
              </>
            )
          })()}
        </div>

        <div>
          {(() => {
            const sukPcts = roundedPercentages([
              stats.suksesskriterierIkkePaabegynt,
              stats.suksesskriterierUnderArbeid,
              stats.suksesskriterierOppfylt,
              stats.suksesskriterierIkkeOppfylt,
              stats.suksesskriterierIkkeRelevant,
            ])
            return (
              <>
                <Heading size='xsmall' level='4' className='mb-2'>
                  Etterlevelse: suksesskriterier ({totalSuksess})
                </Heading>
                <BodyShort>
                  Ikke påbegynt{' '}
                  <span className='font-bold'>{stats.suksesskriterierIkkePaabegynt}</span>
                  {totalSuksess > 0 &&
                    ` (${formatPct(sukPcts[0], stats.suksesskriterierIkkePaabegynt)}%)`}
                </BodyShort>
                <BodyShort>
                  Under arbeid{' '}
                  <span className='font-bold'>{stats.suksesskriterierUnderArbeid}</span>
                  {totalSuksess > 0 &&
                    ` (${formatPct(sukPcts[1], stats.suksesskriterierUnderArbeid)}%)`}
                </BodyShort>
                <BodyShort>
                  Oppfylt <span className='font-bold'>{stats.suksesskriterierOppfylt}</span>
                  {totalSuksess > 0 &&
                    ` (${formatPct(sukPcts[2], stats.suksesskriterierOppfylt)}%)`}
                </BodyShort>
                <BodyShort>
                  Ikke oppfylt{' '}
                  <span className='font-bold'>{stats.suksesskriterierIkkeOppfylt}</span>
                  {totalSuksess > 0 &&
                    ` (${formatPct(sukPcts[3], stats.suksesskriterierIkkeOppfylt)}%)`}
                </BodyShort>
                <BodyShort>
                  Ikke relevant{' '}
                  <span className='font-bold'>{stats.suksesskriterierIkkeRelevant}</span>
                  {totalSuksess > 0 &&
                    ` (${formatPct(sukPcts[4], stats.suksesskriterierIkkeRelevant)}%)`}
                </BodyShort>
              </>
            )
          })()}
        </div>

        <div>
          {(() => {
            const ferdigPcts = roundedPercentages([
              stats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0,
              stats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0,
              stats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0,
            ])
            return (
              <>
                <Heading size='xsmall' level='4' className='mb-2'>
                  Suksesskriterier der kravet er ferdig utfylt ({totalFerdigSuksess})
                </Heading>
                <BodyShort>
                  Oppfylt{' '}
                  <span className='font-bold'>
                    {stats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0}
                  </span>
                  {totalFerdigSuksess > 0 &&
                    ` (${formatPct(ferdigPcts[0], stats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0)}%)`}
                </BodyShort>
                <BodyShort>
                  Ikke oppfylt{' '}
                  <span className='font-bold'>
                    {stats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0}
                  </span>
                  {totalFerdigSuksess > 0 &&
                    ` (${formatPct(ferdigPcts[1], stats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0)}%)`}
                </BodyShort>
                <BodyShort>
                  Ikke relevant{' '}
                  <span className='font-bold'>
                    {stats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0}
                  </span>
                  {totalFerdigSuksess > 0 &&
                    ` (${formatPct(ferdigPcts[2], stats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0)}%)`}
                </BodyShort>
              </>
            )
          })()}
        </div>

        <div>
          {(() => {
            const ikkeFerdigPcts = roundedPercentages([
              ikkeFerdigIkkePaabegynt,
              ikkeFerdigUnderArbeid,
              ikkeFerdigOppfylt,
              ikkeFerdigIkkeOppfylt,
              ikkeFerdigIkkeRelevant,
            ])
            return (
              <>
                <Heading size='xsmall' level='4' className='mb-2'>
                  Suksesskriterier der kravet ikke er ferdig utfylt ({totalIkkeFerdigSuksess})
                </Heading>
                <BodyShort>
                  Ikke påbegynt <span className='font-bold'>{ikkeFerdigIkkePaabegynt}</span>
                  {totalIkkeFerdigSuksess > 0 &&
                    ` (${formatPct(ikkeFerdigPcts[0], ikkeFerdigIkkePaabegynt)}%)`}
                </BodyShort>
                <BodyShort>
                  Under arbeid <span className='font-bold'>{ikkeFerdigUnderArbeid}</span>
                  {totalIkkeFerdigSuksess > 0 &&
                    ` (${formatPct(ikkeFerdigPcts[1], ikkeFerdigUnderArbeid)}%)`}
                </BodyShort>
                <BodyShort>
                  Oppfylt <span className='font-bold'>{ikkeFerdigOppfylt}</span>
                  {totalIkkeFerdigSuksess > 0 &&
                    ` (${formatPct(ikkeFerdigPcts[2], ikkeFerdigOppfylt)}%)`}
                </BodyShort>
                <BodyShort>
                  Ikke oppfylt <span className='font-bold'>{ikkeFerdigIkkeOppfylt}</span>
                  {totalIkkeFerdigSuksess > 0 &&
                    ` (${formatPct(ikkeFerdigPcts[3], ikkeFerdigIkkeOppfylt)}%)`}
                </BodyShort>
                <BodyShort>
                  Ikke relevant <span className='font-bold'>{ikkeFerdigIkkeRelevant}</span>
                  {totalIkkeFerdigSuksess > 0 &&
                    ` (${formatPct(ikkeFerdigPcts[4], ikkeFerdigIkkeRelevant)}%)`}
                </BodyShort>
              </>
            )
          })()}
        </div>
      </div>
      <TemaDashboardReadmore />
    </div>
  )
}

interface IExportFilters {
  tema?: string
  avdeling?: string
  seksjon?: string
  enhet?: string
  hasEnheter?: boolean
}

const exportToCsv = (stats: ITemaDashboardStats[], filters: IExportFilters) => {
  const BOM = '\uFEFF'

  const filterLines = [
    `Tema;${filters.tema || 'Alle tema'}`,
    `Avdeling;${filters.avdeling || 'Alle avdelinger'}`,
    `Seksjon;${filters.seksjon || 'Alle seksjoner'}`,
    ...(filters.hasEnheter ? [`Enhet;${filters.enhet || 'Alle enheter'}`] : []),
    '',
  ]

  const header = [
    'Tema',
    'Krav totalt',
    'Krav under arbeid',
    'Krav ferdig vurdert',
    'Suksesskriterier ikke påbegynt',
    'Suksesskriterier under arbeid',
    'Suksesskriterier oppfylt',
    'Suksesskriterier ikke oppfylt',
    'Suksesskriterier ikke relevant',
    'Ferdig utfylt krav - suksesskriterier oppfylt',
    'Ferdig utfylt krav - suksesskriterier ikke oppfylt',
    'Ferdig utfylt krav - suksesskriterier ikke relevant',
    'Ikke ferdig utfylt krav - suksesskriterier ikke påbegynt',
    'Ikke ferdig utfylt krav - suksesskriterier under arbeid',
    'Ikke ferdig utfylt krav - suksesskriterier oppfylt',
    'Ikke ferdig utfylt krav - suksesskriterier ikke oppfylt',
    'Ikke ferdig utfylt krav - suksesskriterier ikke relevant',
  ].join(';')

  const rows = stats.map((s) =>
    [
      s.temaName,
      s.kravTotal,
      s.kravUnderArbeid,
      s.kravFerdigVurdert,
      s.suksesskriterierIkkePaabegynt,
      s.suksesskriterierUnderArbeid,
      s.suksesskriterierOppfylt,
      s.suksesskriterierIkkeOppfylt,
      s.suksesskriterierIkkeRelevant,
      s.ferdigUtfyltKravSuksesskriterierOppfylt,
      s.ferdigUtfyltKravSuksesskriterierIkkeOppfylt,
      s.ferdigUtfyltKravSuksesskriterierIkkeRelevant,
      s.suksesskriterierIkkePaabegynt,
      s.suksesskriterierUnderArbeid,
      s.suksesskriterierOppfylt - (s.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0),
      s.suksesskriterierIkkeOppfylt - (s.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0),
      s.suksesskriterierIkkeRelevant - (s.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0),
    ].join(';')
  )

  const csv = BOM + [...filterLines, header, ...rows].join('\n')
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
  const [selectedEnhet, setSelectedEnhet] = useState<string>('')
  const [enheter, setEnheter] = useState<IOrgEnhet[]>([])

  useEffect(() => {
    getDashboardStats()
      .then(setAvdelinger)
      .catch((err) => console.error('Failed to fetch avdelinger:', err))
  }, [])

  useEffect(() => {
    getTemaDashboardStats(
      undefined,
      selectedAvdeling || undefined,
      selectedSeksjon || undefined,
      selectedEnhet || undefined
    )
      .then((data) => {
        setTemaStats(data)
        setSelectedTema((prev) => (prev && !data.some((d) => d.temaCode === prev) ? '' : prev))
      })
      .catch((err) => console.error('Failed to fetch tema stats:', err))
      .finally(() => setIsLoading(false))
  }, [selectedAvdeling, selectedSeksjon, selectedEnhet])

  useEffect(() => {
    if (selectedAvdeling) {
      getDashboardAvdelingStats(selectedAvdeling)
        .then((data) => setSeksjoner(data.seksjoner || []))
        .catch(() => setSeksjoner([]))
    }
  }, [selectedAvdeling])

  useEffect(() => {
    const hasValidSeksjon = selectedSeksjon && selectedSeksjon !== 'ingen-seksjon'
    const promise = hasValidSeksjon ? getEnheterBySeksjonId(selectedSeksjon) : Promise.resolve([])
    promise
      .then((result) => {
        setEnheter(result)
        if (!hasValidSeksjon) {
          setSelectedEnhet('')
        }
      })
      .catch(() => setEnheter([]))
  }, [selectedSeksjon])

  const filteredTemaStats = selectedTema
    ? temaStats.filter((s) => s.temaCode === selectedTema)
    : temaStats

  return (
    <PageLayout
      pageTitle='Status pr. tema'
      currentPage='Tema'
      breadcrumbPaths={[{ href: '/dashboard', pathName: 'Dashboard' }]}
    >
      <div className='flex justify-between items-center mt-4'>
        <Heading size='large' level='1'>
          Status pr. tema
        </Heading>
      </div>

      <ReadMore header='Hvordan bruker jeg denne siden?' className='max-w-[75ch] mt-4'>
        <p>På denne siden kan du:</p>
        <List className='mt-4'>
          <List.Item>Få oversikt over Navs etterlevelse, inndelt etter tema.</List.Item>
          <List.Item>
            Filtrere etter avdeling og eventuelt seksjon slik at du kan se hvordan enkelte
            organisasjonsdeler etterlever krav og suksesskriterier.
          </List.Item>
          <List.Item>
            Navigere videre til enkelte temasider hvor du kan utforske etterlevelse av enkelte krav,
            enten i hele Nav eller på avdelings- eller seksjonsnivå.
          </List.Item>
        </List>
        <p className='mt-4'>
          For mer detaljer anbefaler vi informasjonssidene{' '}
          <AkselLink href='/omstottetiletterlevelse' target='_blank'>
            Om Støtte til etterlevelse
          </AkselLink>
          ,{' '}
          <AkselLink href='/om-pvk' target='_blank'>
            Om Digital PVK
          </AkselLink>{' '}
          og{' '}
          <AkselLink href='/om-behandlingskatalogen' target='_blank'>
            Om Behandlingskatalogen
          </AkselLink>
          .
        </p>
      </ReadMore>

      <div className='rounded-lg p-6 mt-8' style={{ backgroundColor: '#e3eff7' }}>
        <Heading size='medium' level='2'>
          Tema
        </Heading>

        <div className='grid grid-cols-1 sm:flex sm:flex-row sm:flex-wrap gap-4 mt-4 sm:items-end'>
          <Select
            label='Velg tema'
            className='sm:w-fit sm:min-w-64'
            style={{ width: '100%' }}
            value={selectedTema}
            onChange={(e) => setSelectedTema(e.target.value)}
          >
            <option value=''>Alle tema</option>
            {temaStats.map((t) => (
              <option key={t.temaCode} value={t.temaCode}>
                {t.temaName}
              </option>
            ))}
          </Select>

          <Select
            label='Filtrer etter avdeling'
            className='sm:w-fit sm:min-w-64'
            style={{ width: '100%' }}
            value={selectedAvdeling}
            onChange={(e) => {
              setSelectedAvdeling(e.target.value)
              setSelectedSeksjon('')
              setSelectedEnhet('')
              setEnheter([])
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
            const filteredSeksjoner = seksjoner.filter((s) => s.navn !== avdelingNavn)
            return selectedAvdeling && filteredSeksjoner.length > 0 ? (
              <Select
                label='Filtrer etter seksjon'
                className='sm:w-fit sm:min-w-64'
                style={{ width: '100%' }}
                value={selectedSeksjon}
                onChange={(e) => {
                  setSelectedSeksjon(e.target.value)
                  setSelectedEnhet('')
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

          {selectedSeksjon && selectedSeksjon !== 'ingen-seksjon' && enheter.length > 0 && (
            <Select
              label='Filtrer etter enhet'
              className='sm:w-fit sm:min-w-64'
              style={{ width: '100%' }}
              value={selectedEnhet}
              onChange={(e) => {
                setSelectedEnhet(e.target.value)
                setIsLoading(true)
              }}
            >
              <option value=''>Alle enheter</option>
              {[...enheter]
                .sort((a, b) => a.navn.localeCompare(b.navn))
                .map((en) => (
                  <option key={en.id} value={en.id}>
                    {en.navn}
                  </option>
                ))}
              <option value='ingen-enhet'>Ikke valgt enhet</option>
            </Select>
          )}

          <Button
            variant='tertiary'
            size='small'
            icon={<DownloadIcon aria-hidden />}
            onClick={() =>
              exportToCsv(filteredTemaStats, {
                tema: temaStats.find((t) => t.temaCode === selectedTema)?.temaName,
                avdeling: avdelinger.find((a) => a.avdelingId === selectedAvdeling)?.avdelingNavn,
                seksjon:
                  selectedSeksjon === 'ingen-seksjon'
                    ? 'Ikke valgt seksjon'
                    : seksjoner.find((s) => s.id === selectedSeksjon)?.navn,
                enhet:
                  selectedEnhet === 'ingen-enhet'
                    ? 'Ikke valgt enhet'
                    : enheter.find((e) => e.id === selectedEnhet)?.navn,
                hasEnheter: enheter.length > 0,
              })
            }
            disabled={isLoading || filteredTemaStats.length === 0}
            className='pr-4'
          >
            Last ned nøkkeltall som CSV
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
      </div>

      {!isLoading && (
        <InfoCard data-color='info' className='mt-8'>
          <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
            <InfoCard.Title as='h2'>
              Savner du noe, eller har du tilbakemelding til oss?
            </InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            Hvis du savner et visst etterlevelsesdokument i listen, sjekk hvilke filtre som er valgt
            i søkefeltet, eller se{' '}
            <AkselLink href='/dashboard/ingen-avdeling' target='_blank'>
              listen over etterlevelsesdokumenter der avdeling/seksjon ikke er valgt (åpner i en ny
              fane)
            </AkselLink>
            . Hvis du har andre tilbakemeldinger om dashboards, bli med på #etterlevelse på Slack,
            eller send mail til teamdatajegerne@nav.no.
          </InfoCard.Content>
        </InfoCard>
      )}
    </PageLayout>
  )
}

export default TemaDashboardPage
