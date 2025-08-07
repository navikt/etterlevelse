'use client'

import { getKravPriorityListByTemaCode } from '@/api/kravPriorityList/kravPriorityListApi'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { SkeletonPanel } from '@/components/common/loadingSkeleton/loadingSkeletonComponent'
import { Markdown } from '@/components/common/markdown/markdown'
import { lovdataBase } from '@/components/lov/lov'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EListName, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { IKrav, TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { useKravCounter } from '@/query/krav/kravQuery'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { ampli, userRoleEventProp } from '@/services/amplitude/amplitudeService'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { temaBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { sortKravListeByPriority } from '@/util/krav/kravUtil'
import { kravNummerView } from '@/util/kravNummerView/kravNummerView'
import { BodyShort, Detail, Heading, Label, LinkPanel, List } from '@navikt/ds-react'
import _ from 'lodash'
import { useParams } from 'next/navigation'
import { FunctionComponent, useEffect, useState } from 'react'

export const TemaPage = () => {
  const params = useParams()
  const temaCode = params.temaCode as string
  const [code, setCode] = useState<TTemaCode>()

  useEffect(() => {
    setCode(codelist.getCode(EListName.TEMA, temaCode) as TTemaCode)
  }, [])

  if (!code) return <>`&apos;`invalid code`&apos;`</>
  return <TemaView tema={code} />
}

const getTemaMainHeader = (tema: TTemaCode, lover: TLovCode[], noHeader?: boolean) => (
  <div className='lg:grid lg:grid-flow-col lg:gap-2'>
    <div>
      {!noHeader && (
        <Heading level='1' size='medium' spacing>
          {tema.shortName}
        </Heading>
      )}
      <Markdown source={tema.description} />
    </div>

    <div className='my-8 lg:border-l-2 lg:pl-2 lg:border-gray-200'>
      <Heading level='2' size='small' spacing>
        Ansvarlig for lovtolkning
      </Heading>
      {_.uniq(lover.map((lov: TLovCode) => lov.data?.underavdeling)).map(
        (code: string | undefined, index: number) => (
          <BodyShort key={code + '_' + index} size='large' spacing>
            {codelist.getCode(EListName.UNDERAVDELING, code)?.shortName}
          </BodyShort>
        )
      )}
      <Heading level='2' size='small' spacing>
        Lovdata
      </Heading>
      {lover.map((lov: TLovCode, index: number) => (
        <div key={lov.code + '_' + index} className='mb-1.5'>
          <ExternalLink href={lovdataBase(lov.code)}>{lov.shortName}</ExternalLink>
        </div>
      ))}
    </div>
  </div>
)

type TTemaViewProps = {
  tema: TTemaCode
}

const TemaView: FunctionComponent<TTemaViewProps> = (props) => {
  const { tema } = props
  const lover: TLovCode[] = codelist.getLovCodesForTema(tema.code)
  const { data, loading } = useKravCounter(
    { lover: lover.map((lov) => lov.code) },
    { skip: !lover.length }
  )

  const [kravList, setKravList] = useState<IKrav[]>([])

  useEffect(() => {
    ampli().logEvent('sidevisning', {
      side: 'Tema side',
      sidetittel: tema.shortName,
      ...userRoleEventProp,
    })
  }, [])

  useEffect(() => {
    if (data && data.krav && data.krav.content && data.krav.content.length > 0) {
      ;(async () => {
        const kravPriorityList: IKravPriorityList = await getKravPriorityListByTemaCode(tema.code)
        const kravListe: TKravQL[] = _.cloneDeep(data.krav.content)
        kravListe.map((krav: TKravQL) => {
          const priority: number = kravPriorityList.priorityList.indexOf(krav.kravNummer) + 1
          krav.prioriteringsId = priority
          return krav
        })
        setKravList(sortKravListeByPriority(kravListe))
      })()
    }
  }, [data])

  return (
    <PageLayout
      pageTitle={tema.shortName}
      breadcrumbPaths={[temaBreadCrumbPath]}
      currentPage={tema.shortName}
    >
      {getTemaMainHeader(tema, lover)}
      <div className='mt-6'>
        <Label>{loading ? '?' : data?.krav.numberOfElements || 0} krav</Label>
        {loading && <SkeletonPanel count={10} />}
        {!loading && kravList && (
          <List className='grid gap-2 '>
            {kravList.map((krav, index) => (
              <List.Item
                icon={<div />}
                key={krav.kravNummer + '.' + krav.kravVersjon + '_' + index}
              >
                <LinkPanel href={kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon)}>
                  <Detail weight='semibold'>{kravNummerView(krav)}</Detail>
                  <BodyShort>{krav.navn}</BodyShort>
                </LinkPanel>
              </List.Item>
            ))}
          </List>
        )}
      </div>
    </PageLayout>
  )
}

export default TemaPage
