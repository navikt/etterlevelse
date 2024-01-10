import { Button, TextField } from '@navikt/ds-react'
import { Block } from 'baseui/block'
import { LabelSmall } from 'baseui/typography'
import { FieldArray } from 'formik'
import { useState } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import { IRegelverk } from '../../../constants'
import { EListName, codelist } from '../../../services/Codelist'
import { theme } from '../../../util'
import { LovView } from '../../Lov'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { RenderTagList } from '../../common/TagList'

type TRegelverkEditProps = {
  forVirkemiddel?: boolean
}

export const RegelverkEdit = ({ forVirkemiddel }: TRegelverkEditProps) => {
  const [lov, setLov] = useState({ value: '', label: '', description: '' })
  const [text, setText] = useState('')

  const regelverkObject = () => ({ lov: codelist.getCode(EListName.LOV, lov.value as string)!, spesifisering: text })

  const options = codelist.getParsedOptionsForLov(forVirkemiddel)

  return (
    <FieldWrapper marginBottom>
      <FieldArray name="regelverk">
        {(p) => {
          const add = () => {
            if (!text || !lov) return
            p.push(regelverkObject())
            setLov({ value: '', label: '', description: '' })
            setText('')
            // controlRef.current?.focus()
          }
          return (
            <div>
              <div>
                <div className="flex items-end">
                  <div className="w-full max-w-[400px] mr-2.5">
                    <LabelWithTooltip
                      label={'Regelverk'}
                      tooltip={'Velg relevant regelverk fra nedtrekksmenyen, og angi hvilke(n) bestemmelse(r) kravet har sin opprinnelse fra.'}
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
                        control: (baseStyles) => ({
                          ...baseStyles,
                          height: '48px',
                        } as CSSObjectWithLabel),
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          zIndex: 2,
                        } as CSSObjectWithLabel),
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <LabelWithTooltip label="Paragraf, kapittel eller artikkel i regelverk" tooltip="Legg til paragraf, kapittel eller artikkel fra regelverk du har valgt." />
                    <TextField
                      label="Paragraf, kapittel eller artikkel i regelverk"
                      hideLabel
                      value={text}
                      onChange={(e) => setText((e.target as HTMLInputElement).value)}
                      placeholder="Beskrivelse, paragraf, artikkel eller kapittel i regelverk"
                    />
                  </div>

                  <div className="min-w-[107px] ml-2.5">
                    <Button type="button" onClick={add} variant="secondary">
                      Legg til
                    </Button>
                  </div>
                </div>
                {!!lov && text && (
                  <Block display="flex" alignItems="center" marginTop={theme.sizing.scale400}>
                    <LabelSmall marginRight={theme.sizing.scale800}>Forhåndsvisning: </LabelSmall>
                    <LovView regelverk={regelverkObject()} />
                  </Block>
                )}
              </div>
              <RenderTagList
                list={p.form.values.regelverk.map((r: IRegelverk) => (
                  <LovView regelverk={r}  key={r.lov.code}/>
                ))}
                onRemove={p.remove}
              />
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
