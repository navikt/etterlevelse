import { DocPencilIcon, GlassesIcon, TrashIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, SortState, Table, Tooltip } from '@navikt/ds-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { deleteCodelist, getCodelistUsage, updateCodelist } from '../../../api/CodelistApi'
import {
  EListName,
  ELovCodeRelevans,
  ICode,
  ICodeListFormValues,
  ICodeUsage,
  ILovCodeData,
} from '../../../services/Codelist'
import { handleSort } from '../../../util/handleTableSort'
import { AuditButton } from '../audit/AuditButton'
import { Usage } from './CodeListUsage'
import DeleteCodeListModal from './ModalDeleteCodeList'
import UpdateCodeListModal from './ModalUpdateCodeList'

type TTableCodelistProps = {
  tableData: ICode[]
  refresh: () => void
}

const CodeListTable = ({ tableData, refresh }: TTableCodelistProps) => {
  const [selectedCode, setSelectedCode] = React.useState<ICode>()
  const [showUsage, setShowUsage] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [errorOnResponse, setErrorOnResponse] = React.useState(null)
  const [usage, setUsage] = useState<ICodeUsage>()

  const [sort, setSort] = useState<SortState>()

  useEffect(() => {
    if (showUsage && selectedCode) {
      ;(async () => {
        setUsage(undefined)
        const usage = await getCodelistUsage(selectedCode.list, selectedCode.code)
        setUsage(usage)
      })()
    }
  }, [showUsage, selectedCode])
  useEffect(() => setShowUsage(false), [tableData])

  const handleEditCodelist = async (values: ICodeListFormValues) => {
    try {
      await updateCodelist({ ...values } as ICode)
      refresh()
      setShowEditModal(false)
    } catch (error: any) {
      setShowEditModal(true)
      setErrorOnResponse(error.message)
    }
  }

  const handleDeleteCodelist = async (values: { list: string; code: string }) => {
    try {
      await deleteCodelist(values.list, values.code)
      refresh()
      setShowDeleteModal(false)
    } catch (error: any) {
      setShowDeleteModal(true)
      setErrorOnResponse(error.message)
    }
  }

  let sortedData = tableData

  const comparator = (a: ICode, b: ICode, orderBy: string) => {
    switch (orderBy) {
      case 'code':
        return a.code.localeCompare(b.code)
      case 'navn':
        return (a.shortName || '').localeCompare(b.shortName || '')
      default:
        return 0
    }
  }

  sortedData = sortedData.sort((a, b) => {
    if (sort) {
      return sort.direction === 'ascending'
        ? comparator(b, a, sort.orderBy)
        : comparator(a, b, sort.orderBy)
    }
    return 1
  })

  const getInitailValues = (selectedCode: ICode) => {
    const list = selectedCode.list

    const initialValues: ICodeListFormValues = {
      list: selectedCode.list ?? '',
      code: selectedCode.code ?? '',
      shortName: selectedCode.shortName ?? '',
      description: selectedCode.description ?? '',
    }

    if (selectedCode.data && (list === EListName.LOV || list === EListName.TEMA)) {
      initialValues.data = selectedCode.data
      if (list === EListName.LOV) {
        const codeListData = selectedCode.data as ILovCodeData
        initialValues.data = {
          ...selectedCode.data,
          relevantFor: codeListData.relevantFor
            ? codeListData.relevantFor
            : ELovCodeRelevans.KRAV_OG_VIRKEMIDDEL,
        }
      }
    }

    return initialValues
  }

  return (
    <>
      <Table
        size="large"
        zebraStripes
        sort={sort}
        onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader sortKey="code" className="w-[15%]" sortable>
              ICode
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="navn" className="w-[25%]" sortable>
              Navn
            </Table.ColumnHeader>
            <Table.ColumnHeader className="w-1/2 break-all">Beskrivelse</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedData.map((code: ICode, index) => {
            return (
              <Table.Row key={index + '_' + code.shortName}>
                <Table.DataCell className="w-[15%] break-all" scope="row">
                  {code.code}
                </Table.DataCell>
                <Table.DataCell>{code.shortName}</Table.DataCell>
                <Table.DataCell className="w-1/2 break-all">
                  <div>
                    <BodyLong>{code.description}</BodyLong>
                    <div className="break-words text-icon-warning">
                      {code.data && JSON.stringify(code.data, null, 1)}
                    </div>
                  </div>
                </Table.DataCell>
                <Table.DataCell>
                  <div className="flex justify-end w-full">
                    <Tooltip content="Vis bruk">
                      <Button
                        variant={code === selectedCode && showUsage ? 'primary' : 'tertiary'}
                        onClick={() => {
                          setSelectedCode(code)
                          setShowUsage(true)
                        }}
                        icon={<GlassesIcon title="Vis bruk" />}
                      />
                    </Tooltip>
                    <AuditButton id={`${code.list}-${code.code}`} variant="tertiary" />
                    <Tooltip content="Rediger">
                      <Button
                        variant="tertiary"
                        onClick={() => {
                          setSelectedCode(code)
                          setShowEditModal(true)
                        }}
                        icon={<DocPencilIcon title="Rediger" />}
                      />
                    </Tooltip>
                    <Tooltip content="Slett">
                      <Button
                        variant="tertiary"
                        onClick={() => {
                          setSelectedCode(code)
                          setShowDeleteModal(true)
                        }}
                        icon={<TrashIcon title="Slett" />}
                      />
                    </Tooltip>
                  </div>
                </Table.DataCell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>

      {showEditModal && selectedCode && (
        <UpdateCodeListModal
          title="Rediger kode"
          initialValues={getInitailValues(selectedCode)}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(!showEditModal)
            setErrorOnResponse(null)
          }}
          errorOnUpdate={errorOnResponse}
          submit={handleEditCodelist}
        />
      )}
      {showDeleteModal && selectedCode && (
        <DeleteCodeListModal
          title="Bekreft sletting"
          initialValues={{
            list: selectedCode.list ?? '',
            code: selectedCode.code ?? '',
          }}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(!showDeleteModal)
            setErrorOnResponse(null)
          }}
          errorOnDelete={errorOnResponse}
          submit={handleDeleteCodelist}
        />
      )}

      {showUsage && <Usage usage={usage} refresh={refresh} />}
    </>
  )
}
export default CodeListTable
