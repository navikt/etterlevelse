import { codelist, ListName } from '../../services/Codelist'
import { CustomizedAccordion, CustomizedPanel, CustomPanelDivider } from '../common/CustomizedAccordion'
import React, { useEffect, useState } from 'react'
import { getAllKrav } from '../../api/KravApi'
import { Krav } from '../../constants'
import { Block } from 'baseui/block'
import { Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { KravPanelHeader } from '../behandling/KravPanelHeader'
import { borderStyle } from '../common/Style'
import KravStatusView from './KravStatusTag'
import { PanelLink } from '../common/PanelLink'
import moment from 'moment'

export const TemaList = () => {
  const [allKrav, setAllKrav] = useState<Krav[]>()
  const tema = codelist.getCodes(ListName.TEMA)

  useEffect(() => {
    (async () => {
      // setLoading(true)
      setAllKrav(await getAllKrav());
      console.log(await getAllKrav())
      // if (processes) {
      //   setDpProcesses(processes)
      // }
      // setLoading(false)
    })()
  }, []);

  return (
    <>
      <CustomizedAccordion>
        {
          codelist.getCodes(ListName.TEMA).map(t => {
            const kraver = allKrav?.filter(k => {
              return k.regelverk.map(r => r.lov.data && r.lov.data.tema).includes(t.code)
            })
            return kraver && kraver.length > 0 ? (
              <CustomizedPanel title={<KravPanelHeader title={t.shortName} kravData={kraver} />} key={`${t.code}_krav_list`}>
                <KravTemaList kraver={kraver} />
              </CustomizedPanel>
            ) :
              <CustomizedPanel title={<KravPanelHeader title={t.shortName} kravData={[]} />} key={`${t.code}_krav_list`}>
                <CustomPanelDivider>
                  <Block display="flex" width="100%" marginLeft="24px">
                    <Paragraph4>Ingen krav under utfylling</Paragraph4>
                  </Block>
                </CustomPanelDivider>
              </CustomizedPanel>
          })
        }
      </CustomizedAccordion>
    </>
  )
}

const KravTemaList = (props: { kraver: Krav[]; }) => {
  const [kraver, setKraver] = React.useState<Krav[]>(props.kraver)
  const [edit, setEdit] = React.useState(false)

  return (
    <Block>
      {kraver.map((k) => {
        return (
          <CustomPanelDivider key={`${k.navn}_${k.kravNummer}`}>
            <PanelLink
              hideChevron
              useDescriptionUnderline
              href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
              title={
                <Paragraph2 $style={{ fontSize: '16px', marginBottom: '0px', marginTop: '0px' }}>
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
    </Block>
  )
}