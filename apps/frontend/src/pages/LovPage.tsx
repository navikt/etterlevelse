import { useParams } from 'react-router-dom'
import { Block } from 'baseui/block'
import React, { useEffect, useState } from 'react'
import { HeadingXLarge, HeadingXXLarge, LabelLarge, ParagraphMedium } from 'baseui/typography'
import { codelist, ListName, LovCode } from '../services/Codelist'
import { ExternalLink, ObjectLink } from '../components/common/RouteLink'
import { theme } from '../util'
import { lovdataBase } from '../components/Lov'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { Markdown } from '../components/common/Markdown'
import { ettlevColors, maxPageWidth } from '../util/theme'
import Button from '../components/common/Button'
import { Page } from '../components/scaffold/Page'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { useKravCounter } from './TemaPage'
import { PanelLink } from '../components/common/PanelLink'
import { kravNumView } from './KravPage'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { sortKraverByPriority } from '../util/sort'
import { Krav } from '../constants'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'

const fontColor = ettlevColors.white

export const LovPage = () => {
  const { lov } = useParams<{ lov: string }>()

  if (!lov) {
    ampli.logEvent('sidevisning', { side: 'Lov side' })
    return (
      <Block id="content" overrides={{ Block: { props: { role: 'main' } } }} maxWidth={maxPageWidth} width="100%">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Velg lov</title>
        </Helmet>
        <Block paddingLeft="40px" paddingRight="40px" width="calc(100%-80px)" display="flex" justifyContent="center">
          <Block>
            <HeadingXXLarge>Velg lov</HeadingXXLarge>
            <Block>
              {codelist.getCodes(ListName.LOV).map((code) => (
                <Block key={code.code} marginBottom={theme.sizing.scale400}>
                  <ObjectLink id={code.code} type={ListName.LOV}>
                    {code.shortName}
                  </ObjectLink>
                </Block>
              ))}
            </Block>
          </Block>
        </Block>
      </Block>
    )
  }

  const code = codelist.getCode(ListName.LOV, lov)
  if (!code) return <>'invalid code'</>
  return <LovSide lov={code} />
}

const LovSide = ({ lov }: { lov: LovCode }) => {
  const [expand, setExpand] = React.useState(false)
  const { data, loading } = useKravCounter({ lover: [lov.code] })
  const [kravList, setKravList] = useState<Krav[]>([])

  const underavdeling = codelist.getCode(ListName.UNDERAVDELING, lov.data?.underavdeling)

  const tema = codelist.getCode(ListName.TEMA, lov.data?.tema)

  ampli.logEvent('sidevisning', { side: 'Lov side', sidetittel: lov.shortName })

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Forstå kravene',
      href: '/tema',
    },
    {
      pathName: `${tema?.shortName}`,
      href: '/tema/' + tema?.code,
    },
  ]

  useEffect(() => {
    if (data && data.krav && data.krav.content && data.krav.content.length > 0) {
      setKravList(sortKraverByPriority<Krav>(data.krav.content, tema?.shortName || ''))
    }
  }, [data])

  return (
    <Page
      currentPage={lov.shortName}
      breadcrumbPaths={breadcrumbPaths}
      backBtnColor={fontColor}
      headerBackgroundColor={ettlevColors.green800}
      backgroundColor={ettlevColors.grey25}
      headerOverlap={'125px'}
      header={
        <>
          <Helmet>
            <meta charSet="utf-8" />
            <title>{lov.shortName ? lov.shortName : ''} </title>
          </Helmet>
          <HeadingXXLarge marginTop="0px" color={fontColor}>
            {lov.shortName}
          </HeadingXXLarge>

          <Block
            minHeight={'125px'}
            maxHeight={expand ? undefined : '125px'}
            overflow={'hidden'}
            $style={{
              maskImage: expand ? undefined : `linear-gradient(${ettlevColors.black} 40%, transparent)`,
            }}
          >
            <Markdown fontColor={fontColor} source={lov.description} />
          </Block>

          {expand && (
            <Block marginBottom={theme.sizing.scale900}>
              {/* <Block marginLeft={theme.sizing.scale400}>
                <LovBilde code={lov} ellipse height={'220px'} />
              </Block> */}
              {underavdeling && (
                <Block>
                  <HeadingXLarge color={fontColor} marginBottom={theme.sizing.scale200}>
                    Ansvarlig for lovtolkning i NAV
                  </HeadingXLarge>
                  <ParagraphMedium color={fontColor}>
                    <ObjectLink fontColor={fontColor} type={ListName.UNDERAVDELING} id={underavdeling.code}>
                      {underavdeling?.shortName}
                    </ObjectLink>
                  </ParagraphMedium>
                </Block>
              )}

              <HeadingXLarge color={fontColor} marginBottom={theme.sizing.scale200}>
                Loven i sin helhet
              </HeadingXLarge>
              <ParagraphMedium color={fontColor}>
                <ExternalLink href={lovdataBase(lov.code)} openOnSamePage>
                  {lov.shortName} i lovdata
                </ExternalLink>
              </ParagraphMedium>
            </Block>
          )}

          <Block alignSelf={'flex-end'} marginTop={theme.sizing.scale600}>
            <Button $style={{ color: fontColor }} onClick={() => setExpand(!expand)} icon={expand ? faChevronUp : faChevronDown} kind={'underline-hover'}>
              {expand ? 'Mindre' : 'Mer'} om loven
            </Button>
          </Block>
        </>
      }
    >
      <Block>
        <HeadingXLarge color={ettlevColors.white}>{loading ? '?' : data?.krav.numberOfElements || 0} krav</HeadingXLarge>
        {loading && <SkeletonPanel count={10} />}
        {!loading &&
          kravList.map((k) => (
            <Block key={k.id} marginBottom={'8px'}>
              <PanelLink
                useUnderline
                href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
                beskrivelse={kravNumView(k)}
                title={<LabelLarge $style={{ fontSize: '18px' }}>{k.navn}</LabelLarge>}
                flip
              />
            </Block>
          ))}
      </Block>
    </Page>
  )
}
