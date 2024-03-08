import { Alert, Label, Loader } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { emptyPage } from '../../api/util/EmptyPageConstant'
import { TKravQL } from '../../constants'
import { KravPanels, sortKrav } from '../../pages/KravListPage'
import { useKravFilter } from '../../query/KravQuery'

export const SistRedigertKrav = () => {
  const [sorting] = useState('sist')
  const [sortedKravList, setSortedKravList] = useState<TKravQL[]>([])
  const res = useKravFilter({
    sistRedigert: 10,
    gjeldendeKrav: false,
    pageNumber: 0,
    pageSize: 10,
  })

  const { data, loading, error } = res

  const kravene = data?.krav || emptyPage

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [data])

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [sorting])

  return (
    <div>
      {loading && data && data.krav?.numberOfElements === 0 && <Loader size={'large'} />}

      {error && <Alert variant={'error'}>{JSON.stringify(error, null, 2)}</Alert>}

      {!loading && !error && data && data.krav.numberOfElements > 0 && (
        <div>
          <div className={'justify-center content-center w-full my-5'}>
            <div className={'flex justify-start w-full'}>
              <Label className="my-0">
                {sortedKravList.length ? sortedKravList.length : 0} Krav
              </Label>
            </div>
          </div>
          <KravPanels kravene={sortedKravList} loading={loading} />
          {sortedKravList.length === 0 && (
            <div className={'w-full flex justify-center'}>Fant ingen krav</div>
          )}
        </div>
      )}
    </div>
  )
}
