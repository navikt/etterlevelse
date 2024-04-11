import { ArrowRightLeftIcon, XMarkIcon } from '@navikt/aksel-icons'
import { Box, Button, Label, Loader, Modal, Tooltip } from '@navikt/ds-react'
import { Differ, Viewer } from 'json-diff-kit'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { JsonView } from 'react-json-view-lite'
import { useRefs } from '../../../util/hooks/customHooks'
import { intl } from '../../../util/intl/intl'
import { ObjectLink } from '../../common/RouteLink'
import { AuditActionIcon, AuditLabel } from './AuditComponents'
import { EAuditAction, IAuditItem, IAuditLog } from './AuditTypes'

type TAuditViewProps = {
  auditLog?: IAuditLog
  auditId?: string
  loading: boolean
  viewId: (id: string) => void
}

type TComparisonViewProps = {
  auditLog: IAuditLog
  audit: IAuditItem
  index: number
}

const ComparisonView = (props: TComparisonViewProps) => {
  const { auditLog, audit, index } = props
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <Button
        key={audit.id}
        onClick={() => setModalOpen(!modalOpen)}
        variant="tertiary"
        icon={<ArrowRightLeftIcon title="se forskjell" />}
      />
      <Modal
        key={audit.id}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        width="75%"
        className="h-3/4 overflow-y-scroll"
        header={{ heading: 'Sammenligning' }}
      >
        <Modal.Body>
          <Viewer
            diff={new Differ().diff(
              auditLog && auditLog.audits[index + 1] ? auditLog.audits[index + 1].data : {},
              audit.data
            )}
            highlightInlineDiff={true}
            lineNumbers={true}
            indent={4}
          />
        </Modal.Body>
      </Modal>
    </div>
  )
}

export const AuditView = (props: TAuditViewProps) => {
  const { auditLog, auditId, loading, viewId } = props
  const refs = useRefs<HTMLDivElement>(auditLog?.audits.map((auditLog) => auditLog.id) || [])
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
            <div className="w-11/12 mb-4">
              <AuditLabel label={intl.id}>{auditLog?.id}</AuditLabel>
              <AuditLabel label={intl.table}>{newestAudit?.table}</AuditLabel>
              <AuditLabel label={intl.audits}>{auditLog?.audits.length}</AuditLabel>
            </div>
            <div className="flex">
              <Button variant="tertiary" className="mr-2" onClick={() => setOpenAll(!openAll)}>
                {openAll ? 'Lukke' : 'Åpne'} alle
              </Button>
              {newestAudit?.action !== EAuditAction.DELETE && (
                <ObjectLink
                  id={newestAudit!.tableId}
                  type={newestAudit!.table}
                  noNewTabLabel
                  audit={newestAudit}
                >
                  <Button variant="tertiary">Vis bruk (åpnes i ny fane)</Button>
                </ObjectLink>
              )}
              <Tooltip content="Lukk" placement="top">
                <Button
                  variant="tertiary"
                  onClick={() => viewId('')}
                  icon={<XMarkIcon title="Lukk" />}
                />
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
