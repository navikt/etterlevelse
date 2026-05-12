import { TEtterlevelseQL } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { EtterlevelseIngenSeksjon } from './etterlevelseSeksjonStates/etterlevelseIngenSeksjon'
import { EtterlevelseSeksjonFinnes } from './etterlevelseSeksjonStates/etterlevelseSeksjonFinnes/EtterlevelseSeksjonFinnes'

type TProps = {
  krav: TKravQL
  modalVersion?: boolean
  setOpenEtterlevelse: Dispatch<SetStateAction<TEtterlevelseQL | undefined>>
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  filter: string
}

export const EtterlevelseSeksjon: FunctionComponent<TProps> = ({
  krav,
  modalVersion,
  setOpenEtterlevelse,
  setIsModalOpen,
  filter,
}) => (
  <>
    <EtterlevelseSeksjonFinnes
      krav={krav}
      modalVersion={modalVersion}
      setOpenEtterlevelse={setOpenEtterlevelse}
      setIsModalOpen={setIsModalOpen}
      filter={filter}
    />
    <EtterlevelseIngenSeksjon krav={krav} filter={filter} />
  </>
)
