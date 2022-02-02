import { Block } from 'baseui/block'

import { Paragraph2, Paragraph4, H1 } from 'baseui/typography'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { getKravByKravNumberAndVersion } from '../../api/KravApi'
import { Etterlevelse, Krav } from '../../constants'
import { isFerdigUtfylt } from '../../pages/BehandlingerTemaPageV2'
import { getEtterlevelseStatus } from '../../pages/EtterlevelsePage'
import { kravNumView } from '../../pages/KravPage'
import { ettlevColors, maxPageWidth, responsivePaddingExtraLarge } from '../../util/theme'

import Button from '../common/Button'
import CustomizedModal from '../common/CustomizedModal'
import StatusView from '../common/StatusTag'
import { borderStyle, borderRadius, marginAll } from '../common/Style'
import { ViewEtterlevelse } from './ViewEtterlevelse'

export const EtterlevelseCard = ({ etterlevelse }: { etterlevelse: Etterlevelse }) => {
  const [hover, setHover] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [kravData, setKravData] = useState<Krav>()

  useEffect(() => {
    ; (async () => {
      const krav = await getKravByKravNumberAndVersion(etterlevelse.kravNummer, etterlevelse.kravVersjon)
      if (krav) {
        setKravData(krav)
      }
    })()
  }, [])

  return (
    <Block width="100%">
      <Button
        notBold
        type="button"
        $style={{
          width: '100%',
          paddingTop: '8px',
          paddingBottom: '8px',
          paddingRight: '24px',
          paddingLeft: '8px',
          display: 'flex',
          justifyContent: 'flex-start',
          backgroundColor: ettlevColors.white,
          ...borderStyle('hidden'),
          ':hover': { backgroundColor: 'none' },
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <Block display="flex" width="100%" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} paddingLeft="15px" paddingRight="15px">
          <Block display="flex" alignContent="center" flexDirection="column" width="100%">
            <Paragraph2 $style={{ lineHeight: '16px', marginTop: '0px', marinBottom: '0px', textAlign: 'start', textDecoration: hover ? 'underline' : 'none' }}>
              K{etterlevelse.kravNummer}.{etterlevelse.kravVersjon}
            </Paragraph2>
            <Paragraph4 $style={{ lineHeight: '14px', marginTop: '0px', marinBottom: '0px', textAlign: 'start' }}>
              Sist utfylt: {moment(etterlevelse.changeStamp.lastModifiedDate).format('ll')} av {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
            </Paragraph4>
          </Block>
          <Block display="flex" justifyContent="flex-end">
            <StatusView
              status={getEtterlevelseStatus(etterlevelse.status)}
              statusDisplay={{
                background: isFerdigUtfylt(etterlevelse.status) ? ettlevColors.green50 : '#FFECCC',
                border: isFerdigUtfylt(etterlevelse.status) ? ettlevColors.green400 : '#D47B00',
              }}
            />
          </Block>
        </Block>
      </Button>

      {kravData && (
        <CustomizedModal
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          size="full"
          overrides={{
            Dialog: {
              style: {
                ...borderRadius('0px'),
                ...marginAll('0px'),
                width: '100%',
                maxWidth: maxPageWidth,
              },
            },
          }}
        >
          <Block width="100%">
            <Block backgroundColor={ettlevColors.green800} paddingTop="32px" paddingBottom="32px">
              <Block paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
                <Paragraph2
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    color: ettlevColors.white,
                  }}
                >
                  {kravNumView(kravData)}
                </Paragraph2>
                <H1 $style={{ marginTop: '0px', marginBottom: '0px', paddingBottom: '32px', color: ettlevColors.white }}>{kravData.navn}</H1>
              </Block>
            </Block>

            <Block paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
              <ViewEtterlevelse etterlevelse={etterlevelse} viewMode krav={kravData} />
              <Block display="flex" justifyContent="flex-end" paddingBottom="31px" paddingTop="95px">
                <Button
                  onClick={() => {
                    console.log('CLICK')
                    console.log(isModalOpen)
                    setIsModalOpen(false)
                    console.log(isModalOpen)
                  }}
                >
                  Lukk visning
                </Button>
              </Block>
            </Block>
          </Block>
        </CustomizedModal>
      )}
    </Block>
  )
}
export default EtterlevelseCard