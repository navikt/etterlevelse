'use client'

import { getAuditLog } from '@/api/audit/auditApi'
import { ObjectLink } from '@/components/common/routeLink/routeLink'
import { PageLayout } from '@/components/others/scaffold/page'
import { EAuditAction, IAuditItem, IAuditLog } from '@/constants/admin/audit/auditConstants'
import { useRefs } from '@/util/hooks/customHooks/customHooks'
import { XMarkIcon } from '@navikt/aksel-icons'
import { Box, Button, Heading, Label, Loader, Tooltip } from '@navikt/ds-react'
import moment from 'moment'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { JsonView } from 'react-json-view-lite'
import { AuditActionIcon } from './AuditActionIcon'
import { AuditLabel } from './AuditLabel'
import ComparisonView from './ComparisonView'

export const AuditViewPage = () => {
  const params = useParams()
  const auditId = params.auditId
  const [isLoading, setIsloading] = useState<boolean>(false)
  const [auditLog, setAuditLog] = useState<IAuditLog>()
  const [newestAudit, setNewestAudit] = useState<IAuditItem>()
  const [logNotFound, setLogNotFound] = useState<boolean>(false)
  const [openAll, setOpenAll] = useState(false)
  const refs = useRefs<HTMLDivElement>(auditLog?.audits.map((auditLog) => auditLog.id) || [])

  useEffect(() => {
    ;(async () => {
      if (auditId) {
        setIsloading(true)
        await getAuditLog(auditId as string)
          .then((response) => {
            setAuditLog(response)
            if (response.audits.length === 0) {
              setLogNotFound(true)
            } else {
              setNewestAudit(response.audits[0])
              setLogNotFound(false)
            }
          })
          .finally(() => setIsloading(false))
      }
    })()
  }, [])

  return (
    <PageLayout pageTitle='Versjonering' currentPage='Versjonering'>
      <Heading size='medium' level='1'>
        Versjonering
      </Heading>

      {isLoading && <Loader size={'large'} className='flex justify-self-center' />}

      {!isLoading && (
        <Box background='surface-default' padding='4'>
          {logNotFound && <Label>Audit ikke funnet</Label>}

          {!logNotFound && (
            <div>
              <div className='flex justify-between'>
                <div className='w-11/12 mb-4'>
                  <AuditLabel label='Id'>{auditLog?.id}</AuditLabel>
                  <AuditLabel label='Tabell'>{newestAudit?.table}</AuditLabel>
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
                  <Tooltip content='Lukk' placement='top'>
                    <Button
                      variant='tertiary'
                      onClick={() => console.debug('test')}
                      icon={<XMarkIcon title='Lukk' />}
                    />
                  </Tooltip>
                </div>
              </div>

              {auditLog &&
                auditLog.audits.map((audit, index) => {
                  const time = moment(audit.time)
                  return (
                    <div key={audit.id} ref={refs[audit.id]} className='mb-4 mt-2'>
                      <div className='flex justify-between'>
                        <div className='w-11/12'>
                          <AuditLabel label='Versjon #'>
                            {auditLog.audits.length - index}
                          </AuditLabel>
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
          )}
        </Box>
      )}
    </PageLayout>
  )
}

export default AuditViewPage
