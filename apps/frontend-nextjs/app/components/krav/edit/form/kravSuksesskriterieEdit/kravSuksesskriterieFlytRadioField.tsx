'use client'

import { Box, Radio, RadioGroup } from '@navikt/ds-react'
import { FieldArrayRenderProps } from 'formik'
import { FunctionComponent } from 'react'
import { ESuksesskriteriumFlyt } from '@/constants/krav/kravConstants'

type TProps = {
  fieldArrayRenderProps: FieldArrayRenderProps
  fieldName: string
  suksesskriterieStatus: 'Oppfylt' | 'Ikke relevant' | 'Ikke oppfylt'
  value: ESuksesskriteriumFlyt
  setValue: (value: ESuksesskriteriumFlyt) => void
  marginTop?: boolean
  marginBottom?: boolean
}

const KravSuksesskriterieFlytRadioField: FunctionComponent<TProps> = ({
  fieldArrayRenderProps,
  fieldName,
  suksesskriterieStatus,
  value,
  setValue,
  marginTop,
  marginBottom,
}) => {
  return (
    <Box
      padding='space-16'
      background='brand-blue-soft'
      borderRadius='0 0 0 8'
      className={`flex flex-1 ${marginTop ? 'mt-3' : ''} ${marginBottom ? 'mb-3' : ''}`}
    >
      <RadioGroup
        legend={`Velg konsekvens for flyt når suksesskriterium settes til ${suksesskriterieStatus}`}
        value={value}
        onChange={(value) => {
          fieldArrayRenderProps.form.setFieldValue(fieldName, value)
          setValue(value)
        }}
      >
        <Radio
          value={ESuksesskriteriumFlyt.INGEN_KONSEKVENS}
          description='Etterlever får velge fritt hvilke suksesskriterier de skal besvare etterpå.'
        >
          Ingen konsekvens for flyt
        </Radio>
        <Radio
          value={ESuksesskriteriumFlyt.GA_OVER_NOEN_SUKSESSKRITERIER}
          description='Velg denne om du vil styre rekkefølgen til hvordan etterlever besvarer suksesskriteriene.'
        >
          Gå direkte til et bestemt suksesskriterium (etterlever slipper de imellom)
        </Radio>
        <Radio
          value={ESuksesskriteriumFlyt.GA_OVER_RESTERENDE_SUKSESSKRITERIER}
          description='Eventuelle, resterende suksesskriterier i kravet vil ikke kreve svar fra etterlever.'
        >
          Etterlever blir ferdig med sin vurdering av dette kravet
        </Radio>
      </RadioGroup>
    </Box>
  )
}
export default KravSuksesskriterieFlytRadioField
