import { BodyLong, Heading } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { getPvkDokumentVersions } from '../../../api/PvkDokumentApi'
import { IPageResponse, IPvkDokumentVersionItem } from '../../../constants'

type TProps = {
  pvkDokumentId: string
}

const PvkVersionsPanel: FunctionComponent<TProps> = ({ pvkDokumentId }) => {
  const [versions, setVersions] = useState<IPvkDokumentVersionItem[]>([])

  useEffect(() => {
    ;(async () => {
      if (pvkDokumentId) {
        try {
          const page: IPageResponse<IPvkDokumentVersionItem> =
            await getPvkDokumentVersions(pvkDokumentId)
          setVersions(page.content || [])
        } catch (e) {
          // silent fail
        }
      }
    })()
  }, [pvkDokumentId])

  if (!versions.length) return null

  return (
    <div className='mb-6'>
      <Heading level='2' size='small' className='mb-2'>
        Versjonshistorikk
      </Heading>
      {versions.map((v) => (
        <BodyLong key={v.id} className='text-sm'>
          {new Date(v.changeStamp.createdDate || v.changeStamp.lastModifiedDate).toLocaleString()} —{' '}
          {v.status}
        </BodyLong>
      ))}
    </div>
  )
}

export default PvkVersionsPanel
