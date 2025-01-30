import { Accordion, Link, List, Tag } from '@navikt/ds-react'
import { EEtterlevelseStatus, EKravFilterType, IKravPriorityList, TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'
import { getNumberOfDaysBetween } from '../../util/checkAge'
import { getKravForTema } from '../../util/getKravForTema'
import { KravCard } from '../etterlevelseDokumentasjonTema/KravCard'

interface IProps {
  etterlevelseDokumentasjonId: string
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  temaListe: TTemaCode[]
  openAccordions: boolean[]
  setOpenAccordions: React.Dispatch<React.SetStateAction<boolean[]>>
  allKravPriority: IKravPriorityList[]
}

export const KravAccordionList = (props: IProps) => {
  const {
    etterlevelseDokumentasjonId,
    relevanteStats,
    utgaattStats,
    temaListe,
    openAccordions,
    setOpenAccordions,
    allKravPriority,
  } = props

  const toggleAccordion = (index: number) => {
    const newState = [...openAccordions]
    newState[index] = !openAccordions[index]
    setOpenAccordions(newState)
  }

  return (
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
                <div className="flex gap-4">
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
                  ) && <Tag variant="warning">Nytt krav</Tag>}
                  {kravliste.find(
                    (krav) =>
                      krav.kravVersjon > 1 &&
                      (krav.etterlevelseStatus === undefined ||
                        krav.etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE) &&
                      utgaattStats.filter(
                        (kl) => kl.kravNummer === krav.kravNummer && kl.etterlevelser.length > 0
                      ).length > 0 &&
                      getNumberOfDaysBetween(krav.aktivertDato, new Date()) < 30
                  ) && <Tag variant="warning">Ny versjon</Tag>}
                </div>
              </Accordion.Header>
              <Accordion.Content>
                <div className="flex flex-col gap-6">
                  <div>
                    <Link href={`/tema/${tema.code}`} target="_blank">
                      Lær mer om {tema.shortName} (åpner i en ny fane)
                    </Link>
                  </div>
                  <List className="flex flex-col gap-2">
                    {kravliste.map((krav, idx) => (
                      <List.Item icon={<div />} key={`krav_${idx}`}>
                        <KravCard
                          krav={krav}
                          kravFilter={EKravFilterType.RELEVANTE_KRAV}
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
  )
}
