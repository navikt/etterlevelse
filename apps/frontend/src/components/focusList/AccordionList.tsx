import { Accordion, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { getAllKravPriorityList } from '../../api/KravPriorityListApi'
import { EEtterlevelseStatus, IKravPriorityList, TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'
import { getKravForTema } from '../../util/getKravForTema'
import { CheckList } from './CheckList'

interface IProps {
  temaListe: TTemaCode[]
  kravliste: TKravQL[]
  utgattKravliste: TKravQL[]
}

export const AccordionList = (props: IProps) => {
  const { temaListe, kravliste } = props

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
