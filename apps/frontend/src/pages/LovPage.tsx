import {useParams} from 'react-router-dom'
import {Block} from 'baseui/block'
import React from 'react'
import {HeadingMedium, HeadingSmall, HeadingXSmall, ParagraphMedium} from 'baseui/typography'
import {codelist, ListName} from '../services/Codelist'
import {ExternalLink, ObjectLink} from '../components/common/RouteLink'
import {theme} from '../util'
import {KravFilterTable} from '../components/common/KravFilterTable'
import {LovBilde} from '../components/Images'
import {lovdataBase} from '../components/Lov'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {Markdown} from '../components/common/Markdown'

export const LovPage = () => {
  const {lov} = useParams<{lov: string}>()

  if (!lov) {
    return <Block width='100%'>
      <HeadingMedium>Velg lov</HeadingMedium>
      <Block>
        {codelist.getCodes(ListName.LOV).map((code) =>
          <Block key={code.code} marginBottom={theme.sizing.scale400}>
            <ObjectLink id={code.code} type={ListName.LOV}>{code.shortName}</ObjectLink>
          </Block>
        )}
      </Block>
    </Block>
  }

  const code = codelist.getCode(ListName.LOV, lov)
  if (!code) return <>'invalid code'</>

  const data = code.data || {}
  const underavdeling = codelist.getCode(ListName.UNDERAVDELING, data.underavdeling)

  return (
    <Block width='100%'>
      <Block display='flex' justifyContent='space-between'>
        <Block>
          <HeadingMedium marginTop={0}>Lov: {code.shortName}</HeadingMedium>
          <Markdown source={code.description}/>
        </Block>
        <Block>
          <Block marginLeft={theme.sizing.scale400}>
            <LovBilde code={code} ellipse height={'220px'}/>
          </Block>

          {underavdeling && <>
            <HeadingXSmall marginTop={theme.sizing.scale400} marginBottom={theme.sizing.scale200}>Ansvarlig for lovtolkning i NAV</HeadingXSmall>
            <ParagraphMedium>
              <ObjectLink type={ListName.UNDERAVDELING} id={underavdeling.code}>{underavdeling?.shortName}</ObjectLink>
            </ParagraphMedium>
          </>}

          <HeadingXSmall marginTop={theme.sizing.scale400} marginBottom={theme.sizing.scale200}>Loven i sin helhet</HeadingXSmall>
          <ParagraphMedium>
            <ExternalLink href={lovdataBase(code.code)}>{code.shortName} i lovdata <FontAwesomeIcon size={'sm'} icon={faExternalLinkAlt}/></ExternalLink>
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
