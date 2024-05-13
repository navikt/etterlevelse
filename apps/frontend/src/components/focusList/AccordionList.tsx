import { Accordion, Checkbox, CheckboxGroup, Tag } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { getAllKravPriorityList } from '../../api/KravPriorityListApi'
import { EEtterlevelseStatus, IKravPriorityList, TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'
import { getNumberOfDaysBetween } from '../../util/checkAge'
import { getKravForTema } from '../../util/getKravForTema'
import { CheckList } from './CheckList'

interface IProps {
  temaListe: TTemaCode[]
  kravliste: TKravQL[]
  utgattKravliste: TKravQL[]
}

export const AccordionList = (props: IProps) => {
  const { temaListe, kravliste, utgattKravliste } = props

  const [allKravPriority, setAllKravPriority] = useState<IKravPriorityList[]>([])

  useEffect(() => {
    getAllKravPriorityList().then((priority) => setAllKravPriority(priority))
  }, [])

  return (
    <Accordion>
      {allKravPriority.length !== 0 &&
        temaListe.map((tema) => {
          const kravForTema = getKravForTema({ tema, kravliste, allKravPriority })
          const utfylteKrav = kravForTema.filter(
            (krav) =>
              krav.etterlevelseStatus === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
              krav.etterlevelseStatus === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
          )
          return (
            <Accordion.Item key={`${tema.code}`}>
              <Accordion.Header>
                <div className="flex gap-4">
                  <span>
                    {tema.shortName} ({utfylteKrav.length} av {kravForTema.length} krav er ferdig
                    utfylt)
                  </span>
                  {kravForTema.find(
                    (krav) =>
                      krav.kravVersjon === 1 &&
                      (krav.etterlevelseStatus === undefined ||
                        krav.etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE) &&
                      getNumberOfDaysBetween(krav.aktivertDato, new Date()) < 30
                  ) && <Tag variant="warning">Nytt krav</Tag>}
                  {kravForTema.find(
                    (krav) =>
                      krav.kravVersjon > 1 &&
                      (krav.etterlevelseStatus === undefined ||
                        krav.etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE) &&
                      utgattKravliste.filter(
                        (kl) => kl.kravNummer === krav.kravNummer && kl.etterlevelser.length > 0
                      ).length > 0 &&
                      getNumberOfDaysBetween(krav.aktivertDato, new Date()) < 30
                  ) && <Tag variant="warning">Ny versjon</Tag>}
                </div>
              </Accordion.Header>
              <Accordion.Content>
                <CheckboxGroup legend="Velg krav du jobber med nå">
                  <Checkbox value="">Alle</Checkbox>
                </CheckboxGroup>
                {kravForTema.map((krav, index) => (
                  <CheckList krav={krav} key={`krav_${index}`} />
                ))}
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
    </Accordion>
  )
}
