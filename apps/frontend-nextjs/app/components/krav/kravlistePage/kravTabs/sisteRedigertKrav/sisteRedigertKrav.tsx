'use client'

import { useKravFilter } from '@/query/krav/kravQuery'
import { emptyPage } from '@/util/common/emptyPageUtil'
import { Alert, Label, Loader } from '@navikt/ds-react'
import { useMemo } from 'react'
import { sortKrav } from '../../sortKrav/sortKrav'
import { KravPanels } from './kravPanels/KravPanels'

export const SistRedigertKrav = () => {
  const sorting = 'sist'

  const response = useKravFilter({
    sistRedigert: 10,
    gjeldendeKrav: false,
    pageNumber: 0,
    pageSize: 10,
  })

  const { data, loading, error } = response

  const kravene = data?.krav || emptyPage

  const sortedKravList = useMemo(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    return sortedData
  }, [sorting, kravene.content])

  return (
    <div>
      {loading && (
        <div className='justify-center flex flex-1 mt-10'>
          <Loader size='large' />
        </div>
      )}

      {error && <Alert variant='error'>{JSON.stringify(error, null, 2)}</Alert>}

      {!loading && !error && data && data.krav.numberOfElements > 0 && (
        <div>
          <div className='justify-center content-center w-full my-5'>
            <div className='flex justify-start w-full'>
              <Label className='my-0'>
                {sortedKravList.length ? sortedKravList.length : 0} Krav
              </Label>
            </div>
          </div>
          <KravPanels kravene={sortedKravList} loading={loading} />
          {sortedKravList.length === 0 && (
            <div className='w-full flex justify-center'>Fant ingen krav</div>
          )}
        </div>
      )}
    </div>
  )
}
