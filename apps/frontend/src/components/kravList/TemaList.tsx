import { Accordion, BodyLong, BodyShort, Button, Label, LinkPanel, Spacer } from '@navikt/ds-react'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { getAllKrav } from '../../api/KravApi'
import { useKravPriorityList } from '../../api/KravPriorityListApi'
import { EKravStatus, IKrav, IKravPriorityList } from '../../constants'
import { EListName, codelist } from '../../services/Codelist'
import { sortKravListeByPriority } from '../../util/sort'
import StatusView from '../common/StatusTag'
import { KravPanelHeader } from '../etterlevelseDokumentasjon/KravPanelHeader'
import { EditPriorityModal } from './edit/EditPriorityModal'

export const TemaList = () => {
  const [allActiveKrav, setAllActiveKrav] = useState<IKrav[]>([])
  const [allDraftKrav, setAllDraftKrav] = useState<IKrav[]>([])

  useEffect(() => {
    fetchKrav()
  }, [])

  const fetchKrav = () => {
    ;(async () => {
      const kraver = await getAllKrav()

      setAllActiveKrav(kraver.filter((krav) => krav.status === EKravStatus.AKTIV))
      setAllDraftKrav(kraver.filter((krav) => krav.status === EKravStatus.UTKAST))
    })()
  }

  return (
    <Accordion>
      {codelist.getCodes(EListName.TEMA).map((tema) => {
        const activeKraver = allActiveKrav?.filter((k) => {
          return k.regelverk
            .map((regelverk) => regelverk.lov.data && regelverk.lov.data.tema)
            .includes(tema.code)
        })
        const draftKraver = allDraftKrav?.filter((k) => {
          return k.regelverk
            .map((regelverk) => regelverk.lov.data && regelverk.lov.data.tema)
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
              <div className="flex w-full ml-6">
                <BodyShort size="small">Ingen krav</BodyShort>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

const getKravTemaRowsWithLabel = (kravListe: IKrav[], tema: string) => {
  return kravListe.map((krav, index) => {
    return (
      <div key={`${krav.navn}_${krav.kravNummer}_${tema}_${index}`}>
        <LinkPanel href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>
          <LinkPanel.Title className="flex items-center">
            <div className="max-w-xl">
              <BodyShort size="small">
                K{krav.kravNummer}.{krav.kravVersjon}
              </BodyShort>
              <BodyLong>
                <Label>{krav.navn}</Label>
              </BodyLong>
            </div>
            <Spacer />
            <div className="mr-5">
              <StatusView status={krav.status} />
            </div>
            <div className="w-44">
              <BodyShort size="small">
                {krav.changeStamp.lastModifiedDate !== undefined &&
                krav.changeStamp.lastModifiedDate !== ''
                  ? `Sist endret: ${moment(krav.changeStamp.lastModifiedDate).format('ll')}`
                  : ''}
              </BodyShort>
            </div>
          </LinkPanel.Title>
        </LinkPanel>
      </div>
    )
  })
}

const KravTemaList = (props: {
  activeKravList: IKrav[]
  tema: string
  temaCode: string
  draftKrav: IKrav[]
}) => {
  const [isEditPriorityModalOpen, setIsEditPriorityModalOpen] = React.useState(false)
  const { activeKravList, tema, temaCode, draftKrav } = props
  const [kravPriorityList, kravPriorityLoading, refresh] = useKravPriorityList(temaCode)
  const [activeKravSortedWithPriority, setActiveKravSortedWithPriority] = useState<IKrav[]>([])

  const setPriorityToKravList = (kravList: IKrav[], priorityList: IKravPriorityList) => {
    return kravList.map((krav) => {
      const priorityForTema = priorityList.priorityList.indexOf(krav.kravNummer) + 1
      krav.prioriteringsId = priorityForTema
      return krav
    })
  }

  useEffect(() => {
    const activeKravListWithPriorityId = setPriorityToKravList(activeKravList, kravPriorityList)
    setActiveKravSortedWithPriority(sortKravListeByPriority(activeKravListWithPriorityId))
  }, [kravPriorityList])

  return (
    <div className="flex flex-col gap-2">
      {getKravTemaRowsWithLabel(draftKrav, tema)}
      {getKravTemaRowsWithLabel(activeKravSortedWithPriority, tema)}

      <div className={'w-full flex flex-row-reverse pt-5'}>
        <Button variant="secondary" size="medium" onClick={() => setIsEditPriorityModalOpen(true)}>
          Endre rekkefølge på krav
        </Button>
      </div>

      {activeKravSortedWithPriority && isEditPriorityModalOpen && !kravPriorityLoading && (
        <EditPriorityModal
          tema={tema}
          temaCode={temaCode}
          isOpen={isEditPriorityModalOpen}
          setIsOpen={setIsEditPriorityModalOpen}
          kravListe={activeKravSortedWithPriority}
          kravPriorityList={kravPriorityList}
          refresh={() => refresh()}
        />
      )}
    </div>
  )
}
