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
import { getStatusLabelColor } from '../behandling/utils'

import Button from '../common/Button'
import CustomizedModal from '../common/CustomizedModal'
import StatusView from '../common/StatusTag'
import { borderStyle, borderRadius, marginAll } from '../common/Style'
import { EtterlevelseModal } from '../krav/Etterlevelser'
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
            <Paragraph2 $style={{color:ettlevColors.green600, lineHeight: '16px', marginTop: '0px', marginBottom: '12px', textAlign: 'start', textDecoration: hover ? 'underline' : 'none' }}>
              K{etterlevelse.kravNummer}.{etterlevelse.kravVersjon}
            </Paragraph2>
            <Paragraph4 $style={{color:ettlevColors.green600, lineHeight: '14px', marginTop: '0px', marginBottom: '12px', textAlign: 'start' }}>
              Sist utfylt: {moment(etterlevelse.changeStamp.lastModifiedDate).format('ll')} av {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
            </Paragraph4>
          </Block>
          <Block display="flex" justifyContent="flex-end">
            <StatusView
              status={getEtterlevelseStatus(etterlevelse.status, etterlevelse.fristForFerdigstillelse)}
              statusDisplay={getStatusLabelColor(etterlevelse.status)}
            />
          </Block>
        </Block>
      </Button>

      {kravData && (
        <EtterlevelseModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          etterlevelse={etterlevelse}
          kravData={kravData}
        />
      )}
    </Block>
  )
}
export default EtterlevelseCard