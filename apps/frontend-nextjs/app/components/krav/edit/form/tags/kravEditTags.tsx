import LabelWithToolTip from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { ettlevColors } from '@/util/theme/theme'
import { BodyLong } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import Select, { CSSObjectWithLabel } from 'react-select'

export const KravEditTags = () => {
  const options = [
    { value: 'Personvernkonsekvensvurdering', label: 'Personvernkonsekvensvurdering' },
  ]

  return (
    <FieldArray name='tagger'>
      {(fieldArrayRenderProps: FieldArrayRenderProps) => {
        const selectedIds = (fieldArrayRenderProps.form.values['tagger'] as any[]).map(
          (value: any) => value
        )

        return (
          <div>
            <LabelWithToolTip label='Tagger' />
            <BodyLong className='text-[var(--a-text-subtle)]'>
              Tilgjengelig for admin til å sette på tagger
            </BodyLong>
            <Select
              aria-label='Tagger'
              isMulti
              options={options}
              value={selectedIds.map((value: any) =>
                options.find((option: { value: string; label: string }) => option.value === value)
              )}
              onChange={(values) => {
                if (values.length) {
                  fieldArrayRenderProps.form.setFieldValue(
                    'tagger',
                    values.map((value) => value && value.value)
                  )
                } else {
                  fieldArrayRenderProps.form.setFieldValue('tagger', [])
                }
              }}
              styles={{
                control: (baseStyles) =>
                  ({
                    ...baseStyles,
                    minHeight: '3rem',
                    borderColor: ettlevColors.textAreaBorder,
                  }) as CSSObjectWithLabel,
              }}
            />
          </div>
        )
      }}
    </FieldArray>
  )
}
