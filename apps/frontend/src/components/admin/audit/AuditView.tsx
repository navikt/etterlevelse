import moment from 'moment'
import { Block } from 'baseui/block'
import { JsonView } from 'react-json-view-lite'
import React, { useEffect, useState } from 'react'
import { LabelLarge } from 'baseui/typography'
import { AuditActionIcon, AuditLabel as Label } from './AuditComponents'
import { Card } from 'baseui/card'
import { PLACEMENT, StatefulTooltip } from 'baseui/tooltip'
import { StatefulPopover } from 'baseui/popover'
import { Differ, Viewer } from 'json-diff-kit'
import { useRefs } from '../../../util/hooks'
import { theme } from '../../../util'
import { intl } from '../../../util/intl/intl'
import { AuditAction, AuditLog } from './AuditTypes'
import { ObjectLink } from '../../common/RouteLink'
import Button from '../../common/Button'
import { ettlevColors } from '../../../util/theme'
import { ArrowRightLeftIcon, GlassesIcon, XMarkIcon } from '@navikt/aksel-icons'
import { Loader } from '@navikt/ds-react'

type AuditViewProps = {
  auditLog?: AuditLog
  auditId?: string
  loading: boolean
  viewId: (id: string) => void
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
    <Card>
      {loading && <Loader size="large" />}
      {!loading && auditLog && !logFound && <LabelLarge>{intl.auditNotFound}</LabelLarge>}

      {logFound && (
        <>
          <Block display="flex" justifyContent="space-between">
            <Block width="90%">
              <Label label={intl.id}>{auditLog?.id}</Label>
              <Label label={intl.table}>{newestAudit?.table}</Label>
              <Label label={intl.audits}>{auditLog?.audits.length}</Label>
            </Block>
            <Block display="flex">
              <Button variant="tertiary" marginRight onClick={() => setOpenAll(!openAll)}>
                {openAll ? 'Lukke' : 'Åpne'} alle
              </Button>
              {newestAudit?.action !== AuditAction.DELETE && (
                <StatefulTooltip content={() => intl.view} placement={PLACEMENT.top}>
                  <Block>
                    <ObjectLink id={newestAudit!.tableId} type={newestAudit!.table} audit={newestAudit}>
                      <Button variant="tertiary" icon={<GlassesIcon title="Se forskjell" />} />
                    </ObjectLink>
                  </Block>
                </StatefulTooltip>
              )}
              <StatefulTooltip content={() => intl.close} placement={PLACEMENT.top}>
                <Block>
                  <Button variant="tertiary" onClick={() => viewId('')} icon={<XMarkIcon title="Lukk" />} />
                </Block>
              </StatefulTooltip>
            </Block>
          </Block>

          {auditLog &&
            auditLog.audits.map((audit, index) => {
              const time = moment(audit.time)
              return (
                <Block key={audit.id} ref={refs[audit.id]} marginBottom="1rem" marginTop=".5rem" backgroundColor={audit.id === props.auditId ? theme.colors.mono200 : undefined}>
                  <Block display="flex" justifyContent="space-between">
                    <Block width="90%">
                      <Label label={intl.auditNr}>{auditLog.audits.length - index}</Label>
                      <Label label={intl.action}>
                        <AuditActionIcon action={audit.action} withText={true} />
                      </Label>
                      <Label label={intl.time}>
                        {time.format('LL')} {time.format('HH:mm:ss.SSS Z')}
                      </Label>
                      <Label label={intl.user}>{audit.user}</Label>
                    </Block>
                    <Block>
                      <StatefulPopover
                        placement={PLACEMENT.left}
                        content={() => (
                          <Card>
                            <Viewer
                              diff={new Differ().diff(auditLog && auditLog.audits[index + 1] ? auditLog.audits[index + 1].data : {}, audit.data)}
                              highlightInlineDiff={true}
                              lineNumbers={true}
                              indent={4}
                            />
                          </Card>
                        )}
                        overrides={{
                          Body: {
                            style: () => ({
                              width: '80%',
                              maxHeight: '80%',
                              overflowY: 'scroll',
                            }),
                          },
                        }}
                      >
                        <div>
                          <Button variant="tertiary" icon={<ArrowRightLeftIcon title="Sammenling" />} />
                        </div>
                      </StatefulPopover>
                    </Block>
                  </Block>
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
                </Block>
              )
            })}
        </>
      )}
    </Card>
  )
}
