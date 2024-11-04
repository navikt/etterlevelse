import { BodyShort, Label, Loader, Search } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import Select, { CSSObjectWithLabel, SingleValue } from 'react-select'
import { useVirkemiddelFilter } from '../../api/VirkemiddelApi'
import { EVirkemiddelListFilter, IVirkemiddel } from '../../constants'
import { CodelistService, EListName, ICode } from '../../services/Codelist'
import { useDebouncedState } from '../../util/hooks/customHooks'
import { EditVirkemiddelModal } from '../virkemiddel/edit/EditVirkemiddelModal'
import { VirkemiddelTable } from './VirkemiddelTable'

type TVirkemiddelOption = {
  value: string
  label: string
}

type TVirkemiddelFilter = {
  virkemiddelType: TVirkemiddelOption
  sort: TVirkemiddelOption[]
}

type TAllVirkemiddelProps = {
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (b: boolean) => void
}

export const AllVirkemiddel = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
}: TAllVirkemiddelProps) => {
  const [codelistUtils] = CodelistService()
  const getSortDateOptions: {
    label: string
    value: string
  }[] = [
    { label: 'sorter på navn', value: 'navn' },
    { label: 'nyest-eldst', value: 'DESC' },
    { label: 'eldst-nyest', value: 'ASC' },
  ]
  const [filter, setFilter] = useState<TVirkemiddelFilter>({
    virkemiddelType: { label: 'Alle virkemiddel typer', value: 'alle' },
    sort: [getSortDateOptions[0]],
  })
  const [sok, setSok] = useDebouncedState('', 300)
  const virkemiddelTyper = codelistUtils.getCodes(EListName.VIRKEMIDDELTYPE) as ICode[]
  const getOptions = (label: string, options: any[]): any[] => [
    { label: label, value: 'alle' },
    ...options,
  ]

  const [data, totalDataLength, setVirkemiddelTypeFilter, loading, refetchData] =
    useVirkemiddelFilter()

  const filteredVirkemiddel: IVirkemiddel[] =
    sok && sok.length > 2
      ? data.filter((virkemiddel: IVirkemiddel) => virkemiddel.navn.includes(sok))
      : data

  const updateFilter = (
    value: { value: string; label: string },
    type: EVirkemiddelListFilter
  ): void => {
    const newFilterValue = { ...filter }
    if (type === EVirkemiddelListFilter.VIRKEMIDDELTYPE) {
      newFilterValue.virkemiddelType = value
    }
    setFilter(newFilterValue)
  }

  useEffect(() => {
    setVirkemiddelTypeFilter(filter.virkemiddelType.value?.toString() || '')
  }, [filter])

  return (
    <div className="w-full pt-6">
      {loading && <Loader size="large" className="flex justify-self-center" />}

      {!loading && (
        <div>
          <div className="w-full justify-center my-5">
            <div className="flex w-full mb-2.5">
              <div className="w-full">
                <Label>{totalDataLength} Virkemiddel</Label>
                <Search
                  label="Søk i virkemiddel"
                  variant="secondary"
                  placeholder="Søk"
                  onChange={(inputValue) => setSok(inputValue)}
                  clearButton
                />
              </div>

              <div className="flex justify-end w-full">
                <div>
                  <Label>Filter</Label>
                  <Select
                    options={getOptions(
                      'Alle virkemiddel typer',
                      virkemiddelTyper?.map((regelverk: ICode) => {
                        return { label: regelverk.shortName, value: regelverk.code }
                      })
                    )}
                    value={filter.virkemiddelType}
                    onChange={(params: SingleValue<TVirkemiddelOption>) => {
                      if (params) {
                        updateFilter(params, EVirkemiddelListFilter.VIRKEMIDDELTYPE)
                      }
                    }}
                    styles={{
                      control: (baseStyles) =>
                        ({
                          ...baseStyles,
                          minHeight: '3rem',
                        }) as CSSObjectWithLabel,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <VirkemiddelTable
            virkemidler={filteredVirkemiddel}
            loading={loading}
            refetchData={refetchData}
          />

          {filteredVirkemiddel.length === 0 && (
            <div className="w-full flex justify-center">
              <BodyShort>Fant ingen virkemiddel</BodyShort>
            </div>
          )}

          <EditVirkemiddelModal
            isOpen={isCreateModalOpen}
            setIsOpen={setIsCreateModalOpen}
            refetchData={refetchData}
          />
        </div>
      )}
    </div>
  )
}
