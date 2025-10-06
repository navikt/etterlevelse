'use client'

import { EEtterlevelseStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { getNumberOfDaysBetween } from '@/util/checkAge/checkAgeUtil'
import { getKravForTema } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { Accordion, List, Loader, Tag } from '@navikt/ds-react'
import Link from 'next/link'
import { FunctionComponent, useContext } from 'react'
import { KravCard } from './kravCard'

type TProps = {
  etterlevelseDokumentasjonId: string
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  temaListe: TTemaCode[]
  openAccordions: boolean[]
  setOpenAccordions: React.Dispatch<React.SetStateAction<boolean[]>>
  allKravPriority: IKravPriorityList[]
  isRisikoscenarioLoading: boolean
  risikoscenarioList: IRisikoscenario[]
}

export const KravAccordionList: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjonId,
  relevanteStats,
  utgaattStats,
  temaListe,
  openAccordions,
  setOpenAccordions,
  allKravPriority,
  isRisikoscenarioLoading,
  risikoscenarioList,
}) => {
  const codelist = useContext(CodelistContext)
  const toggleAccordion = (index: number) => {
    const newState = [...openAccordions]
    newState[index] = !openAccordions[index]
    setOpenAccordions(newState)
  }

  return (
    <>
      {isRisikoscenarioLoading && (
        <div className='flex w-full justify-center items-center mt-5'>
          <Loader size='3xlarge' className='flex justify-self-center' />
        </div>
      )}
      {!isRisikoscenarioLoading && (
        <Accordion indent={false}>
          {allKravPriority.length !== 0 &&
            temaListe.map((tema, index) => {
              const relevantStatsKravnummer = relevanteStats.map((k) => k.kravNummer)

              const filteredUtgaatKrav = utgaattStats.filter(
                ({ kravNummer }) => !relevantStatsKravnummer.includes(kravNummer)
              )

              const kravliste = getKravForTema({
                tema,
                kravliste: [...relevanteStats, ...filteredUtgaatKrav],
                allKravPriority,
                codelist,
              })
              const utfylteKrav = kravliste.filter(
                (krav) =>
                  krav.etterlevelseStatus === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
                  krav.etterlevelseStatus === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
              )
              return (
                <Accordion.Item
                  key={`${tema.code}`}
                  className={`flex flex-col gap-2 ${kravliste.length > 0 ? '' : 'hidden'}`}
                  open={openAccordions[index]}
                >
                  <Accordion.Header id={tema.code} onClick={() => toggleAccordion(index)}>
                    <div className='flex gap-4'>
                      <span>
                        {tema.shortName} ({utfylteKrav.length} av {kravliste.length} krav er ferdig
                        utfylt)
                      </span>
                      {kravliste.find(
                        (krav) =>
                          krav.kravVersjon === 1 &&
                          (krav.etterlevelseStatus === undefined ||
                            krav.etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE) &&
                          getNumberOfDaysBetween(krav.aktivertDato, new Date()) < 30
                      ) && <Tag variant='warning'>Nytt krav</Tag>}
                      {kravliste.find(
                        (krav) =>
                          krav.kravVersjon > 1 &&
                          (krav.etterlevelseStatus === undefined ||
                            krav.etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE) &&
                          utgaattStats.filter(
                            (kl) => kl.kravNummer === krav.kravNummer && kl.etterlevelser.length > 0
                          ).length > 0 &&
                          getNumberOfDaysBetween(krav.aktivertDato, new Date()) < 30
                      ) && <Tag variant='warning'>Ny versjon</Tag>}
                    </div>
                  </Accordion.Header>
                  <Accordion.Content>
                    <div className='flex flex-col gap-6'>
                      <div>
                        <Link href={`${temaUrl}/${tema.code}`} target='_blank'>
                          Lær mer om {tema.shortName} (åpner i en ny fane)
                        </Link>
                      </div>
                      <List className='flex flex-col gap-2'>
                        {kravliste.map((krav, idx) => (
                          <List.Item icon={<div />} key={`krav_${idx}`}>
                            <KravCard
                              risikoscenarioList={risikoscenarioList}
                              krav={krav}
                              etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                              temaCode={tema.code}
                            />
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              )
            })}
        </Accordion>
      )}
    </>
  )
}
