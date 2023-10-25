import moment from 'moment'
import { JsonView } from 'react-json-view-lite'
import { useEffect, useRef, useState } from 'react'
import { AuditActionIcon, AuditLabel } from './AuditComponents'
import { Differ, Viewer } from 'json-diff-kit'
import { useRefs } from '../../../util/hooks'
import { intl } from '../../../util/intl/intl'
import { AuditAction, AuditItem, AuditLog } from './AuditTypes'
import { ObjectLink } from '../../common/RouteLink'
import { Box, Button, Label, Loader, Popover, Tooltip } from '@navikt/ds-react'
import { ArrowRightLeftIcon, XMarkIcon } from '@navikt/aksel-icons'

type AuditViewProps = {
  auditLog?: AuditLog
  auditId?: string
  loading: boolean
  viewId: (id: string) => void
}

type ComparisonViewProps = {
  auditLog: AuditLog
  audit: AuditItem
  index: number
}

const ComparisonView = (props: ComparisonViewProps) => {
  const { auditLog, audit, index } = props
  const [popoverOpen, setPopoverOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <div>
      <Button key={audit.id} ref={buttonRef} onClick={() => setPopoverOpen(!popoverOpen)} variant="tertiary" icon={<ArrowRightLeftIcon title="se forskjell" />} />
      <Popover
        key={audit.id}
        placement="left"
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        anchorEl={buttonRef.current}
        arrow={false}
        className="w-3/4 h-3/4 overflow-y-scroll"
        strategy="fixed"
      >
        <Popover.Content>
          <Viewer
            diff={new Differ().diff(auditLog && auditLog.audits[index + 1] ? auditLog.audits[index + 1].data : {}, audit.data)}
            highlightInlineDiff={true}
            lineNumbers={true}
            indent={4}
          />
        </Popover.Content>
      </Popover>
    </div>
  )
}

export const AuditView = (props: AuditViewProps) => {
  const { auditLog, auditId, loading, viewId } = props
  const refs = useRefs<HTMLDivElement>(auditLog?.audits.map((al) => al.id) || [])
  const [openAll, setOpenAll] = useState(false)

  useEffect(() => {
    if (auditId && auditLog && refs[auditId] && auditId !== auditLog.audits[0].id) {
      refs[auditId].current!.scrollIntoView({ block: 'start' })
    }
  }, [auditId, auditLog])

  const logFound = auditLog && !!auditLog.audits.length
  const newestAudit = auditLog?.audits[0]

  return (
    <Box background="surface-default" padding="4">
      {loading && <Loader size="large" />}
      {!loading && auditLog && !logFound && <Label>{intl.auditNotFound}</Label>}

      {logFound && (
        <div>
          <div className="flex justify-between">
            <div className="w-11/12 mb-4" >
              <AuditLabel label={intl.id}>{auditLog?.id}</AuditLabel>
              <AuditLabel label={intl.table}>{newestAudit?.table}</AuditLabel>
              <AuditLabel label={intl.audits}>{auditLog?.audits.length}</AuditLabel>
            </div>
            <div className="flex">
              <Button variant="tertiary" className="mr-2" onClick={() => setOpenAll(!openAll)}>
                {openAll ? 'Lukke' : 'Åpne'} alle
              </Button>
              {newestAudit?.action !== AuditAction.DELETE && (
                <ObjectLink id={newestAudit!.tableId} type={newestAudit!.table} noNewTabLabel audit={newestAudit}>
                  <Button variant="tertiary">
                    Vis bruk (åpnes i ny fane)
                  </Button>
                </ObjectLink>
              )}
              <Tooltip content="Lukk" placement="top">
                <Button variant="tertiary" onClick={() => viewId('')} icon={<XMarkIcon title="Lukk" />} />
              </Tooltip>
            </div>
          </div>

          {auditLog &&
            auditLog.audits.map((audit, index) => {
              const time = moment(audit.time)
              return (
                <div key={audit.id} ref={refs[audit.id]} className="mb-4 mt-2">
                  <div className="flex justify-between">
                    <div className="w-11/12">
                      <AuditLabel label={intl.auditNr}>{auditLog.audits.length - index}</AuditLabel>
                      <AuditLabel label={intl.action}>
                        <AuditActionIcon action={audit.action} withText={true} />
                      </AuditLabel>
                      <AuditLabel label={intl.time}>
                        {time.format('LL')} {time.format('HH:mm:ss.SSS Z')}
                      </AuditLabel>
                      <AuditLabel label={intl.user}>{audit.user}</AuditLabel>
                    </div>
                    <ComparisonView auditLog={auditLog} audit={audit} index={index} />
                  </div>
                  <JsonView
                    data={audit.data}
                    shouldExpandNode={() => {
                      if (openAll) {
                        return true
                      } else {
                        return index === 0 ? true : false
                      }
                    }}
                  />
                </div>
              )
            })}
        </div>
      )}
    </Box>
  )
}
