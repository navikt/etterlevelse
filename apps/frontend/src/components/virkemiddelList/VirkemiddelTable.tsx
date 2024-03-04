import { DocPencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Pagination, Select, SortState, Spacer, Table } from '@navikt/ds-react'
import moment from 'moment'
import { useState } from 'react'
import { IVirkemiddel } from '../../constants'
import { handleSort } from '../../util/handleTableSort'
import { LovView } from '../Lov'
import { SkeletonPanel } from '../common/LoadingSkeleton'
import DeleteVirkemiddeltModal from '../virkemiddel/edit/DeleteVirkemiddelModal'
import { EditVirkemiddelModal } from '../virkemiddel/edit/EditVirkemiddelModal'

type TVirkmiddelTableProps = {
  virkemidler: IVirkemiddel[]
  loading: boolean
  refetchData: () => void
}

const comparator = (a: IVirkemiddel, b: IVirkemiddel, orderBy: string) => {
  switch (orderBy) {
    case 'navn':
      return a.navn.localeCompare(b.navn)
    case 'virkemiddelType':
      return (a.virkemiddelType?.shortName || '').localeCompare(b.virkemiddelType?.shortName || '')
    case 'sistEndret':
      return (a.changeStamp.lastModifiedDate || '').localeCompare(
        b.changeStamp.lastModifiedDate || ''
      )
    default:
      return 0
  }
}

export const VirkemiddelTable = ({ virkemidler, loading, refetchData }: TVirkmiddelTableProps) => {
  const [selectedVirkemiddel, setSelectedVirkemiddel] = useState<IVirkemiddel>()
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  const [limit, setLimit] = useState(20)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState>()

  let sortedData = virkemidler

  sortedData = sortedData.sort((a, b) => {
    if (sort) {
      return sort.direction === 'ascending'
        ? comparator(b, a, sort.orderBy)
        : comparator(a, b, sort.orderBy)
    }
    return 1
  })

  return (
    <div>
      {loading && <SkeletonPanel count={5} />}
      {!loading && (
        <div>
          <Table
            size="large"
            zebraStripes
            sort={sort}
            onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader className="w-[13%]" sortKey="navn" sortable>
                  Navn
                </Table.ColumnHeader>
                <Table.ColumnHeader sortKey="virkemiddelType" sortable>
                  Virkemiddeltype
                </Table.ColumnHeader>
                <Table.ColumnHeader sortKey="regelverk">Regelverk</Table.ColumnHeader>
                <Table.ColumnHeader sortKey="sisteEndret" sortable>
                  Siste endret
                </Table.ColumnHeader>
                <Table.ColumnHeader></Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedData.map((virkemiddel: IVirkemiddel, index: number) => (
                <Table.Row key={index + '_' + virkemiddel.id}>
                  <Table.DataCell className="w-[17%]" scope="row">
                    {virkemiddel.navn}
                  </Table.DataCell>
                  <Table.DataCell>{virkemiddel.virkemiddelType?.shortName}</Table.DataCell>
                  <Table.DataCell>
                    <div>
                      {virkemiddel.regelverk.map((regelverk, index) => {
                        return (
                          <div
                            key={regelverk + '_' + index}
                            className={`${index === virkemiddel.regelverk.length - 1 ? undefined : 'mb-2'}`}
                          >
                            <LovView regelverk={regelverk} />
                          </div>
                        )
                      })}
                    </div>
                  </Table.DataCell>

                  <Table.DataCell>
                    {moment(virkemiddel.changeStamp.lastModifiedDate).format('ll')}
                  </Table.DataCell>
                  <Table.DataCell>
                    <div className="flex justify-end w-full">
                      <Button
                        size="small"
                        variant="tertiary"
                        onClick={() => {
                          setSelectedVirkemiddel(virkemiddel)
                          setIsEditModalOpen(true)
                        }}
                        icon={<DocPencilIcon title="Rediger" aria-label="Rediger" />}
                      />
                      <Button
                        size="small"
                        variant={'tertiary'}
                        onClick={() => {
                          setSelectedVirkemiddel(virkemiddel)
                          setIsDeleteModalOpen(true)
                        }}
                        icon={<TrashIcon title="Slett" aria-label="slett" />}
                      />
                    </div>
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <div className="flex w-full justify-center items-center mt-3">
            <Select
              label="Antall rader:"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              size="small"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
            <Spacer />
            <div>
              <Pagination
                page={page}
                onPageChange={setPage}
                count={Math.ceil(virkemidler.length / limit)}
                prevNextTexts
                size="small"
              />
            </div>
            <Spacer />
            <BodyShort>Totalt antall rader: {virkemidler.length}</BodyShort>
          </div>

          {isEditModalOpen && selectedVirkemiddel && (
            <EditVirkemiddelModal
              isOpen={isEditModalOpen}
              setIsOpen={setIsEditModalOpen}
              virkemiddel={selectedVirkemiddel}
              isEdit={true}
              refetchData={refetchData}
            />
          )}
          <DeleteVirkemiddeltModal
            isOpen={isDeleteModalOpen}
            setIsOpen={setIsDeleteModalOpen}
            virkemiddel={selectedVirkemiddel}
            refetchData={refetchData}
          />
        </div>
      )}
    </div>
  )
}
