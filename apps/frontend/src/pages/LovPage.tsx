import {useParams} from 'react-router-dom'
import {Block} from 'baseui/block'
import React from 'react'
import {HeadingMedium, HeadingSmall, ParagraphMedium} from 'baseui/typography'
import {codelist, ListName} from '../services/Codelist'
import RouteLink, {ExternalLink} from '../components/common/RouteLink'
import {theme} from '../util'
import {KravFilterTable} from '../components/common/KravFilterTable'
import {lovdataBase} from '../components/Lov'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

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
  return (
    <Block>
      <HeadingMedium>Lov: {code?.shortName}</HeadingMedium>
      <ParagraphMedium>
        {code && <ExternalLink href={lovdataBase(code.code)}>{code.shortName} på lovdata <FontAwesomeIcon icon={faExternalLinkAlt}/></ExternalLink>}
      </ParagraphMedium>

      <Block marginTop={theme.sizing.scale1200}>
        <Block>
          <HeadingSmall marginBottom={theme.sizing.scale200}>Krav</HeadingSmall>
          <KravFilterTable filter={{lov}}/>
        </Block>
      </Block>
    </Block>
  )
}
