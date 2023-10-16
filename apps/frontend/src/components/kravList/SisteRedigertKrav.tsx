import { useEffect, useState } from 'react'
import { emptyPage, KravQL } from '../../constants'
import { useKravFilter } from '../../api/KravGraphQLApi'
import { Spinner } from '../common/Spinner'
import { Notification } from 'baseui/notification'
import { Block, Responsive } from 'baseui/block'
import { HeadingXLarge, ParagraphMedium } from 'baseui/typography'
import { KravPanels, sortKrav } from '../../pages/KravListPage'

const responsiveDisplay: Responsive<any> = ['block', 'block', 'block', 'flex', 'flex', 'flex']

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
    <Spinner size={'large'} />
  ) : error ? (
    <Notification kind={'negative'}>{JSON.stringify(error, null, 2)}</Notification>
  ) : (
    <Block>
      <Block display={responsiveDisplay} justifyContent="center" alignContent="center" width="100%" marginTop="20px" marginBottom="20px">
        <Block display="flex" justifyContent="flex-start" width="100%">
          <HeadingXLarge marginTop="0px" marginBottom="0px">
            {sortedKravList.length ? sortedKravList.length : 0} Krav
          </HeadingXLarge>
        </Block>
        {/* <Block display="flex" justifyContent="flex-end" width="100%" alignItems="center">
          <Block >
            <LabelSmall>Sorter:</LabelSmall>
          </Block>
          <Block marginLeft="17px">
            <RadioGroup
              align={ALIGN.horizontal}
              value={sorting}
              onChange={e => setSorting(e.currentTarget.value)}
              name="sorting"
            >
              <Radio value='sist'>
                Sist endret
              </Radio>
              <Radio value='alfabetisk'>
                Alfabetisk
              </Radio>
            </RadioGroup>
          </Block>
        </Block> */}
      </Block>
      <KravPanels kravene={sortedKravList} loading={loading} />
      {sortedKravList.length === 0 && (
        <Block width="100%" display="flex" justifyContent="center">
          <ParagraphMedium>Fant ingen krav</ParagraphMedium>
        </Block>
      )}
    </Block>
  )
}
