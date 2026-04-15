'use client'

import { searchAuditsByTableAndSearchTerm } from '@/api/audit/auditApi'
import { ESearchDataType, IAuditItem } from '@/constants/admin/audit/auditConstants'
import { searchDataTypeToOptions } from '@/util/auditUtils/auditUtils'
import { BodyLong, Button, Dialog, LocalAlert, Select, TextField } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { useState } from 'react'

export const SearchAuditModal = () => {
  const [selectedDataType, setSelectedDataType] = useState<ESearchDataType>()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [auditItems, setAuditItem] = useState<IAuditItem[]>()

  const searchDataTypeOptions = Object.keys(ESearchDataType).map((oa) =>
    searchDataTypeToOptions(oa as ESearchDataType)
  )

  return (
    <Dialog>
      <Dialog.Trigger>
        <Button variant='secondary'>Søk uuid for data type</Button>
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>Søk uuid for data type</Dialog.Title>
          <Dialog.Description>Velg data type og søk</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <div className='flex gap-5 my-5'>
            <Select
              label='Data type:'
              hideLabel
              value={selectedDataType}
              onChange={(e) => setSelectedDataType(e.target.value as ESearchDataType)}
            >
              <option value=''>Velg data type</option>
              {searchDataTypeOptions.map((searchDataTypeOption, index) => (
                <option
                  key={index + '_' + searchDataTypeOption.label}
                  value={searchDataTypeOption.value}
                >
                  {searchDataTypeOption.label}
                </option>
              ))}
            </Select>

            <TextField
              label='Søk'
              hideLabel
              disabled={[null, undefined, ''].includes(selectedDataType)}
              value={searchTerm}
              placeholder='Søk'
              onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              className='w-72'
            />

            <Button
              onClick={async () => {
                if (searchTerm.length < 3) {
                  setError('Skriv minst 3 tegn for å søke')
                } else {
                  await searchAuditsByTableAndSearchTerm(
                    searchTerm,
                    selectedDataType as ESearchDataType
                  )
                    .then(setAuditItem)
                    .catch((e: AxiosError) => setError(e.message))
                }
              }}
            >
              Søk
            </Button>
          </div>

          {error !== '' && (
            <LocalAlert status='error'>
              <LocalAlert.Header>
                <LocalAlert.Title>Søk feilet</LocalAlert.Title>
                <LocalAlert.CloseButton onClick={() => setError('')} />
              </LocalAlert.Header>
              <LocalAlert.Content>{error}</LocalAlert.Content>
            </LocalAlert>
          )}

          {auditItems && auditItems.length !== 0 && (
            <div>
              {auditItems.map((item) => (
                <BodyLong key={item.tableId}>{item.tableId}</BodyLong>
              ))}
            </div>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseTrigger>
            <Button>Lukk</Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}

export default SearchAuditModal
