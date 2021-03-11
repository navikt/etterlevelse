import {useParams} from 'react-router-dom'
import {Block} from 'baseui/block'
import React from 'react'
import {HeadingMedium, HeadingSmall, HeadingXSmall, ParagraphMedium} from 'baseui/typography'
import {codelist, ListName} from '../services/Codelist'
import {ObjectLink} from '../components/common/RouteLink'
import {theme} from '../util'
import {KravFilterTable} from '../components/common/KravFilterTable'
import {TemaBilde} from '../components/Images'

export const TemaPage = () => {
  const {tema} = useParams<{tema: string}>()

  if (!tema) {
    return <Block width='100%'>
      <HeadingMedium>Velg tema</HeadingMedium>
      <Block>
        {codelist.getCodes(ListName.TEMA).map((code) =>
          <Block key={code.code} marginBottom={theme.sizing.scale400}>
            <ObjectLink id={code.code} type={ListName.TEMA}>{code.shortName}</ObjectLink>
          </Block>
        )}
      </Block>
    </Block>
  }

  const code = codelist.getCode(ListName.TEMA, tema)
  if (!code) return <>'invalid code'</>

  const lover = codelist.getCodesForTema(tema)

  return (
    <Block width='100%'>
      <Block display='flex' justifyContent='space-between'>
        <Block>
          <HeadingMedium marginTop={0}>Tema: {code.shortName}</HeadingMedium>
          <ParagraphMedium>{code.description}</ParagraphMedium>
        </Block>
        <Block>
          <Block marginLeft={theme.sizing.scale400}>
            <TemaBilde code={code} ellipse height={'220px'}/>
          </Block>

          <Block>
            {lover.map(lov =>
              <Block key={lov.code}>
                <HeadingXSmall marginTop={theme.sizing.scale400} marginBottom={theme.sizing.scale200}>Lov: {lov.shortName}</HeadingXSmall>
                <ParagraphMedium>
                  <ObjectLink type={ListName.LOV} id={lov.code}>Lovside</ObjectLink>
                </ParagraphMedium>
              </Block>
            )}
          </Block>
        </Block>
      </Block>
      <Block marginTop={theme.sizing.scale1200}>
        <Block>
          <HeadingSmall marginBottom={theme.sizing.scale200}>Krav</HeadingSmall>
          <KravFilterTable filter={{lover: lover.map(c => c.code)}} exclude={['avdeling', 'underavdeling', 'regelverk']}/>
        </Block>
      </Block>
    </Block>
  )
}
