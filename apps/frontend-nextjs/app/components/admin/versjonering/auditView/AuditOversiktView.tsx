import { EAuditAction, IAuditItem, IAuditLog } from '@/constants/admin/audit/auditConstants'
import { Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { ObjectLink } from '../../common/commonComponents'
import { AuditLabel } from '../common/AuditLabel'

type TProps = {
  auditLog: IAuditLog
  newestAudit: IAuditItem
  openAll: boolean
  setOpenAll: (state: boolean) => void
}

export const AuditOversiktView: FunctionComponent<TProps> = ({
  auditLog,
  newestAudit,
  openAll,
  setOpenAll,
}) => {
  return (
    <div className='flex justify-between'>
      <div className='w-11/12 mb-4'>
        <AuditLabel label='Id'>{auditLog.id}</AuditLabel>
        <AuditLabel label='Tabell'>{newestAudit.table}</AuditLabel>
        <AuditLabel label='Versjoneringer'>{auditLog?.audits.length}</AuditLabel>
      </div>
      <div className='flex'>
        <Button variant='tertiary' className='mr-2' onClick={() => setOpenAll(!openAll)}>
          {openAll ? 'Lukke' : 'Åpne'} alle
        </Button>
        {newestAudit && newestAudit.action !== EAuditAction.DELETE && (
          <ObjectLink
            id={newestAudit.tableId}
            type={newestAudit.table}
            noNewTabLabel
            audit={newestAudit}
          >
            <Button variant='tertiary'>Vis bruk (åpner i en ny fane)</Button>
          </ObjectLink>
        )}
      </div>
    </div>
  )
}
export default AuditOversiktView
