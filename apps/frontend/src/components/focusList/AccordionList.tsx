import { Accordion, CheckboxGroup } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { EEtterlevelseStatus, IKravPriorityList, TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'
import { getKravForTema } from '../../util/getKravForTema'
import { CheckList } from './CheckList'

interface IProps {
  focusList: string[]
  temaListe: TTemaCode[]
  kravliste: TKravQL[]
  utgattKravliste: TKravQL[]
  allKravPriority: IKravPriorityList[]
}

export const AccordionList = (props: IProps) => {
  const { focusList, temaListe, kravliste, allKravPriority } = props

  const [valgtKrav, setValgtKrav] = useState<any[]>(focusList)

  useEffect(() => {
    console.debug(valgtKrav)
  }, [valgtKrav])

  return (
    <Accordion indent={false}>
      {allKravPriority.length !== 0 &&
        temaListe.map((tema) => {
          const kravForTema = getKravForTema({ tema, kravliste, allKravPriority })
          const utfylteKrav = kravForTema.filter(
            (krav) =>
              krav.etterlevelseStatus === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
              krav.etterlevelseStatus === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
          )
          return (
            <Accordion.Item
              key={`${tema.code}`}
              className={`flex flex-col gap-2 ${kravForTema.length > 0 ? '' : 'hidden'}`}
            >
              <Accordion.Header>
                <div className="flex gap-4">
                  <span>
                    {tema.shortName} ({utfylteKrav.length} av {kravForTema.length} krav er ferdig
                    utfylt)
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Content>
                <CheckboxGroup
                  legend="Velg krav du ønsker å prioritere"
                  onChange={(value) => {
                    setValgtKrav(value.flat())
                  }}
                  value={valgtKrav}
                >
                  {kravForTema.map((krav, index) => (
                    <CheckList krav={krav} key={`krav_${index}`} />
                  ))}
                </CheckboxGroup>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
    </Accordion>
  )
}
