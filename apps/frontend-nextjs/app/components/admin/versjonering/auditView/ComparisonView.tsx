import { IAuditItem, IAuditLog } from '@/constants/admin/audit/auditConstants'
import { ArrowRightLeftIcon } from '@navikt/aksel-icons'
import { Button, Modal } from '@navikt/ds-react'
import { Differ, Viewer } from 'json-diff-kit'
import { useState } from 'react'

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
        variant='tertiary'
        icon={<ArrowRightLeftIcon title='se forskjell' />}
      />
      {modalOpen && (
        <Modal
          key={audit.id}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          width='75%'
          className='h-3/4 overflow-y-scroll'
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
      )}
    </div>
  )
}

export default ComparisonView
