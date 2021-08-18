import { useParams } from 'react-router-dom'
import { Block } from 'baseui/block'
import React from 'react'
import { H1, H2, Paragraph2 } from 'baseui/typography'
import { codelist, ListName, LovCode } from '../services/Codelist'
import { ExternalLink, ObjectLink } from '../components/common/RouteLink'
import { theme } from '../util'
import { LovBilde } from '../components/Images'
import { lovdataBase } from '../components/Lov'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { Markdown } from '../components/common/Markdown'
import { ettlevColors, maxPageWidth } from '../util/theme'
import Button from '../components/common/Button'
import { Page } from '../components/scaffold/Page'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { useKravCounter } from './TemaPage'
import { PanelLink } from '../components/common/PanelLink'
import { kravNumView } from './KravPage'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'

const fontColor = ettlevColors.white

export const LovPage = () => {
  const { lov } = useParams<{ lov: string }>()

  if (!lov) {
    return (
      <Block id="content" overrides={{ Block: { props: { role: 'main' } } }} maxWidth={maxPageWidth} width="100%">
        <Block paddingLeft="40px" paddingRight="40px" width="calc(100%-80px)" display="flex" justifyContent="center">
          <Block>
            <H1>Velg lov</H1>
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

  console.log(lov, 'LOV')

  const underavdeling = codelist.getCode(ListName.UNDERAVDELING, lov.data?.underavdeling)

  const tema = codelist.getCode(ListName.TEMA, lov.data?.tema)

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Forstå kravene',
      href: '/tema'
    },
    {
      pathName: `${tema?.shortName}`,
      href: '/tema/' + tema?.code,
    },
  ]

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
          <H1 color={fontColor}>{lov.shortName}</H1>

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
                  <H2 color={fontColor} marginBottom={theme.sizing.scale200}>
                    Ansvarlig for lovtolkning i NAV
                  </H2>
                  <Paragraph2 color={fontColor}>
                    <ObjectLink fontColor={fontColor} type={ListName.UNDERAVDELING} id={underavdeling.code}>
                      {underavdeling?.shortName}
                    </ObjectLink>
                  </Paragraph2>
                </Block>
              )}

              <H2 color={fontColor} marginBottom={theme.sizing.scale200}>
                Loven i sin helhet
              </H2>
              <Paragraph2 color={fontColor}>
                <ExternalLink fontColor={fontColor} href={lovdataBase(lov.code)}>
                  {lov.shortName} i lovdata <FontAwesomeIcon size={'sm'} icon={faExternalLinkAlt} />
                </ExternalLink>
              </Paragraph2>
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
        <H2 color={ettlevColors.white}>{loading ? '?' : data?.krav.numberOfElements || 0} krav</H2>
        {loading && <SkeletonPanel count={10} />}
        {!loading &&
          data?.krav.content.map((k) => (
            <Block key={k.id} marginBottom={'8px'}>
              <PanelLink href={`/krav/${k.kravNummer}/${k.kravVersjon}`} beskrivelse={kravNumView(k)} title={k.navn} flip />
            </Block>
          ))}
      </Block>
    </Page>
  )
}
