import { Accordion, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { getAllKravPriorityList } from '../../api/KravPriorityListApi'
import { EEtterlevelseStatus, IKravPriorityList, TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'
import { getKravForTema } from '../../util/getKravForTema'
import { CheckList } from './checkList'

interface IProps {
  temaListe: TTemaCode[]
  kravliste: TKravQL[]
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
        temaListe.map((tema, index) => {
          const kravForTema = getKravForTema({ tema, kravliste, allKravPriority })
          const utfylteKrav = kravForTema.filter(
            (krav) =>
              krav.etterlevelseStatus === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
              krav.etterlevelseStatus === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
          )
          return (
            <Accordion.Item>
              <Accordion.Header>HEADER</Accordion.Header>
              <Accordion.Content>
                {/* legge inn Velg krav du jobber med nå [] Alle */}
                <CheckboxGroup legend="Velg krav du jobber med nå">
                  <Checkbox value="ALLE Oleoleoleloelja">Alle</Checkbox>
                </CheckboxGroup>
                {/* gjør denne diven til en gjenbrukbar sjekkliste komponent */}
                <CheckList />
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
    </Accordion>
  )
}
