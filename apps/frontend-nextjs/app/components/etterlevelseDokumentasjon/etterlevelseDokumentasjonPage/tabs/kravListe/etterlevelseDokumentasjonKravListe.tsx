'use client'

import {
  IKravNivaaStatusFilter,
  ISuksesskriterieStatusFilter,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import {
  etterlevelseDokumentasjonAlleClosedUrl,
  etterlevelseDokumentasjonAlleOpenUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import {
  filterKravEtterlevelseStatus,
  filterSuksesskriterieStatus,
  getNewestKravVersjon,
  isFerdigUtfylt,
} from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { BodyShort, Button, Label, Loader, TextField } from '@navikt/ds-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import {
  KravNivaaStatusFilter,
  SuksesskriterieStatusFilter,
} from '../common/statusFilterActionMenu'
import { KravAccordionList } from './kravAccordionList'

type TProps = {
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  allKravPriority: IKravPriorityList[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  loading: boolean
  risikoscenarioList: IRisikoscenario[]
  allTiltak: ITiltak[]
  isRisikoscenarioLoading: boolean
  defaultOpen?: boolean
  previousVurdering?: IVurdering
}

export const EtterlevelseDokumentasjonKravListe: FunctionComponent<TProps> = ({
  temaListe,
  loading,
  relevanteStats,
  utgaattStats,
  allKravPriority,
  etterlevelseDokumentasjon,
  risikoscenarioList,
  allTiltak,
  isRisikoscenarioLoading,
  defaultOpen,
  previousVurdering,
}) => {
  const params = useParams<{ etterlevelseDokumentasjonId?: string }>()
  const queryParams = useSearchParams()
  const [openAccordions, setOpenAccordions] = useState<boolean[]>(temaListe.map(() => false))
  const [kravNivaaStatusFilter, setKravNivaaStatusFilter] = useState<IKravNivaaStatusFilter>({
    IKKE_PAABEGYNT: true,
    UNDER_REDIGERING: true,
    FERDIG_DOKUMENTERT: true,
    OPPFYLLES_SENERE: true,
  })

  const [suksesskriterieStatusFilter, setSuksesskriterieStatusFilter] =
    useState<ISuksesskriterieStatusFilter>({
      UNDER_ARBEID: true,
      OPPFYLT: true,
      IKKE_RELEVANT: true,
      IKKE_OPPFYLT: true,
      IKKE_PAABEGYNT: true,
    })

  const [searchKrav, setSearchKrav] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      if (queryParams.get('tema') === 'all-open') {
        setOpenAccordions(temaListe.map(() => true))
      } else if (queryParams.get('tema') === 'all-close') {
        setOpenAccordions(temaListe.map(() => false))
      } else {
        setOpenAccordions(
          temaListe.map((t) =>
            t.code.toLocaleLowerCase() === queryParams.get('tema')?.toLocaleLowerCase()
              ? true
              : false
          )
        )
      }
    })()
  }, [temaListe])

  useEffect(() => {
    ;(async () => {
      if (defaultOpen) {
        setOpenAccordions(temaListe.map(() => true))
        router.push(
          etterlevelseDokumentasjonAlleOpenUrl(params.etterlevelseDokumentasjonId) + '&tab=pvk',
          { scroll: false }
        )
      }
    })()
  }, [defaultOpen])

  const { relevantKravList, utgaattKravList } = useMemo(() => {
    let relevanteStatusListe: TKravQL[] = relevanteStats
    let utgaattStatusListe: TKravQL[] = utgaattStats
    if (Object.values(kravNivaaStatusFilter).some((value) => value !== true)) {
      relevanteStatusListe = filterKravEtterlevelseStatus(
        kravNivaaStatusFilter,
        relevanteStatusListe
      )
      utgaattStatusListe = filterKravEtterlevelseStatus(kravNivaaStatusFilter, utgaattStatusListe)
    }

    if (Object.values(suksesskriterieStatusFilter).some((value) => value !== true)) {
      relevanteStatusListe = filterSuksesskriterieStatus(
        suksesskriterieStatusFilter,
        relevanteStatusListe
      )
      utgaattStatusListe = filterSuksesskriterieStatus(
        suksesskriterieStatusFilter,
        utgaattStatusListe
      )
    }

    if (searchKrav !== '') {
      relevanteStatusListe = relevanteStatusListe.filter((krav) => {
        const kravName = 'K' + krav.kravNummer + '.' + krav.kravVersjon + ' ' + krav.navn

        return kravName.toLowerCase().includes(searchKrav.toLowerCase())
      })
      utgaattStatusListe = utgaattStatusListe.filter((krav) => {
        const kravName = 'K' + krav.kravNummer + '.' + krav.kravVersjon + ' ' + krav.navn

        return kravName.toLowerCase().includes(searchKrav.toLowerCase())
      })
    }

    return {
      relevantKravList: relevanteStatusListe,
      utgaattKravList: utgaattStatusListe,
    }
  }, [relevanteStats, utgaattStats, searchKrav, kravNivaaStatusFilter, suksesskriterieStatusFilter])

  const checkForUtgattKravLength = () => {
    if (etterlevelseDokumentasjon.etterlevelseDokumentVersjon === 1) {
      return utgaattKravList.length === 0
    } else {
      return true
    }
  }

  let antallFylttKrav = 0

  getNewestKravVersjon(relevanteStats).forEach((k: TKravQL) => {
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      antallFylttKrav += 1
    }
  })

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-end w-full gap-6 py-2'>
        <Label className='pb-3'>Filter:</Label>
        <TextField
          label='Søk etter kravet'
          onChange={(event) => setSearchKrav(event.target.value)}
        />

        <KravNivaaStatusFilter
          kravNivaaStatusFilter={kravNivaaStatusFilter}
          setKravNivaaStatusFilter={setKravNivaaStatusFilter}
        />

        <SuksesskriterieStatusFilter
          suksesskriterieStatusFilter={suksesskriterieStatusFilter}
          setSuksesskriterieStatusFilter={setSuksesskriterieStatusFilter}
        />
      </div>
      <div className='flex items-center w-full pb-2'>
        <div className='flex items-center w-full gap-4'>
          <Button
            variant='tertiary'
            size='xsmall'
            onClick={() => {
              setOpenAccordions(temaListe.map(() => true))

              const tabQuery = queryParams.get('tab')

              let url = etterlevelseDokumentasjonAlleOpenUrl(params.etterlevelseDokumentasjonId)

              if (![null, undefined, ''].includes(tabQuery)) {
                url += '&tab=' + tabQuery
              }

              router.push(url, { scroll: false })
            }}
          >
            Åpne alle tema
          </Button>
          <Button
            variant='tertiary'
            size='xsmall'
            onClick={() => {
              setOpenAccordions(temaListe.map(() => false))

              const tabQuery = queryParams.get('tab')

              let url = etterlevelseDokumentasjonAlleClosedUrl(params.etterlevelseDokumentasjonId)

              if (![null, undefined, ''].includes(tabQuery)) {
                url += '&tab=' + tabQuery
              }

              router.push(url, { scroll: false })
            }}
          >
            Lukk alle tema
          </Button>
        </div>

        <div className='flex justify-end w-full items-center'>
          <BodyShort size='medium'>
            Totalt {getNewestKravVersjon(relevanteStats).length} krav
            {Object.values(kravNivaaStatusFilter).every((value) => value === true)
              ? `, ${antallFylttKrav} ferdig
              utfylt`
              : ''}
          </BodyShort>
        </div>
      </div>
      {loading && (
        <div className='flex w-full justify-center mt-3.5'>
          <Loader size={'large'} />
        </div>
      )}
      {!loading && (relevanteStats.length !== 0 || utgaattStats.length !== 0) && (
        <KravAccordionList
          risikoscenarioList={risikoscenarioList}
          allTiltak={allTiltak}
          isRisikoscenarioLoading={isRisikoscenarioLoading}
          allKravPriority={allKravPriority}
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          relevanteStats={relevantKravList}
          utgaattStats={utgaattKravList}
          temaListe={temaListe}
          openAccordions={openAccordions}
          setOpenAccordions={setOpenAccordions}
          previousVurdering={previousVurdering}
        />
      )}

      {!loading &&
        (relevanteStats.length !== 0 || utgaattStats.length !== 0) &&
        relevantKravList.length === 0 &&
        checkForUtgattKravLength() && (
          <div className='flex w-full justify-center'>
            <BodyShort>Fant ingen krav</BodyShort>
          </div>
        )}
      {/*
        DISABLED TEMPORARY
        {irrelevanteStats.length > 0 && (
          <>
            <div>
              <H3>Tema dere har filtrert bort</H3>
              <ParagraphMedium maxWidth={'574px'}>Dere har filtrert bort tema med krav som dere må kjenne til og selv vurdere om dere skal etterleve.</ParagraphMedium>
            </div>
            <div display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale550}>
              {temaListe.map((tema) => (
                <TemaCardBehandling tema={tema} stats={irrelevanteStats} behandling={behandling} key={`${tema.shortName}_panel`} irrelevant={true}/>
              ))}
            </div>
          </>
        )} */}
    </div>
  )
}

export default EtterlevelseDokumentasjonKravListe
