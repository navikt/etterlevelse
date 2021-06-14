import React, { useRef, useState } from 'react'
import { Block } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { behandlingName, useBehandling } from '../api/BehandlingApi'
import { HeadingLarge, Label3, Paragraph2, H1 } from 'baseui/typography'
import { FormikProps } from 'formik'
import { ettlevColors, maxPageWidth, theme } from '../util/theme'
import { Page } from '../components/scaffold/Page'
import { Teams } from '../components/common/TeamName'

export const BehandlingPage = () => {
  const params = useParams<{ id?: string }>()
  const [behandling, setBehandling] = useBehandling(params.id)
  const formRef = useRef<FormikProps<any>>()

  if (!behandling) return <LoadingSkeleton header='Behandling' />

  return (
    <Page
      backUrl={'/'}
      headerBackgroundColor={ettlevColors.grey75}
      backgroundColor={ettlevColors.grey75}
      wideMain
    >
      <Block display="flex" justifyContent="space-between" marginBottom='70px'>
        <Block marginTop={theme.sizing.scale1200}>
          <Label3 color={ettlevColors.green600}>DOKUMENTERE ETTERLEVELSE</Label3>
          <H1 marginTop='0' color={ettlevColors.green800}>Ajourholde behandlingsoversikt</H1>         
          <Paragraph2>{behandling.navn}</Paragraph2>
          <Teams teams={behandling.teams} link list/>
        </Block>

        <Block
          width="400px"
          height='260px'
          backgroundColor={ettlevColors.white}
          marginTop={theme.sizing.scale400}
        >
          <Block padding="5px">
            <HeadingLarge>Hva er egenskapene til behandlingen?</HeadingLarge>
            <Block $style={{ fontWeight: 400, fontSize: '18px', fontFamily: 'Source Sans Pro' }}>
              Hvis du tilpasser egenskapene skjuler vi kravene som ikke er relevante for din løsning.
            </Block>
          </Block>
        </Block>
      </Block>

      <Block 
        width='100%'
        height='100px' 
        // maxHeight={theme.sizing.scale2400 + theme.sizing.scale100}
        maxHeight='100px'
        backgroundColor='white'
      >
        test
      </Block>
    </Page>
  )
}
