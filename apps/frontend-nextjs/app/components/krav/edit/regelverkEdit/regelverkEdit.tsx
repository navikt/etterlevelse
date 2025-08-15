import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import LabelWithToolTip from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { Error } from '@/components/common/modalSchema/ModalSchema'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { LovView } from '@/components/lov/lov'
import { EListName, IRegelverk, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { borderWidth } from '@/util/style/style'
import { ettlevColors } from '@/util/theme/theme'
import { Button, Label, TextField } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { ChangeEvent, useState } from 'react'
import Select, { CSSObjectWithLabel, SingleValue } from 'react-select'

export const RegelverkEdit = () => {
  const [lov, setLov] = useState({ value: '', label: '', description: '' })
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const regelverkObject = (): {
    lov: TLovCode
    spesifisering: string
  } => ({
    lov: codelist.getCode(EListName.LOV, lov.value as string) as TLovCode,
    spesifisering: text,
  })

  const options: {
    value: string
    label: string
    description: string
  }[] = codelist.getParsedOptionsForLov()

  return (
    <FieldWrapper marginBottom id='regelverk'>
      <FieldArray name='regelverk'>
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const add = (): void => {
            if (!text || !lov) return
            if (lov.value === '') {
              setError('Du må velge minst et regelverk')
              return
            }
            setError('')
            fieldArrayRenderProps.push(regelverkObject())
            setLov({ value: '', label: '', description: '' })
            setText('')
          }

          const hasError: boolean = !!fieldArrayRenderProps.form.errors['regelverk'] || error !== ''

          return (
            <div>
              <div>
                <div className='flex items-end'>
                  <div className='w-full max-w-[25rem] mr-2.5'>
                    <LabelWithToolTip
                      label={'Regelverk'}
                      tooltip={
                        'Velg relevant regelverk fra nedtrekksmenyen, og angi hvilke(n) bestemmelse(r) kravet har sin opprinnelse fra.'
                      }
                    />
                    <Select
                      options={options}
                      placeholder='Velg regelverk'
                      aria-label='Velg regelverk'
                      value={lov}
                      onChange={(
                        value: SingleValue<{
                          value: string
                          label: string
                          description: string
                        }>
                      ) => {
                        if (value) {
                          setLov(value)
                        }
                      }}
                      styles={{
                        control: (baseStyles) =>
                          ({
                            ...baseStyles,
                            height: '3rem',
                            borderColor: hasError
                              ? ettlevColors.red500
                              : ettlevColors.textAreaBorder,
                            ...borderWidth(hasError ? '0.125rem' : '0.063rem'),
                          }) as CSSObjectWithLabel,
                        menu: (baseStyles) =>
                          ({
                            ...baseStyles,
                            zIndex: 2,
                          }) as CSSObjectWithLabel,
                      }}
                    />
                  </div>
                  <div className='w-full'>
                    <LabelWithToolTip
                      label='Paragraf, kapittel eller artikkel i regelverk'
                      tooltip='Legg til paragraf, kapittel eller artikkel fra regelverk du har valgt.'
                    />
                    <TextField
                      label='Paragraf, kapittel eller artikkel i regelverk'
                      hideLabel
                      value={text}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setText((event.target as HTMLInputElement).value)
                      }
                      placeholder='Beskrivelse, paragraf, artikkel eller kapittel i regelverk'
                    />
                  </div>

                  <div className='min-w-[6.688rem] ml-2.5'>
                    <Button type='button' onClick={add} variant='secondary'>
                      Legg til
                    </Button>
                  </div>
                </div>
                {error && <Error message={error} />}
                {!error && <FormError fieldName='regelverk' akselStyling />}
                {!!lov && text && (
                  <div className='flex items-center mt-2.5'>
                    <Label className='mr-6'>Forhåndsvisning: </Label>
                    <LovView regelverk={regelverkObject()} />
                  </div>
                )}
              </div>

              <RenderTagList
                list={fieldArrayRenderProps.form.values.regelverk.map((regelverk: IRegelverk) => (
                  <LovView regelverk={regelverk} key={regelverk.lov.code} />
                ))}
                onRemove={fieldArrayRenderProps.remove}
              />
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
