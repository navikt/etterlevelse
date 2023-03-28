import {Block} from 'baseui/block'
import React, {useState} from 'react'
import moment from 'moment'
import {Virkemiddel} from '../../constants'
import {SkeletonPanel} from '../common/LoadingSkeleton'
import {Cell, Row, Table} from '../common/Table'
import Button from '../common/Button'
import {SIZE as ButtonSize} from 'baseui/button/constants'
import {KIND} from 'baseui/button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEdit} from '@fortawesome/free-solid-svg-icons'
import {ColumnCompares} from '../../util/hooks'
import {EditVirkemiddelModal} from '../virkemiddel/edit/EditVirkemiddelModal'


type VirkmiddelTableProps = {
  virkemidler: Virkemiddel[]
  loading: boolean
  refetchData: () => void
}

const virkemiddelSorting: ColumnCompares<Virkemiddel> = {
  navn: (a, b) => (a.navn || '').localeCompare(b.navn || ''),
  virkemiddelType: (a, b) => (a.virkemiddelType?.shortName || '').localeCompare(b.virkemiddelType?.shortName || ''),
  changeStamp: (a, b) => (a.changeStamp.lastModifiedDate || '').localeCompare(b.changeStamp.lastModifiedDate || ''),
}

export const VirkemiddelTable = ({virkemidler, loading, refetchData}: VirkmiddelTableProps) => {
  const [selectedVirkemiddel, setSelectedVirkemiddel] = useState<Virkemiddel>()
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  if (loading) return <SkeletonPanel count={5}/>
  return (
    <>
      <Table
        emptyText="koder"
        data={virkemidler}
        config={{
          useDefaultStringCompare: true,
          initialSortColumn: 'navn',
          sorting: virkemiddelSorting,
          pageSizes: [5, 10, 20, 50, 100],
          defaultPageSize: 20,
        }}
        headers={[
          {title: 'Navn', column: 'navn', small: true},
          {title: 'Virkemiddeltype', column: 'virkemiddelType', $style: {width: '55%'}},
          {title: 'Siste endret', column: 'changeStamp', $style: {width: '55%'}},
          {title: '', small: true},
        ]}
        render={(table) =>
          table.data.map((virkemiddel, index) => (
            <Row key={index}>
              <Cell small $style={{wordBreak: 'break-word'}}>
                {virkemiddel.navn}
              </Cell>
              <Cell $style={{width: '55%'}}>
                <Block display="flex" flexDirection="column" width="100%">
                  <Block>{virkemiddel.virkemiddelType && virkemiddel.virkemiddelType.shortName}</Block>
                </Block>
              </Cell>
              <Cell>{moment(virkemiddel.changeStamp.lastModifiedDate).format('ll')}</Cell>
              <Cell small>
                <Block display="flex" justifyContent="flex-end" width="100%">
                  <Button
                    tooltip={'Rediger'}
                    size={ButtonSize.compact}
                    kind={KIND.tertiary}
                    onClick={() => {
                      setSelectedVirkemiddel(virkemiddel)
                      setIsEditModalOpen(true)
                    }}
                    label={'Rediger'}
                  >
                    <FontAwesomeIcon icon={faEdit}/>
                  </Button>
                  {/*<Button*/}
                  {/*  tooltip={'Slett'}*/}
                  {/*  size={ButtonSize.compact}*/}
                  {/*  kind={KIND.tertiary}*/}
                  {/*  onClick={() => {*/}
                  {/*    setSelectedCode(row)*/}
                  {/*    setShowDeleteModal(true)*/}
                  {/*  }}*/}
                  {/*  label={'Slett'}*/}
                  {/*>*/}
                  {/*  <FontAwesomeIcon icon={faTrash} />*/}
                  {/*</Button>*/}
                </Block>
              </Cell>
            </Row>
          ))
        }
      />
      <EditVirkemiddelModal isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} virkemiddel={selectedVirkemiddel} isEdit={true} refetchData={refetchData}/>
    </>
  )
}
