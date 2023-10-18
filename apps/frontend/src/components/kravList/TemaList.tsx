import {codelist, ListName} from '../../services/Codelist'
import {CustomizedPanel, CustomPanelDivider} from '../common/CustomizedAccordion'
import React, {useEffect, useState} from 'react'
import {getAllKrav} from '../../api/KravApi'
import {Krav, KravStatus} from '../../constants'
import {Block} from 'baseui/block'
import {LabelSmall, ParagraphMedium, ParagraphXSmall} from 'baseui/typography'
import {KravPanelHeader} from '../etterlevelseDokumentasjon/KravPanelHeader'
import {borderStyle, marginAll, padding} from '../common/Style'
import StatusView from '../common/StatusTag'
import {PanelLink} from '../common/PanelLink'
import moment from 'moment'
import {ettlevColors, theme} from '../../util/theme'
import Button from '../common/Button'
import {EditPriorityModal} from './edit/EditPriorityModal'
import {sortKraverByPriority} from '../../util/sort'
import {getAllKravPriority} from '../../api/KravPriorityApi'
import {Accordion} from '@navikt/ds-react'

export const TemaList = () => {
  const [allActiveKrav, setAllActiveKrav] = useState<Krav[]>([])
  const [allDraftKrav, setAllDraftKrav] = useState<Krav[]>([])

  useEffect(() => {
    fetchKrav()
  }, [])

  const fetchKrav = () => {
    ;(async () => {
      const kraver = await getAllKrav()
      const allKravPriority = await getAllKravPriority()

      kraver.map((k) => {
        const priority = allKravPriority.filter((kp) => kp.kravNummer === k.kravNummer && kp.kravVersjon === k.kravVersjon)
        k.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
        k.kravPriorityUID = priority.length ? priority[0].id : ''
        return k
      })

      setAllActiveKrav(kraver.filter((k) => k.status === KravStatus.AKTIV))
      setAllDraftKrav(kraver.filter((k) => k.status === KravStatus.UTKAST))
    })()
  }

  return (
    <>
      <Accordion>
        {codelist.getCodes(ListName.TEMA).map((t) => {
          const activeKraver = allActiveKrav?.filter((k) => {
            return k.regelverk.map((r) => r.lov.data && r.lov.data.tema).includes(t.code)
          })
          const draftKraver = allDraftKrav?.filter((k) => {
            return k.regelverk.map((r) => r.lov.data && r.lov.data.tema).includes(t.code)
          })
          return activeKraver && activeKraver.length > 0 ? (
            <CustomizedPanel title={<KravPanelHeader title={t.shortName} kravData={[...activeKraver, ...draftKraver]} />} key={`${t.code}_krav_list`}>
              <KravTemaList activeKraver={sortKraverByPriority(activeKraver, t.shortName)} tema={t.shortName} refresh={fetchKrav} draftKrav={draftKraver} />
            </CustomizedPanel>
          ) : (
            <CustomizedPanel title={<KravPanelHeader title={t.shortName} kravData={[]} />} key={`${t.code}_krav_list`}>
              <CustomPanelDivider>
                <Block display="flex" width="100%" marginLeft="24px">
                  <ParagraphXSmall>Ingen krav</ParagraphXSmall>
                </Block>
              </CustomPanelDivider>
            </CustomizedPanel>
          )
        })}
      </Accordion>
    </>
  )
}

const getKravTemaRowsWithLabel = (kraver: Krav[], tema: string) => {
  return kraver.map((k, index) => {
    return (
      <CustomPanelDivider key={`${k.navn}_${k.kravNummer}_${tema}_${index}`}>
        <PanelLink
          hideChevron
          useDescriptionUnderline
          href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
          title={
            <ParagraphMedium $style={{ fontSize: '14px', marginBottom: '0px', marginTop: '0px', lineHeight: '15px' }}>
              K{k.kravNummer}.{k.kravVersjon}
            </ParagraphMedium>
          }
          beskrivelse={<LabelSmall $style={{ fontSize: '18px', fontWeight: 600 }}>{k.navn}</LabelSmall>}
          rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
          statusText={<StatusView status={k.status} />}
          overrides={{
            Block: {
              style: {
                ':hover': { boxShadow: 'none' },
                ...borderStyle('hidden'),
              },
            },
          }}
        />
      </CustomPanelDivider>
    )
  })
}

const KravTemaList = (props: { activeKraver: Krav[]; tema: string; refresh: Function; draftKrav: Krav[] }) => {
  const [isEditPriorityModalOpen, setIsEditPriorityModalOpen] = React.useState(false)

  return (
    <Block>
      {getKravTemaRowsWithLabel(props.draftKrav, props.tema)}
      {getKravTemaRowsWithLabel(props.activeKraver, props.tema)}

      <CustomPanelDivider>
        <Block
          width="calc(100% - 44px)"
          $style={{
            backgroundColor: ettlevColors.white,
            ...marginAll(theme.sizing.scale300),
            margintRight: '22px',
            marginLeft: '22px',
          }}
        >
          <Block
            display="flex"
            justifyContent="flex-end"
            $style={{
              ...padding(theme.sizing.scale500, theme.sizing.scale1000),
              paddingRight: '16px',
            }}
          >
            <Button kind="secondary" size="mini" onClick={() => setIsEditPriorityModalOpen(true)}>
              Justere rekkefølgen på krav
            </Button>
          </Block>
        </Block>
      </CustomPanelDivider>
      <EditPriorityModal
        tema={props.tema}
        isOpen={isEditPriorityModalOpen}
        setIsOpen={setIsEditPriorityModalOpen}
        kravListe={props.activeKraver}
        refresh={props.refresh}
      ></EditPriorityModal>
    </Block>
  )
}
