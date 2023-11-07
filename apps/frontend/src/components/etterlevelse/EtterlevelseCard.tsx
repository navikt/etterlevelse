import { Block } from 'baseui/block'
import { ParagraphMedium } from 'baseui/typography'
import { useEffect, useState } from 'react'
import { getKravByKravNumberAndVersion } from '../../api/KravApi'
import { Etterlevelse, Krav } from '../../constants'
import { ettlevColors } from '../../util/theme'

import Button from '../common/Button'
import EtterlevelseModal from './EtterlevelseModal'

export const EtterlevelseCard = ({ etterlevelse }: { etterlevelse: Etterlevelse }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [kravData, setKravData] = useState<Krav>()

  useEffect(() => {
    ;(async () => {
      const krav = await getKravByKravNumberAndVersion(etterlevelse.kravNummer, etterlevelse.kravVersjon)
      if (krav) {
        setKravData(krav)
      }
    })()
  }, [])

  return (
    <Block width="100%">
      <Button
        type="button"
        kind={'underline-hover'}
        onClick={() => setIsModalOpen(true)}
        $style={{
          textDecoration: 'underline 1px',
          textUnderlineOffset: '1px',
          ':hover': {
            color: ettlevColors.green400,
          },
        }}
      >
        <ParagraphMedium
          marginTop="0px"
          marginBottom="0px"
          $style={{
            color: ettlevColors.green600,
            ':hover': {
              color: ettlevColors.green400,
            },
          }}
        >
          Se dokumentasjon på forrige versjon
        </ParagraphMedium>
      </Button>

      {kravData && <EtterlevelseModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} etterlevelse={etterlevelse} kravData={kravData} />}
    </Block>
  )
}
export default EtterlevelseCard
