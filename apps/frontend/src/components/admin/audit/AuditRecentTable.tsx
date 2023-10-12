import {LabelLarge, LabelSmall} from 'baseui/typography'
import {useEffect, useState} from 'react'
import moment from 'moment'
import {Pagination} from 'baseui/pagination'
import {TriangleDown} from 'baseui/icon'
import {Button, KIND} from 'baseui/button'
import {PLACEMENT, StatefulPopover} from 'baseui/popover'
import {StatefulMenu} from 'baseui/menu'
import {Block} from 'baseui/block'
import {StatefulTooltip} from 'baseui/tooltip'
import {AuditButton} from './AuditButton'
import {faBinoculars, faCode} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {AuditActionIcon} from './AuditComponents'
import {emptyPage, PageResponse} from '../../../constants'
import {AuditItem, ObjectType} from './AuditTypes'
import {intl} from '../../../util/intl/intl'
import {getAudits} from '../../../api/AuditApi'
import {Cell, Row, Table} from '../../common/Table'
import * as _ from 'lodash'
import {theme} from '../../../util'
import { JsonView} from 'react-json-view-lite'
import {ObjectLink} from '../../common/RouteLink'
import {CustomizedStatefulSelect} from '../../common/CustomizedSelect'
import {buttonContentStyle} from '../../common/Button'
import {ampli} from '../../../services/Amplitude'

export const AuditRecentTable = (props: { show: boolean; tableType?: ObjectType }) => {
  const [audits, setAudits] = useState<PageResponse<AuditItem>>(emptyPage)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [table, setTable] = useState<ObjectType | undefined>(props.tableType)

  useEffect(() => {
    ;(async () => {
      props.show && setAudits(await getAudits(page - 1, limit, table))
    })()
  }, [page, limit, props.show, table])

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) {
      return
    }
    if (nextPage > audits.pages) {
      return
    }
    setPage(nextPage)
  }

  useEffect(() => {
    const nextPageNum = Math.ceil(audits.totalElements / limit)
    if (audits.totalElements && nextPageNum < page) {
      setPage(nextPageNum)
    }
  }, [limit, audits.totalElements])

  if (!props.show) {
    return null
  }

  const tableOptions = Object.keys(ObjectType).map((ot) => ({ id: ot, label: ot }))

  ampli.logEvent('sidevisning', { side: 'Varsel side for admin', sidetittel: 'Log side for varslinger' })

  return (
    <>
      <Block display="flex" justifyContent="space-between" marginBottom=".5rem">
        <LabelLarge>{intl.lastChanges}</LabelLarge>
        {!props.tableType && (
          <Block width="300px" display="flex" justifyContent="space-between">
            <LabelSmall alignSelf="center" marginRight=".5rem">
              {intl.table}:{' '}
            </LabelSmall>
            <CustomizedStatefulSelect
              size="compact"
              options={tableOptions}
              onChange={(p) => {
                if (p?.value[0]?.id === 'Codelist') {
                  setTable(p?.value[0]?.id.toUpperCase() as ObjectType)
                } else {
                  setTable(p?.value[0]?.id as ObjectType)
                }
              }}
              aria-label={'Velg type for versjonering'}
            />
          </Block>
        )}
      </Block>

      <Table
        emptyText={intl.audits}
        data={audits.content}
        headers={[{ $style: { maxWidth: '13%' }, title: intl.time }, { $style: { maxWidth: '17%' }, title: intl.action }, { title: intl.id }, { title: intl.user }]}
        render={(tableData) =>
          tableData.data.map((audit, index) => {
            const length = window.innerWidth > 1000 ? (window.innerWidth > 1200 ? 40 : 30) : 20
            const rowNum = audits.pageNumber * audits.pageSize + index + 1
            return (
              <Row key={audit.id}>
                <Cell $style={{ maxWidth: '13%' }}>
                  <Block marginRight={theme.sizing.scale400}>{rowNum}</Block>
                  <AuditButton kind="tertiary" id={audit.tableId} auditId={audit.id} ariaLabel={`Vis versjonering for ${audit.id}`}>
                    <StatefulTooltip content={audit.time} placement={PLACEMENT.top}>
                      {moment(audit.time).fromNow()}
                    </StatefulTooltip>
                  </AuditButton>
                </Cell>
                <Cell $style={{ maxWidth: '17%' }}>
                  <AuditActionIcon action={audit.action} /> {audit.table}
                </Cell>
                <Cell>
                  <StatefulTooltip content={audit.tableId} placement={PLACEMENT.top}>
                    <Block>{_.truncate(audit.tableId, { length })}</Block>
                  </StatefulTooltip>
                </Cell>
                <Cell $style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Block>{audit.user}</Block>
                  <Block>
                    <ObjectLink id={tableId(audit)} type={audit.table} audit={audit}>
                      <Button
                        size="compact"
                        shape="round"
                        kind="tertiary"
                        aria-label={'Gå til ID'}
                        overrides={{
                          BaseButton: {
                            style: {
                              ...buttonContentStyle,
                            },
                          },
                        }}
                      >
                        <FontAwesomeIcon icon={faBinoculars} />
                      </Button>
                    </ObjectLink>
                    <StatefulPopover
                      accessibilityType="tooltip"
                      overrides={{ Body: { style: { width: '80%' } } }}
                      placement={PLACEMENT.leftBottom}
                      content={<JsonView data={audit.data}/>}
                    >
                      <Button
                        size="compact"
                        shape="round"
                        kind="tertiary"
                        aria-label={'Vis kode'}
                        overrides={{
                          BaseButton: {
                            style: {
                              ...buttonContentStyle,
                            },
                          },
                        }}
                      >
                        <FontAwesomeIcon icon={faCode} />
                      </Button>
                    </StatefulPopover>
                  </Block>
                </Cell>
              </Row>
            )
          })
        }
      />

      <Block display="flex" justifyContent="space-between" marginTop="1rem">
        <StatefulPopover
          content={({ close }) => (
            <StatefulMenu
              items={[5, 10, 20, 50, 100].map((i) => ({ label: i }))}
              onItemSelect={({ item }) => {
                setLimit(item.label)
                close()
              }}
              overrides={{
                List: {
                  style: { height: '150px', width: '100px' },
                },
              }}
            />
          )}
          placement={PLACEMENT.bottom}
        >
          <Button
            kind={KIND.tertiary}
            endEnhancer={TriangleDown}
            overrides={{
              BaseButton: {
                style: {
                  ...buttonContentStyle,
                },
              },
            }}
          >
            <strong>{`${limit} ${intl.rows}`}</strong>
          </Button>
        </StatefulPopover>
        <Pagination
          currentPage={page}
          numPages={audits.pages}
          onPageChange={({ nextPage }) => handlePageChange(nextPage)}
          labels={{ nextButton: intl.nextButton, prevButton: intl.prevButton }}
        />
      </Block>
    </>
  )
}

const tableId = (audit: AuditItem) => {
  if (audit.table === ObjectType.Codelist) return audit.tableId.substr(0, audit.tableId.indexOf('-'))
  if (audit.table === ObjectType.BehandlingData) return (audit.data as any).data.behandlingId
  return audit.tableId
}
