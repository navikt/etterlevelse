import { InfoBlock } from '@/components/common/infoBlock/infoBlock'
import EtterlevelseModal from '@/components/etterlevelse/etterlevelseModal/etterlevelseModal'
import { EtterlevelseProduktOmrade } from '@/components/etterlevelse/etterlevelseProduktOmrade/etterlevelseProduktOmrade'
import { sadFolderIcon } from '@/components/others/images/images'
import { TEtterlevelseQL } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { etterlevelseFilter, etterlevelserSorted } from '@/util/etterlevelseUtil/etterlevelseUtil'
import { ettlevColors } from '@/util/theme/theme'
import { Label, Loader, Select } from '@navikt/ds-react'
import { ChangeEvent, FunctionComponent, useState } from 'react'

type TProps = {
  loading: boolean
  krav: TKravQL
  modalVersion?: boolean
}

export const KravEtterlevelser: FunctionComponent<TProps> = ({ loading, krav, modalVersion }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [openEtterlevelse, setOpenEtterlevelse] = useState<TEtterlevelseQL>()
  const [filter, setFilter] = useState<string>('ALLE')

  const etterlevelser: TEtterlevelseQL[] = etterlevelserSorted(krav)

  return (
    <div>
      {!loading && etterlevelser.length > 0 && (
        <div className='flex items-center py-5'>
          <Label>Vis:</Label>
          <div className='px-4 w-72'>
            <Select
              label='Velg etterlevelse filter'
              hideLabel
              value={filter}
              onChange={(params: ChangeEvent<HTMLSelectElement>) => {
                setFilter(params.target.value)
              }}
            >
              {etterlevelseFilter.map(
                (
                  filter: {
                    label: string
                    id: string
                  },
                  index: number
                ) => (
                  <option key={`${index}_${filter.label}`} value={filter.id}>
                    {filter.label}
                  </option>
                )
              )}
            </Select>
          </div>
        </div>
      )}
      {loading && <Loader size='large' className='flex justify-self-center' />}
      {!loading && !etterlevelser.length && (
        <InfoBlock
          icon={sadFolderIcon}
          alt='Trist mappe ikon'
          text='Det er ikke dokumentert etterlevelse på dette kravet'
          color={ettlevColors.red50}
        />
      )}

      <EtterlevelseProduktOmrade
        krav={krav}
        modalVersion={modalVersion}
        setOpenEtterlevelse={setOpenEtterlevelse}
        setIsModalOpen={setIsModalOpen}
        filter={filter}
      />

      {modalVersion && openEtterlevelse && krav && (
        <EtterlevelseModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          etterlevelse={openEtterlevelse}
          kravData={krav}
        />
      )}
    </div>
  )
}
