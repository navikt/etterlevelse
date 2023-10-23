import * as React from 'react'
import { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { KIND, SIZE as ButtonSize } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faGhost, faTrash } from '@fortawesome/free-solid-svg-icons'
import UpdateCodeListModal from './ModalUpdateCodeList'
import DeleteCodeListModal from './ModalDeleteCodeList'
import { Usage } from './CodeListUsage'
import { AuditButton } from '../audit/AuditButton'
import { Code, CodeListFormValues, CodeUsage } from '../../../services/Codelist'
import { deleteCodelist, getCodelistUsage, updateCodelist } from '../../../api/CodelistApi'
import { Cell, Row, Table as TableTemp } from '../../common/Table'
import { theme } from '../../../util'
import { Button, SortState, Table, Tooltip } from '@navikt/ds-react'
import { handleSort } from '../../../util/handleTableSort'
import { DocPencilIcon, GlassesIcon, TrashIcon } from '@navikt/aksel-icons'

type TableCodelistProps = {
  tableData: Code[]
  refresh: () => void
}

const CodeListTable = ({ tableData, refresh }: TableCodelistProps) => {
  const [selectedCode, setSelectedCode] = React.useState<Code>()
  const [showUsage, setShowUsage] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [errorOnResponse, setErrorOnResponse] = React.useState(null)
  const [usage, setUsage] = useState<CodeUsage>()

  const [sort, setSort] = useState<SortState>()

  useEffect(() => {
    if (showUsage && selectedCode) {
      ; (async () => {
        setUsage(undefined)
        const usage = await getCodelistUsage(selectedCode.list, selectedCode.code)
        setUsage(usage)
      })()
    }
  }, [showUsage, selectedCode])
  useEffect(() => setShowUsage(false), [tableData])

  const handleEditCodelist = async (values: CodeListFormValues) => {
    try {
      await updateCodelist({ ...values } as Code)
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

  const comparator = (a: Code, b: Code, orderBy: string) => {
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

  return (
    <>
      <Table size="large" zebraStripes sort={sort} onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader sortKey="code" className="w-[15%]" sortable>Code</Table.ColumnHeader>
            <Table.ColumnHeader sortKey="navn" className="w-[25%]" sortable>Navn</Table.ColumnHeader>
            <Table.ColumnHeader className="w-1/2" >Beskrivelse</Table.ColumnHeader>
            <Table.ColumnHeader ></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedData.map((code: Code, i) => {
            return (
              <Table.Row key={i + '_' + code.shortName}>
                <Table.DataCell className="w-[15%] break-all" scope="row">{code.code}</Table.DataCell>
                <Table.DataCell >{code.shortName}</Table.DataCell>
                <Table.DataCell className="w-1/2">
                  <div className="flex flex-col w-full">
                    <div>{code.description}</div>
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
          initialValues={{
            list: selectedCode.list ?? '',
            code: selectedCode.code ?? '',
            shortName: selectedCode.shortName ?? '',
            description: selectedCode.description ?? '',
            data: selectedCode.data || {},
          }}
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
