import { Alert, Label, Loader } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useKravFilter } from '../../api/KravGraphQLApi'
import { KravQL, emptyPage } from '../../constants'
import { KravPanels, sortKrav } from '../../pages/KravListPage'

export const SistRedigertKrav = () => {
  const [sorting] = useState('sist')
  const [sortedKravList, setSortedKravList] = useState<KravQL[]>([])
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
      sortedData.sort((a, b) => (a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0))
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [data])

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) => (a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0))
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [sorting])

  return loading && !data?.krav?.numberOfElements ? (
    <Loader size={'large'} />
  ) : error ? (
    <Alert variant={'error'}>{JSON.stringify(error, null, 2)}</Alert>
  ) : (
    <div>
      <div className={'justify-center content-center w-full my-5'}>
        <div className={'flex justify-start w-full'}>
          <Label className="my-0">{sortedKravList.length ? sortedKravList.length : 0} Krav</Label>
        </div>
      </div>
      <KravPanels kravene={sortedKravList} loading={loading} />
      {sortedKravList.length === 0 && <div className={'w-full flex justify-center'}>Fant ingen krav</div>}
    </div>
  )
}
