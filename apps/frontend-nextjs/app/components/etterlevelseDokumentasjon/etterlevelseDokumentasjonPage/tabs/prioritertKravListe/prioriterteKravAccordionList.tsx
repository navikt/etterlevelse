'use client'

import { CheckList } from '@/components/etterlevelseDokumentasjon/etterlevelseDokumentasjonPage/tabs/prioritertKravListe/checkList'
import { EEtterlevelseStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { getKravForTema } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { Accordion, CheckboxGroup } from '@navikt/ds-react'
import { FieldArrayRenderProps } from 'formik'
import { FunctionComponent, useContext, useState } from 'react'

type TProps = {
  fieldArrayRenderProps: FieldArrayRenderProps
  temaListe: TTemaCode[]
  kravliste: TKravQL[]
  allKravPriority: IKravPriorityList[]
}

export const PrioriterteKravAccordionList: FunctionComponent<TProps> = ({
  fieldArrayRenderProps,
  temaListe,
  kravliste,
  allKravPriority,
}) => {
  const [focusList, setFocusList] = useState(
    fieldArrayRenderProps.form.values['prioritertKravNummer'] || []
  )
  const codelist = useContext(CodelistContext)

  return (
    <Accordion indent={false}>
      {allKravPriority.length !== 0 &&
        temaListe.map((tema) => {
          const kravForTema = getKravForTema({ tema, kravliste, allKravPriority, codelist })
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
                <div className='flex gap-4'>
                  <span>
                    {tema.shortName} ({utfylteKrav.length} av {kravForTema.length} krav er ferdig
                    utfylt)
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Content>
                <CheckboxGroup
                  legend='Velg krav du ønsker å prioritere'
                  value={focusList}
                  onChange={(values) => {
                    setFocusList(values)
                    fieldArrayRenderProps.form.setFieldValue('prioritertKravNummer', values)
                  }}
                >
                  <div className='mt-4'>
                    {kravForTema.map((krav, index) => (
                      <CheckList krav={krav} key={`krav_${index}`} />
                    ))}
                  </div>
                </CheckboxGroup>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
    </Accordion>
  )
}
