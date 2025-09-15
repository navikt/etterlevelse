'use client'

import { replaceCodelistUsage } from '@/api/kodeverk/kodeverkApi'
import { EObjectType } from '@/constants/admin/audit/auditConstants'
import { ICodeUsage } from '@/constants/kodeverk/kodeverkConstants'
import { IGetParsedOptionsProps, codelist } from '@/services/kodeverk/kodeverkService'
import { Button, Label, Loader, Select, Table } from '@navikt/ds-react'
import { ChangeEvent, createRef, useEffect, useState } from 'react'
import { ObjectLink } from '../../common/commonComponents'

const UsageTable = (props: { usage: ICodeUsage }) => {
  const { usage } = props
  const krav = !!usage.krav.length
  const etterlevelseDokumentasjoner = !!usage.etterlevelseDokumentasjoner.length
  const codelist = !!usage.codelist.length

  const rows = usage
    ? Math.max(usage.krav.length, usage.etterlevelseDokumentasjoner.length, usage.codelist.length)
    : -1

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          {krav && <Table.ColumnHeader>Krav</Table.ColumnHeader>}
          {etterlevelseDokumentasjoner && (
            <Table.ColumnHeader>Etterlevelse Dokumentasjoner</Table.ColumnHeader>
          )}
          {codelist && <Table.ColumnHeader>Codelist</Table.ColumnHeader>}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array.from(Array(rows).keys()).map((index) => {
          const kr = usage.krav[index]
          const ed = usage.etterlevelseDokumentasjoner[index]
          const cl = usage.codelist[index]
          return (
            <Table.Row key={index}>
              {krav && (
                <Table.DataCell>
                  {kr && (
                    <ObjectLink id={kr.id} type={EObjectType.Krav} withHistory={true}>
                      {kr.number} {kr.name}
                    </ObjectLink>
                  )}
                </Table.DataCell>
              )}
              {etterlevelseDokumentasjoner && (
                <Table.DataCell>
                  {ed && (
                    <ObjectLink
                      id={ed.id}
                      type={EObjectType.EtterlevelseDokumentasjon}
                      withHistory={true}
                    >
                      {ed.number} {ed.name}
                    </ObjectLink>
                  )}
                </Table.DataCell>
              )}
              {codelist && (
                <Table.DataCell>
                  {cl && (
                    <ObjectLink id={cl.list} type={EObjectType.Codelist} withHistory={true}>
                      {cl.list} - {cl.code}
                    </ObjectLink>
                  )}
                </Table.DataCell>
              )}
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}

export const Usage = (props: { usage?: ICodeUsage; refresh: () => void }) => {
  const [showReplace, setShowReplace] = useState(false)
  const [newValue, setNewValue] = useState<string>()
  const ref = createRef<HTMLDivElement>()

  const { usage, refresh } = props
  useEffect(() => {
    setShowReplace(false)
    if (typeof window !== 'undefined') {
      setTimeout(() => ref.current && window.scrollTo({ top: ref.current.offsetTop }), 200)
    }
  }, [usage])

  const replace = async () => {
    if (newValue) {
      await replaceCodelistUsage(usage!.listName, usage!.code, newValue).then(() => refresh())
    }
  }

  return (
    <div className='mt-8' ref={ref}>
      <div className='flex justify-between mb-2'>
        <Label>Bruk</Label>
        {!!usage?.inUse && (
          <Button type='button' variant='secondary' onClick={() => setShowReplace(!showReplace)}>
            Erstatt all bruk
          </Button>
        )}
      </div>

      {showReplace && usage && usage.listName && (
        <div className='flex m-4 justify-end'>
          <Select
            label='Velg ny verdi'
            hideLabel
            value={newValue}
            className='mr-4'
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setNewValue(event.target.value)}
          >
            <option value=''>Ny verdi</option>
            {codelist
              .getParsedOptions(usage.listName)
              .map((code: IGetParsedOptionsProps, index: number) => (
                <option key={index + '_' + code.label} value={code.value}>
                  {code.label}
                </option>
              ))}
          </Select>
          <Button type='button' onClick={replace} disabled={!newValue}>
            Erstatt
          </Button>
        </div>
      )}

      {usage && <UsageTable usage={usage} />}
      {!usage && <Loader size='large' className='flex justify-self-center' />}
    </div>
  )
}
