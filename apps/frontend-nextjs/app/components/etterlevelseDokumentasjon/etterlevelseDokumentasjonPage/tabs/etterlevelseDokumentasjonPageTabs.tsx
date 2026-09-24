'use client'

import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { Button, InfoCard, List, ReadMore, Tabs } from '@navikt/ds-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { getAllKravPriorityList } from '@/api/kravPriorityList/kravPriorityListApi'
import { usePvoTilbakemelding } from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import PrioritertKravListe from '@/components/etterlevelseDokumentasjon/etterlevelseDokumentasjonPage/tabs/prioritertKravListe/prioritertKravListe'
import { IDocumentRelationWithEtterlevelseDokumetajson } from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { skalHaPvkDokument } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { ArkiveringModal } from '../arkivering/arkiveringModal'
import EtterlevelseDokumentasjonKravListe from './kravListe/etterlevelseDokumentasjonKravListe'
import PvkKravListeTab from './pvkKravListe/pvkKravListeTab'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  loading: boolean
  morDokumentRelasjon?: IDocumentRelationWithEtterlevelseDokumetajson
  pvkDokument?: IPvkDokument
  risikoscenarioList: IRisikoscenario[]
  isRisikoscenarioLoading: boolean
}

const EtterlevelseDokumentasjonPageTabs: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  temaListe,
  relevanteStats,
  utgaattStats,
  loading,
  morDokumentRelasjon,
  pvkDokument,
  risikoscenarioList,
  isRisikoscenarioLoading,
}) => {
  const [isArkivModalOpen, setIsArkivModalOpen] = useState<boolean>(false)
  const [allKravPriority, setAllKravPriority] = useState<IKravPriorityList[]>([])
  const queryParams = useSearchParams()
  const tabQuery = queryParams.get('tab')
  const [tabValue, setTabValue] = useState('alleKrav')
  const router = useRouter()
  const pathname = usePathname()
  const [pvoTilbakemelding] = usePvoTilbakemelding(pvkDokument?.id)
  const [allTiltak, setAllTiltak] = useState<ITiltak[]>([])

  const previousVurdering = useMemo(() => {
    if (!!pvoTilbakemelding && !!pvkDokument && pvkDokument.antallInnsendingTilPvo > 1) {
      const previousVurdering = pvoTilbakemelding.vurderinger.find(
        (vurdering) =>
          vurdering.innsendingId === pvkDokument.antallInnsendingTilPvo - 1 &&
          vurdering.etterlevelseDokumentVersjon === pvkDokument.currentEtterlevelseDokumentVersjon
      )

      return previousVurdering
    } else {
      return undefined
    }
  }, [pvoTilbakemelding, pvkDokument])

  useEffect(() => {
    ;(async () => {
      await getAllKravPriorityList().then((priority) => setAllKravPriority(priority))
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (
        morDokumentRelasjon &&
        morDokumentRelasjon.fromDocumentWithData.prioritertKravNummer.length > 0
      ) {
        setTabValue('prioritertKravliste')
      }
    })()
  }, [morDokumentRelasjon, pvkDokument])

  useEffect(() => {
    ;(async () => {
      if (!!previousVurdering && !!pvkDokument) {
        await getTiltakByPvkDokumentId(pvkDokument.id).then((pagedTiltak) =>
          setAllTiltak(pagedTiltak.content)
        )
      }
    })()
  }, [previousVurdering, pvkDokument])

  return (
    <Tabs
      defaultValue='alleKrav'
      value={tabQuery && tabQuery === 'pvk' ? 'pvkRelaterteKrav' : tabValue}
      onChange={(newValue) => {
        setTabValue(newValue)
        router.push(pathname, { scroll: false })
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='alleKrav' label='Alle Krav' />
        <Tabs.Tab value='prioritertKravliste' label='Prioritert kravliste' />
        {pvkDokument && skalHaPvkDokument(pvkDokument.pvkVurdering) && (
          <Tabs.Tab value='pvkRelaterteKrav' label='PVK-relaterte krav' />
        )}
      </Tabs.List>

      <Tabs.Panel value='alleKrav'>
        <div className='pt-4 flex flex-col gap-4'>
          <EtterlevelseDokumentasjonKravListe
            temaListe={temaListe}
            relevanteStats={relevanteStats}
            utgaattStats={utgaattStats}
            allKravPriority={allKravPriority}
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            loading={loading}
            risikoscenarioList={risikoscenarioList}
            allTiltak={allTiltak}
            isRisikoscenarioLoading={isRisikoscenarioLoading}
            previousVurdering={previousVurdering}
          />

          <div className='w-full flex justify-end items-center'>
            <div>
              <Button variant='tertiary' size='small' onClick={() => setIsArkivModalOpen(true)}>
                Arkiver i Public 360
              </Button>
              <ArkiveringModal
                arkivModal={isArkivModalOpen}
                setArkivModal={setIsArkivModalOpen}
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
              />
            </div>
          </div>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value='prioritertKravliste'>
        <div className='pt-4 flex flex-col gap-4'>
          {morDokumentRelasjon && (
            <ReadMore
              header='Spesielt for dere som har tatt gjenbrukskopi'
              className='max-w-[75ch]  my-1'
            >
              Dokumenteiere som tillater gjenbruk, kan velge om de vil tilpasse
              etterlevelsesdokumentet som arves. Dette innebærer at de kan:
              <List className='my-5' as='ul'>
                <List.Item>Skrive veiledning på kravsider, ved enkelte suksesskriterier.</List.Item>
                <List.Item>
                  Forhåndsvurdere enkelte suksesskriterier for dere, for eksempel ved å sette noen
                  til “ikke relevant”.
                </List.Item>
                <List.Item>Kladde svar som dere skal skrive ferdig.</List.Item>
              </List>
              Dokumenteierne velger også om de vil samle slike tilpassede krav her, under
              Prioriterte krav.{' '}
              <ExternalLink href='https://etterlevelse.ansatt.nav.no/omstottetiletterlevelse#slik-gjenbruker-du-et-etterlevelsesdokument'>
                Les mer om hvordan gjenbruke et etterlevelsesdokument.
              </ExternalLink>
              <InfoCard data-color='warning' className='my-5'>
                <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                  <InfoCard.Title>
                    Dere er ansvarlige for at deres etterlevelsesdokumentasjon stemmer
                  </InfoCard.Title>
                </InfoCard.Header>
                <InfoCard.Content>
                  Selv om dere kan ha arvet noen forhåndsvurderinger, må dere ta stilling til alle
                  krav og suksesskriterier, og dokumentere det som gjelder for deres etterlevelse.
                  Likeledes må dere vurdere og dokumentere alle etterlevelseskrav, ikke bare de som
                  står i Prioritert kravliste. Hvis dere senere arver endringer i veiledning, er
                  dere ansvarlige for å ta stilling til endringene og holde
                  etterlevelsesdokumentasjonen oppdatert.
                </InfoCard.Content>
              </InfoCard>
            </ReadMore>
          )}
          <PrioritertKravListe
            loading={loading}
            allKravPriority={allKravPriority}
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
            relevanteStats={relevanteStats}
            temaListe={temaListe}
            risikoscenarioList={risikoscenarioList}
            allTiltak={allTiltak}
            isRisikoscenarioLoading={isRisikoscenarioLoading}
            previousVurdering={previousVurdering}
          />
        </div>
      </Tabs.Panel>
      {pvkDokument && skalHaPvkDokument(pvkDokument.pvkVurdering) && (
        <Tabs.Panel value='pvkRelaterteKrav'>
          <PvkKravListeTab
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            pvkDokument={pvkDokument}
            temaListe={temaListe}
            relevanteStats={relevanteStats}
            allKravPriority={allKravPriority}
            loading={loading}
            risikoscenarioList={risikoscenarioList}
            allTiltak={allTiltak}
            isRisikoscenarioLoading={isRisikoscenarioLoading}
            previousVurdering={previousVurdering}
          />
        </Tabs.Panel>
      )}
    </Tabs>
  )
}

export default EtterlevelseDokumentasjonPageTabs
