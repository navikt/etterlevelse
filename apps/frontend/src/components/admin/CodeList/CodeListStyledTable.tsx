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
import { Cell, Row, Table } from '../../common/Table'
import Button from '../../common/Button'
import { theme } from '../../../util'

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

  return (
    <>
      <Table
        emptyText="koder"
        data={tableData}
        config={{
          useDefaultStringCompare: true,
          initialSortColumn: 'code',
        }}
        headers={[
          { title: 'code', column: 'code', small: true },
          { title: 'Navn', column: 'shortName', small: true },
          { title: 'Beskrivelse', column: 'description', $style: { width: '55%' } },
          { title: '', small: true },
        ]}
        render={(table) =>
          table.data.map((row, index) => (
            <Row key={index}>
              <Cell small $style={{ wordBreak: 'break-word' }}>
                {row.code}
              </Cell>
              <Cell small>{row.shortName}</Cell>
              <Cell $style={{ width: '55%' }}>
                <Block display="flex" flexDirection="column" width="100%">
                  <Block>{row.description}</Block>
                  <Block $style={{ wordBreak: 'break-word' }} color={theme.colors.negative300}>
                    {row.data && JSON.stringify(row.data, null, 1)}
                  </Block>
                </Block>
              </Cell>
              <Cell small>
                <Block display="flex" justifyContent="flex-end" width="100%">
                  <Button
                    tooltip={'Bruk'}
                    size={ButtonSize.compact}
                    kind={row === selectedCode && showUsage ? KIND.primary : KIND.tertiary}
                    onClick={() => {
                      setSelectedCode(row)
                      setShowUsage(true)
                    }}
                    label={'Vis bruk'}
                  >
                    <FontAwesomeIcon icon={faGhost} />
                  </Button>
                  <AuditButton id={`${row.list}-${row.code}`} kind={KIND.tertiary} />
                  <Button
                    tooltip={'Rediger'}
                    size={ButtonSize.compact}
                    kind={KIND.tertiary}
                    onClick={() => {
                      setSelectedCode(row)
                      setShowEditModal(true)
                    }}
                    label={'Rediger'}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    tooltip={'Slett'}
                    size={ButtonSize.compact}
                    kind={KIND.tertiary}
                    onClick={() => {
                      setSelectedCode(row)
                      setShowDeleteModal(true)
                    }}
                    label={'Slett'}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </Block>
              </Cell>
            </Row>
          ))
        }
      />

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
