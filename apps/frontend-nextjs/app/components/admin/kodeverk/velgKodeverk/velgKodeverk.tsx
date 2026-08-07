import { IAllCodelists } from '@/constants/kodeverk/kodeverkConstants'
import { ICodelistProps } from '@/provider/kodeverk/kodeverkProvider'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button, Select } from '@navikt/ds-react'
import { ChangeEvent, Dispatch, FunctionComponent, SetStateAction } from 'react'

type TProps = {
  selectedListname: string
  setSelectedListname: Dispatch<SetStateAction<string>>
  codelist: {
    utils: ICodelistProps
    lists: IAllCodelists
  }
  listname: string
  setCreateCodeListModal: (value: SetStateAction<boolean>) => void
  createCodeListModal: boolean
}

const VelgKodeverk: FunctionComponent<TProps> = ({
  selectedListname,
  setSelectedListname,
  codelist,
  listname,
  setCreateCodeListModal,
  createCodeListModal,
}) => (
  <div className='flex justify-between w-full'>
    <Select
      label='Velg kodeverk'
      hideLabel
      className='w-full max-w-xl'
      value={selectedListname}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedListname(event.target.value)}
    >
      <option value=''>Velg kodeverk</option>
      {codelist.utils.makeValueLabelForAllCodeLists().map(
        (
          codeLabel: {
            value: string
            label: string
          },
          index: number
        ) => {
          return (
            <option key={index + '_' + codeLabel.label} value={codeLabel.value}>
              {codeLabel.label}
            </option>
          )
        }
      )}
    </Select>

    {listname && (
      <Button
        icon={<PlusIcon aria-label='' aria-hidden />}
        variant='tertiary'
        onClick={() => setCreateCodeListModal(!createCodeListModal)}
      >
        Opprett ny kode
      </Button>
    )}
  </div>
)

export default VelgKodeverk
