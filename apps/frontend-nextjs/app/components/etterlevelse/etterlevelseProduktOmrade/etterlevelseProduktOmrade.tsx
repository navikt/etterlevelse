import { TEtterlevelseQL } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { EtterlevelseProduktOmradeIngen } from './etterlevelseProduktOmradeIngen/etterlevelseProduktOmradeIngen'
import { EtterlevelseProduktOmradeFinnes } from './xetterlevelseProduktOmradeFinnes/EtterlevelseProduktOmradeFinnes'

type TProps = {
  krav: TKravQL
  modalVersion?: boolean
  setOpenEtterlevelse: Dispatch<SetStateAction<TEtterlevelseQL | undefined>>
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  filter: string
}

export const EtterlevelseProduktOmrade: FunctionComponent<TProps> = ({
  krav,
  modalVersion,
  setOpenEtterlevelse,
  setIsModalOpen,
  filter,
}) => (
  <>
    <EtterlevelseProduktOmradeFinnes
      krav={krav}
      modalVersion={modalVersion}
      setOpenEtterlevelse={setOpenEtterlevelse}
      setIsModalOpen={setIsModalOpen}
      filter={filter}
    />
    <EtterlevelseProduktOmradeIngen krav={krav} filter={filter} />
  </>
)
