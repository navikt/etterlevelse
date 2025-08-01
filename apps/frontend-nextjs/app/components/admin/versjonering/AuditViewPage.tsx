'use client'

import { getAuditLog } from '@/api/audit/auditApi'
import { ObjectLink } from '@/components/common/routeLink/routeLink'
import { PageLayout } from '@/components/others/scaffold/page'
import { EAuditAction, IAuditItem, IAuditLog } from '@/constants/admin/audit/auditConstants'
import { adminAuditUrl } from '@/routes/admin/audit/auditRoutes'
import { useRefs } from '@/util/hooks/customHooks/customHooks'
import { Box, Button, Heading, Label, Loader } from '@navikt/ds-react'
import moment from 'moment'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { JsonView } from 'react-json-view-lite'
import { AuditActionIcon } from './AuditActionIcon'
import { AuditLabel } from './AuditLabel'
import ComparisonView from './ComparisonView'

export const AuditViewPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const auditId = searchParams.get('auditId')
  const id = params.id
  const [isLoading, setIsloading] = useState<boolean>(false)
  const [auditLog, setAuditLog] = useState<IAuditLog>()
  const [newestAudit, setNewestAudit] = useState<IAuditItem>()
  const [logNotFound, setLogNotFound] = useState<boolean>(false)
  const [openAll, setOpenAll] = useState(false)
  const refs = useRefs<HTMLDivElement>(auditLog?.audits.map((auditLog) => auditLog.id) || [])

  useEffect(() => {
    ;(async () => {
      if (id) {
        setIsloading(true)
        await getAuditLog(id as string)
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

  useEffect(() => {
    if (auditId && auditLog && refs[auditId] && auditId !== auditLog.audits[0].id) {
      refs[auditId].current!.scrollIntoView({ block: 'start' })
    }
  }, [auditId, auditLog])

  return (
    <PageLayout
      pageTitle='Versjon view'
      currentPage='Versjon view'
      breadcrumbPaths={[
        {
          pathName: 'Versjonering',
          href: adminAuditUrl(),
        },
      ]}
    >
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
