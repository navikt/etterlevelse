import { getKravByKravNumberAndVersion } from '@/api/krav/kravApi'
import { IEtterlevelse } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { IKrav } from '@/constants/krav/kravConstants'
import { Button } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import EtterlevelseModal from './etterlevelseModal'

export const EtterlevelseCard = ({ etterlevelse }: { etterlevelse: IEtterlevelse }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [kravData, setKravData] = useState<IKrav>()

  useEffect(() => {
    ;(async () => {
      const krav = await getKravByKravNumberAndVersion(
        etterlevelse.kravNummer,
        etterlevelse.kravVersjon
      )
      if (krav) {
        setKravData(krav)
      }
    })()
  }, [])

  return (
    <div>
      <Button type='button' variant='tertiary' onClick={() => setIsModalOpen(true)}>
        Se dokumentasjon på forrige versjon
      </Button>
      {kravData && (
        <EtterlevelseModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          etterlevelse={etterlevelse}
          kravData={kravData}
        />
      )}
    </div>
  )
}
export default EtterlevelseCard
