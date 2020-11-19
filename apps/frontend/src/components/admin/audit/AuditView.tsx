import moment from "moment"
import { Block } from "baseui/block"
import ReactJson from "react-json-view"
import React, { useEffect, useState } from "react"
import { Label1 } from "baseui/typography"
import { AuditActionIcon, AuditLabel as Label } from "./AuditComponents"
import { Card } from "baseui/card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBinoculars, faExchangeAlt, faTimes } from "@fortawesome/free-solid-svg-icons"
import { PLACEMENT, StatefulTooltip } from "baseui/tooltip"
import { StatefulPopover } from "baseui/popover"
import DiffViewer from "react-diff-viewer"
import { StyledSpinnerNext } from "baseui/spinner"
import { useRefs } from '../../../util/hooks'
import { theme } from '../../../util'
import { intl } from '../../../util/intl/intl'
import { AuditAction, AuditLog } from './AuditTypes'
import { ObjectLink } from '../../common/RouteLink'
import Button from '../../common/Button'

type AuditViewProps = {
  auditLog?: AuditLog,
  auditId?: string,
  loading: boolean,
  viewId: (id: string) => void
}


function initialOpen(auditLog?: AuditLog, auditId?: string) {
  return auditLog?.audits.map((o, i) => i === 0 || o.id === auditId) || [];
}

export const AuditView = (props: AuditViewProps) => {
  const {auditLog, auditId, loading, viewId} = props
  const refs = useRefs(auditLog?.audits.map(al => al.id) || [])
  const [open, setOpen] = useState(initialOpen(auditLog, auditId))

  useEffect(() => {
    if (auditId && auditLog && refs[auditId] && auditId !== auditLog.audits[0].id) {
      refs[auditId].current!.scrollIntoView({block: "start"})
    }
    setOpen(initialOpen(auditLog, auditId))
  }, [auditId, auditLog])

  const logFound = auditLog && !!auditLog.audits.length
  const newestAudit = auditLog?.audits[0]

  return <Card>
    {loading && <StyledSpinnerNext size={theme.sizing.scale2400}/>}
    {!loading && auditLog && !logFound && <Label1>{intl.auditNotFound}</Label1>}

    {logFound && <>
      <Block display="flex" justifyContent="space-between">
        <Block width="90%">
          <Label label={intl.id}>{auditLog?.id}</Label>
          <Label
            label={intl.table}>{newestAudit?.table}</Label>
          <Label label={intl.audits}>{auditLog?.audits.length}</Label>
        </Block>
        <Block display="flex">
          <Button size='compact' kind='tertiary' marginRight onClick={() => setOpen(auditLog!.audits.map(() => true))}>Åpne alle</Button>
          {newestAudit?.action !== AuditAction.DELETE &&
          <StatefulTooltip content={() => intl.view} placement={PLACEMENT.top}>
            <Block>
              <ObjectLink id={newestAudit!.tableId} type={newestAudit!.table} audit={newestAudit}>
                <Button size="compact" shape="round" kind="tertiary"><FontAwesomeIcon icon={faBinoculars}/></Button>
              </ObjectLink>
            </Block>
          </StatefulTooltip>
          }
          <StatefulTooltip content={() => intl.close} placement={PLACEMENT.top}>
            <Block>
              <Button size="compact" shape="round" kind="tertiary" onClick={() => viewId('')}><FontAwesomeIcon icon={faTimes}/></Button>
            </Block>
          </StatefulTooltip>
        </Block>
      </Block>

      {auditLog && auditLog.audits.map((audit, index) => {
        const time = moment(audit.time)
        return (
          <Block key={audit.id} ref={refs[audit.id]} marginBottom='1rem' marginTop=".5rem"
                 backgroundColor={audit.id === props.auditId ? theme.colors.mono200 : undefined}>
            <Block display="flex" justifyContent="space-between">
              <Block width="90%">
                <Label label={intl.auditNr}>{auditLog.audits.length - index}</Label>
                <Label label={intl.action}><AuditActionIcon action={audit.action} withText={true}/></Label>
                <Label label={intl.time}>{time.format('LL')} {time.format('HH:mm:ss.SSS Z')}</Label>
                <Label label={intl.user}>{audit.user}</Label>
              </Block>
              <Block>
                <StatefulPopover placement={PLACEMENT.left} content={() => (
                  <Card>
                    <DiffViewer
                      leftTitle='Previous' rightTitle='Current'
                      oldValue={JSON.stringify(auditLog?.audits[index + 1]?.data, null, 2)}
                      newValue={JSON.stringify(audit.data, null, 2)}
                    />
                  </Card>
                )} overrides={{
                  Body: {
                    style: () => ({
                      width: "80%",
                      maxHeight: "80%",
                      overflowY: "scroll"
                    })
                  }
                }}>
                  <div><Button size="compact" shape="round" kind="tertiary"><FontAwesomeIcon icon={faExchangeAlt}/></Button></div>
                </StatefulPopover>
              </Block>
            </Block>
            <ReactJson src={audit.data}
                       name={null}
                       shouldCollapse={p => p.name === null && !open[index]}
                       onSelect={sel => {
                         (sel.name === 'id' || sel.name?.endsWith("Id")) && viewId(sel.value as string)
                       }}/>
          </Block>
        )
      })}
    </>
    }
  </Card>
}
