'use client'

import { getAllKrav } from '@/api/krav/kravApi'
import { EListName, IRegelverk, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, IKrav } from '@/constants/krav/kravConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { Accordion, BodyShort } from '@navikt/ds-react'
import { useContext, useEffect, useState } from 'react'
import { KravPanelHeader } from './kravPanelHeader/kravPanelHeader'
import { KravTemaList } from './kravTemaList/kravTemaList'

export const TemaList = () => {
  const [allActiveKrav, setAllActiveKrav] = useState<IKrav[]>([])
  const [allDraftKrav, setAllDraftKrav] = useState<IKrav[]>([])
  const codelist = useContext(CodelistContext)

  useEffect(() => {
    fetchKrav()
  }, [])

  const fetchKrav = (): void => {
    ;(async () => {
      const kraver: IKrav[] = await getAllKrav()

      setAllActiveKrav(kraver.filter((krav: IKrav) => krav.status === EKravStatus.AKTIV))
      setAllDraftKrav(kraver.filter((krav: IKrav) => krav.status === EKravStatus.UTKAST))
    })()
  }

  return (
    <Accordion>
      {codelist.utils.getCodes(EListName.TEMA).map((tema: TTemaCode) => {
        const activeKraver: IKrav[] = allActiveKrav?.filter((krav: IKrav) => {
          return krav.regelverk
            .map((regelverk: IRegelverk) => regelverk.lov.data && regelverk.lov.data.tema)
            .includes(tema.code)
        })
        const draftKraver: IKrav[] = allDraftKrav?.filter((krav: IKrav) => {
          return krav.regelverk
            .map((regelverk: IRegelverk) => regelverk.lov.data && regelverk.lov.data.tema)
            .includes(tema.code)
        })
        return activeKraver && activeKraver.length > 0 ? (
          <Accordion.Item key={tema.code}>
            <Accordion.Header key={`${tema.code}_krav_list`}>
              <KravPanelHeader
                title={tema.shortName}
                kravData={[...activeKraver, ...draftKraver]}
              />
            </Accordion.Header>
            <Accordion.Content>
              <KravTemaList
                activeKravList={activeKraver}
                tema={tema.shortName}
                temaCode={tema.code}
                draftKrav={draftKraver}
              />
            </Accordion.Content>
          </Accordion.Item>
        ) : (
          <Accordion.Item key={tema.code}>
            <Accordion.Header key={`${tema.code}_krav_list`}>
              <KravPanelHeader title={tema.shortName} kravData={[]} />
            </Accordion.Header>
            <Accordion.Content>
              <div className='flex w-full ml-6'>
                <BodyShort size='small'>Ingen krav</BodyShort>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}
