import { IAuditLog } from '@/constants/admin/audit/auditConstants'
import { TRefs } from '@/util/hooks/customHooks/customHooks'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { JsonView } from 'react-json-view-lite'
import { AuditActionIcon } from '../common/AuditActionIcon'
import { AuditLabel } from '../common/AuditLabel'
import ComparisonView from './ComparisonView'

type TProps = {
  auditLog: IAuditLog
  openAll: boolean
  refs: TRefs<HTMLDivElement>
}

export const AuditItemList: FunctionComponent<TProps> = ({ auditLog, openAll, refs }) => {
  return (
    <div>
      {auditLog &&
        auditLog.audits.map((audit, index) => {
          const time = moment(audit.time)
          return (
            <div key={audit.id} ref={refs[audit.id]} className='mb-4 mt-2'>
              <div className='flex justify-between'>
                <div className='w-11/12'>
                  <AuditLabel label='Versjon #'>{auditLog.audits.length - index}</AuditLabel>
                  <AuditLabel label='Action'>
                    <AuditActionIcon action={audit.action} withText={true} />
                  </AuditLabel>
                  <AuditLabel label='Tid'>
                    {time.format('LL')} {time.format('HH:mm:ss.SSS Z')}
                  </AuditLabel>
                  <AuditLabel label='Bruker'>{audit.user}</AuditLabel>
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
  )
}
export default AuditItemList
