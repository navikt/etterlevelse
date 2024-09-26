import { BodyShort, Detail, Heading, Label, LinkPanel } from '@navikt/ds-react'
import * as _ from 'lodash'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getKravPriorityListByTemaCode } from '../api/KravPriorityListApi'
import { lovdataBase } from '../components/Lov'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { Markdown } from '../components/common/Markdown'
import { ExternalLink } from '../components/common/RouteLink'
import { PageLayout } from '../components/scaffold/Page'
import { IKrav } from '../constants'
import { useKravCounter } from '../query/KravQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import {
  CodelistService,
  EListName,
  ICodelistProps,
  TLovCode,
  TTemaCode,
} from '../services/Codelist'
import { sortKravListeByPriority } from '../util/sort'
import { kravNumView } from './KravPage'
import { temaBreadCrumbPath } from './util/BreadCrumbPath'

export const TemaPage = () => {
  const { tema } = useParams<{ tema: string }>()
  const [codelistUtils] = CodelistService()

  const code: TTemaCode = codelistUtils.getCode(EListName.TEMA, tema) as TTemaCode
  if (!code) return <>`&apos;`invalid code`&apos;`</>
  return <TemaView tema={code} codelistUtils={codelistUtils} />
}

const getTemaMainHeader = (
  tema: TTemaCode,
  lover: TLovCode[],
  codelistUtils: ICodelistProps,
  noHeader?: boolean
) => {
  return (
    <div className="lg:grid lg:grid-flow-col lg:gap-2">
      <div>
        {!noHeader && (
          <Heading level="1" size="medium" spacing>
            {tema.shortName}
          </Heading>
        )}
        <Markdown source={tema.description} />
      </div>

      <div className="my-8 lg:border-l-2 lg:pl-2 lg:border-gray-200">
        <Heading level="2" size="small" spacing>
          Ansvarlig for lovtolkning
        </Heading>
        {_.uniq(lover.map((lov) => lov.data?.underavdeling)).map((code, index) => (
          <BodyShort key={code + '_' + index} size="large" spacing>
            {codelistUtils.getCode(EListName.UNDERAVDELING, code)?.shortName}
          </BodyShort>
        ))}
        <Heading level="2" size="small" spacing>
          Lovdata
        </Heading>
        {lover.map((lov, index) => (
          <div key={lov.code + '_' + index} className="mb-1.5">
            <ExternalLink href={lovdataBase(lov.code)}>{lov.shortName}</ExternalLink>
          </div>
        ))}
      </div>
    </div>
  )
}

const TemaView = ({ tema, codelistUtils }: { tema: TTemaCode; codelistUtils: ICodelistProps }) => {
  const lover = codelistUtils.getCodesForTema(tema.code)
  const { data, loading } = useKravCounter(
    { lover: lover.map((lov) => lov.code) },
    { skip: !lover.length }
  )
  const [kravList, setKravList] = useState<IKrav[]>([])

  useEffect(() => {
    ampli.logEvent('sidevisning', {
      side: 'Tema side',
      sidetittel: tema.shortName,
      ...userRoleEventProp,
    })
  }, [])

  useEffect(() => {
    if (data && data.krav && data.krav.content && data.krav.content.length > 0) {
      ;(async () => {
        const kravPriorityList = await getKravPriorityListByTemaCode(tema.code)
        const kravListe = _.cloneDeep(data.krav.content)
        kravListe.map((krav) => {
          const priority = kravPriorityList.priorityList.indexOf(krav.kravNummer) + 1
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
      {getTemaMainHeader(tema, lover, codelistUtils)}
      <div className="mt-6">
        <Label>{loading ? '?' : data?.krav.numberOfElements || 0} krav</Label>
        {loading && <SkeletonPanel count={10} />}
        {!loading && kravList && (
          <div className="grid gap-2 ">
            {kravList.map((krav, index) => (
              <LinkPanel
                href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}
                key={krav.kravNummer + '.' + krav.kravVersjon + '_' + index}
              >
                <Detail weight="semibold">{kravNumView(krav)}</Detail>
                <BodyShort>{krav.navn}</BodyShort>
              </LinkPanel>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
