import React, { useRef, useState } from 'react'
import { Block } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { HeadingLarge, Label3, Paragraph2, H1, H2 } from 'baseui/typography'
import { ettlevColors, theme } from '../util/theme'
import { Layout2 } from '../components/scaffold/Page'


export const BehandlingerTemaPage = () => {
  const params = useParams<{ id?: string, tema?: string }>()
  

  const getMainHeader = () => (
    <Block display="flex" justifyContent="space-between" marginBottom="70px">
      <Block marginTop={theme.sizing.scale1200}>
        <Label3 color={ettlevColors.green600}>DOKUMENTERE ETTERLEVELSE</Label3>
        <H1 marginTop="0" color={ettlevColors.green800}>
          {params.tema}
        </H1>
        <Paragraph2>Bare testdata</Paragraph2>
        <span>Kommer link her</span>
      </Block>

      <Block height="260px" marginTop={theme.sizing.scale400}>
        <Block padding="5px">
          <HeadingLarge>Hva er egenskapene til behandlingen?</HeadingLarge>
          <Block $style={{ fontWeight: 400, fontSize: '18px', fontFamily: 'Source Sans Pro' }}>
            Hvis du tilpasser egenskapene skjuler vi kravene som ikke er relevante for din løsning.
          </Block>
        </Block>
      </Block>
    </Block>
  )

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey50}
      mainHeader={getMainHeader()}
      secondaryHeaderBackgroundColor={ettlevColors.white}
      secondaryHeader={<Block width="100%" height="100px">Test</Block>}
      childrenBackgroundColor={ettlevColors.grey50}
      backBtnUrl={'/behandlinger'}
    >
      <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale1200}>
        Test
      </Block>
    </Layout2>
  )
}

