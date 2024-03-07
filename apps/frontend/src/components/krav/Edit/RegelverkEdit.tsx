import { Button, Label, TextField } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { useState } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import { IRegelverk } from '../../../constants'
import { EListName, TLovCode, codelist } from '../../../services/Codelist'
import { ettlevColors } from '../../../util/theme'
import { LovView } from '../../Lov'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { Error, FormError } from '../../common/ModalSchema'
import { borderWidth } from '../../common/Style'
import { RenderTagList } from '../../common/TagList'

type TRegelverkEditProps = {
  forVirkemiddel?: boolean
}

export const RegelverkEdit = ({ forVirkemiddel }: TRegelverkEditProps) => {
  const [lov, setLov] = useState({ value: '', label: '', description: '' })
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const regelverkObject = () => ({
    lov: codelist.getCode(EListName.LOV, lov.value as string) as TLovCode,
    spesifisering: text,
  })

  const options = codelist.getParsedOptionsForLov(forVirkemiddel)

  return (
    <FieldWrapper marginBottom id="regelverk">
      <FieldArray name="regelverk">
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const add = () => {
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

          const hasError = !!fieldArrayRenderProps.form.errors['regelverk'] || error !== ''

          return (
            <div>
              <div>
                <div className="flex items-end">
                  <div className="w-full max-w-[25rem] mr-2.5">
                    <LabelWithTooltip
                      label={'Regelverk'}
                      tooltip={
                        'Velg relevant regelverk fra nedtrekksmenyen, og angi hvilke(n) bestemmelse(r) kravet har sin opprinnelse fra.'
                      }
                    />
                    <Select
                      options={options}
                      placeholder="Velg regelverk"
                      aria-label="Velg regelverk"
                      value={lov}
                      onChange={(value) => {
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
                  <div className="w-full">
                    <LabelWithTooltip
                      label="Paragraf, kapittel eller artikkel i regelverk"
                      tooltip="Legg til paragraf, kapittel eller artikkel fra regelverk du har valgt."
                    />
                    <TextField
                      label="Paragraf, kapittel eller artikkel i regelverk"
                      hideLabel
                      value={text}
                      onChange={(e) => setText((e.target as HTMLInputElement).value)}
                      placeholder="Beskrivelse, paragraf, artikkel eller kapittel i regelverk"
                    />
                  </div>

                  <div className="min-w-[6.688rem] ml-2.5">
                    <Button type="button" onClick={add} variant="secondary">
                      Legg til
                    </Button>
                  </div>
                </div>
                {error && <Error message={error} />}
                {!error && <FormError fieldName="regelverk" akselStyling />}
                {!!lov && text && (
                  <div className="flex items-center mt-2.5">
                    <Label className="mr-6">Forhåndsvisning: </Label>
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
