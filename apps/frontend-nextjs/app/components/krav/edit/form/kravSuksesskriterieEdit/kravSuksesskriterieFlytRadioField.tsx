'use client'

import { Box, Radio, RadioGroup, Select } from '@navikt/ds-react'
import { FieldArrayRenderProps } from 'formik'
import { FunctionComponent } from 'react'
import { ESuksesskriteriumFlyt, ISuksesskriterie } from '@/constants/krav/kravConstants'

type TProps = {
  index: number
  suksesskriterier: ISuksesskriterie[]
  fieldArrayRenderProps: FieldArrayRenderProps
  fieldName: string
  suksesskriterieStatus: 'Oppfylt' | 'Ikke relevant' | 'Ikke oppfylt'
  value: ESuksesskriteriumFlyt
  setValue: (value: ESuksesskriteriumFlyt) => void
  hopperOverTilIndex?: number
  setHopperOverTilIndex: (value: number | undefined) => void
  error?: string
  scrollMarginTop?: number
  marginTop?: boolean
  marginBottom?: boolean
}

const KravSuksesskriterieFlytRadioField: FunctionComponent<TProps> = ({
  index,
  suksesskriterier,
  fieldArrayRenderProps,
  fieldName,
  suksesskriterieStatus,
  value,
  setValue,
  hopperOverTilIndex,
  setHopperOverTilIndex,
  error,
  scrollMarginTop,
  marginTop,
  marginBottom,
}) => {
  const etterfolgendeSuksesskriterier = suksesskriterier
    .map((suksesskriterium, suksesskriteriumIndex) => ({ suksesskriterium, suksesskriteriumIndex }))
    .filter(({ suksesskriteriumIndex }) => suksesskriteriumIndex > index)

  return (
    <Box
      id={`suksesskriterier[${index}].${fieldName}`}
      style={{ scrollMarginTop }}
      padding='space-16'
      background='brand-blue-soft'
      borderRadius='0 0 0 8'
      className={`flex flex-1 ${marginTop ? 'mt-3' : ''} ${marginBottom ? 'mb-3' : ''}`}
    >
      <RadioGroup
        error={error}
        legend={`Velg konsekvens for flyt når suksesskriterium settes til ${suksesskriterieStatus}`}
        value={value}
        onChange={(value) => {
          fieldArrayRenderProps.form.setFieldValue(fieldName, value)
          setValue(value)
          if (value !== ESuksesskriteriumFlyt.GA_OVER_NOEN_SUKSESSKRITERIER) {
            setHopperOverTilIndex(undefined)
          }
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
        {value === ESuksesskriteriumFlyt.GA_OVER_NOEN_SUKSESSKRITERIER && (
          <Select
            label='Velg hvilket suksesskriterium etterlever skal til direkte'
            description='Innebærer at suksesskriterier som hoppes over, ikke trenger et svar'
            value={hopperOverTilIndex ?? ''}
            onChange={(event) =>
              setHopperOverTilIndex(
                event.target.value === '' ? undefined : Number(event.target.value)
              )
            }
          >
            <option value=''>Velg suksesskriterium</option>
            {etterfolgendeSuksesskriterier.map(({ suksesskriterium, suksesskriteriumIndex }) => (
              <option key={suksesskriterium.id} value={suksesskriteriumIndex}>
                {`${suksesskriteriumIndex + 1} av ${suksesskriterier.length} ${suksesskriterium.navn ? `: ${suksesskriterium.navn}` : ''}`}
              </option>
            ))}
          </Select>
        )}
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
