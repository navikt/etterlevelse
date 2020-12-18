import {useParams} from 'react-router-dom'
import {Block} from 'baseui/block'
import React from 'react'
import {HeadingMedium, HeadingSmall, ParagraphMedium} from 'baseui/typography'
import {codelist, ListName} from '../services/Codelist'
import RouteLink from '../components/common/RouteLink'
import {theme} from '../util'
import {KravFilterTable} from '../components/common/KravFilterTable'

export const RelevansPage = () => {
  const {relevans} = useParams()

  if (!relevans) {
    return <Block>
      <HeadingMedium>Velg relevans</HeadingMedium>
      <Block>
        {codelist.getCodes(ListName.RELEVANS).map((code) =>
          <Block key={code.code} marginBottom={theme.sizing.scale400}>
            <RouteLink href={`/relevans/${code.code}`}>{code.shortName}</RouteLink>
          </Block>
        )}
      </Block>
    </Block>
  }

  const code = codelist.getCode(ListName.RELEVANS, relevans)
  return (
    <Block>
      <HeadingMedium>Relevans: {code?.shortName}</HeadingMedium>
      <ParagraphMedium>{code?.description}</ParagraphMedium>

      <Block marginTop={theme.sizing.scale1200}>
        <Block>
          <HeadingSmall marginBottom={theme.sizing.scale200}>Krav</HeadingSmall>
          <KravFilterTable filter={{relevans}}/>
        </Block>
      </Block>
    </Block>
  )
}
