import {useParams} from 'react-router-dom'
import {Block} from 'baseui/block'
import React from 'react'
import {HeadingMedium, HeadingSmall, HeadingXSmall, ParagraphMedium} from 'baseui/typography'
import {codelist, ListName, LovCodeData} from '../services/Codelist'
import RouteLink, {ExternalLink, ObjectLink} from '../components/common/RouteLink'
import {theme} from '../util'
import {KravFilterTable} from '../components/common/KravFilterTable'
import {LovBilde} from '../components/Images'
import {lovdataBase} from '../components/Lov'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'

export const LovPage = () => {
  const {lov} = useParams<{lov: string}>()

  if (!lov) {
    return <Block>
      <HeadingMedium>Velg lov</HeadingMedium>
      <Block>
        {codelist.getCodes(ListName.LOV).map((code) =>
          <Block key={code.code} marginBottom={theme.sizing.scale400}>
            <RouteLink href={`/lov/${code.code}`}>{code.shortName}</RouteLink>
          </Block>
        )}
      </Block>
    </Block>
  }

  const code = codelist.getCode(ListName.LOV, lov)
  if (!code) return <>'invalid code'</>

  const data = code.data || {} as LovCodeData
  const underavdeling = codelist.getCode(ListName.UNDERAVDELING, data.underavdeling)

  return (
    <Block>
      <Block display='flex' justifyContent='space-between'>
        <Block>
          <HeadingMedium marginTop={0}>Lov: {code.shortName}</HeadingMedium>
          <ParagraphMedium>{code.description}</ParagraphMedium>
        </Block>
        <Block>
          <LovBilde code={code} ellipse height={'200px'}/>

          {underavdeling && <>
            <HeadingXSmall marginTop={theme.sizing.scale400} marginBottom={theme.sizing.scale200}>Ansvarlig for lovtolkning i NAV</HeadingXSmall>
            <ParagraphMedium>
              <ObjectLink type={ListName.UNDERAVDELING} id={underavdeling.code}>{underavdeling?.shortName}</ObjectLink>
            </ParagraphMedium>
          </>}

          <HeadingXSmall marginTop={theme.sizing.scale400} marginBottom={theme.sizing.scale200}>Loven i sin helhet</HeadingXSmall>
          <ParagraphMedium>
            <ExternalLink href={lovdataBase(code.code)}>{code.shortName} i lovdata <FontAwesomeIcon icon={faExternalLinkAlt}/></ExternalLink>
          </ParagraphMedium>
        </Block>
      </Block>
      <Block marginTop={theme.sizing.scale1200}>
        <Block>
          <HeadingSmall marginBottom={theme.sizing.scale200}>Krav</HeadingSmall>
          <KravFilterTable filter={{lov}} exclude={['avdeling', 'underavdeling', 'regelverk']}/>
        </Block>
      </Block>
    </Block>
  )
}
