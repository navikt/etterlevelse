import { codelist, ListName } from '../../services/Codelist'
import { CustomizedAccordion, CustomizedPanel, CustomPanelDivider } from '../common/CustomizedAccordion'
import React, { useEffect, useState } from 'react'
import { getAllKrav } from '../../api/KravApi'
import { Krav } from '../../constants'
import { Block } from 'baseui/block'
import { Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { KravPanelHeader } from '../behandling/KravPanelHeader'
import { borderStyle, marginAll, padding } from '../common/Style'
import KravStatusView from './KravStatusTag'
import { PanelLink } from '../common/PanelLink'
import moment from 'moment'
import { ettlevColors, theme } from '../../util/theme'
import Button from '../common/Button'
import { EditPriorityModal } from './edit/EditPriorityModal'
import { sortKraverByPriority } from '../../util/sort'

export const TemaList = () => {
  const [allKrav, setAllKrav] = useState<Krav[]>()
  const tema = codelist.getCodes(ListName.TEMA)

  useEffect(() => {
    fetchKrav()
  }, [])

  const fetchKrav = () => {
    ;(async () => {
      setAllKrav(await getAllKrav())
      console.log('REFRESH')
    })()
  }

  return (
    <>
      <CustomizedAccordion>
        {codelist.getCodes(ListName.TEMA).map((t) => {
          const kraver = allKrav?.filter((k) => {
            return k.regelverk.map((r) => r.lov.data && r.lov.data.tema).includes(t.code)
          })
          return kraver && kraver.length > 0 ? (
            <CustomizedPanel title={<KravPanelHeader title={t.shortName} kravData={kraver} />} key={`${t.code}_krav_list`}>
              <KravTemaList kraver={sortKraverByPriority(kraver, t.shortName)} tema={t.shortName} refresh={fetchKrav} />
            </CustomizedPanel>
          ) : (
            <CustomizedPanel title={<KravPanelHeader title={t.shortName} kravData={[]} />} key={`${t.code}_krav_list`}>
              <CustomPanelDivider>
                <Block display="flex" width="100%" marginLeft="24px">
                  <Paragraph4>Ingen krav</Paragraph4>
                </Block>
              </CustomPanelDivider>
            </CustomizedPanel>
          )
        })}
      </CustomizedAccordion>
    </>
  )
}

const KravTemaList = (props: { kraver: Krav[]; tema: string; refresh: Function }) => {
  const [edit, setEdit] = React.useState(false)

  return (
    <Block>
      {props.kraver.map((k, index) => {
        return (
          <CustomPanelDivider key={`${k.navn}_${k.kravNummer}_${props.tema}_${index}`}>
            <PanelLink
              hideChevron
              useDescriptionUnderline
              href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
              title={
                <Paragraph2 $style={{ fontSize: '14px', marginBottom: '0px', marginTop: '0px', lineHeight: '15px' }}>
                  K{k.kravNummer}.{k.kravVersjon}
                </Paragraph2>
              }
              beskrivelse={<Label3 $style={{ fontSize: '18px', lineHeight: '28px' }}>{k.navn}</Label3>}
              rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
              statusText={<KravStatusView status={k.status} />}
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
      })}
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
            }}
          >
            <Button kind="secondary" size="mini" onClick={() => setEdit(true)}>
              Justere rekkefølgen på krav
            </Button>
          </Block>
        </Block>
      </CustomPanelDivider>
      <EditPriorityModal tema={props.tema} isOpen={edit} onClose={() => setEdit(false)} kravListe={props.kraver} refresh={props.refresh}></EditPriorityModal>
    </Block>
  )
}
