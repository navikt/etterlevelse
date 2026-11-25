'use client'

import { Box, Radio, RadioGroup } from '@navikt/ds-react'
import { FieldArrayRenderProps } from 'formik'
import { FunctionComponent, useState } from 'react'

type TProps = {
  fieldArrayRenderProps: FieldArrayRenderProps
  fieldName: string
  suksesskriterieStatus: 'Oppfylt' | 'Ikke relevant' | 'Ikke oppfylt'
  marginTop?: boolean
  marginBottom?: boolean
}

const KravSuksesskriterieFlytRadioField: FunctionComponent<TProps> = ({
  fieldArrayRenderProps,
  fieldName,
  suksesskriterieStatus,
  marginTop,
  marginBottom,
}) => {
  const [radioValue, setRadioValue] = useState<any>()

  return (
    <Box
      padding='space-16'
      background='brand-blue-soft'
      borderRadius='0 0 0 8'
      className={`flex flex-1 ${marginTop ? 'mt-3' : ''} ${marginBottom ? 'mb-3' : ''}`}
    >
      <RadioGroup
        legend={`Velg konsekvens for flyt når suksesskriterium settes til ${suksesskriterieStatus}`}
        value={radioValue}
        onChange={(value) => {
          fieldArrayRenderProps.form.setFieldValue(fieldName, value === 'true' ? true : false)
          setRadioValue(value)
        }}
      >
        <Radio
          value='true'
          description='Etterlever får velge fritt hvilke suksesskriterier de skal besvare etterpå.'
        >
          Ingen konsekvens for flyt
        </Radio>
        <Radio
          value='false'
          description='Velg denne om du vil styre rekkefølgen til hvordan etterlever besvarer suksesskriteriene.'
        >
          Gå direkte til et bestemt suksesskriterium (etterlever slipper de imellom)
        </Radio>
        <Radio
          value='false'
          description='Eventuelle, resterende suksesskriterier i kravet vil ikke kreve svar fra etterlever.'
        >
          Etterlever blir ferdig med sin vurdering av dette kravet
        </Radio>
      </RadioGroup>
    </Box>
  )
}
export default KravSuksesskriterieFlytRadioField
