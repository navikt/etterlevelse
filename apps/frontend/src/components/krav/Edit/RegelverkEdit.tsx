import React, { useState } from 'react'
import { ImperativeMethods, Select, SelectOverrides, SelectProps, Value } from 'baseui/select'
import { codelist, ListName } from '../../../services/Codelist'
import { FieldWrapper } from '../../common/Inputs'
import { FieldArray } from 'formik'
import { FormControl } from 'baseui/form-control'
import { Block } from 'baseui/block'
import { theme } from '../../../util'
import Button from '../../common/Button'
import { LabelSmall } from 'baseui/typography'
import { LovView } from '../../Lov'
import { RenderTagList } from '../../common/TagList'
import { Regelverk } from '../../../constants'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import CustomizedInput from '../../common/CustomizedInput'
import { ettlevColors } from '../../../util/theme'
import { borderColor, borderWidth } from '../../common/Style'
import { navChevronDownIcon } from '../../Images'
import _ from 'lodash'

export const customSelectOverrides: SelectOverrides = {
  ControlContainer: {
    style: {
      ...borderWidth('1px'),
      ':hover': {
        backgroundColor: ettlevColors.green50,
      },
    },
  },
  SelectArrow: {
    component: ({ $isOpen }: { $isOpen: boolean }) =>
      $isOpen ? <img src={navChevronDownIcon} alt="Chevron opp" style={{ transform: 'rotate(180deg)' }} /> : <img src={navChevronDownIcon} alt="Chevron ned" />,
  },
  DropdownListItem: {
    style: {
      fontSize: '18px',
      marginTop: '4px',
      marginBottom: '4px',
    },
  },
}

const CustomizedRegelverkSelect = (props: SelectProps) => {
  const overrides = _.merge(customSelectOverrides, props.overrides)

  return <Select {...props} overrides={overrides} />
}

type RegelverkEditProps = {
  forVirkemiddel?: boolean
}

export const RegelverkEdit = ({ forVirkemiddel }: RegelverkEditProps) => {
  const [lov, setLov] = useState<Value>([])
  const [text, setText] = useState('')
  const controlRef: React.Ref<ImperativeMethods> = React.useRef<ImperativeMethods>(null)

  const regelverkObject = () => ({ lov: codelist.getCode(ListName.LOV, lov[0].id as string)!, spesifisering: text })

  return (
    <FieldWrapper marginBottom>
      <FieldArray name="regelverk">
        {(p) => {
          const add = () => {
            if (!text || !lov.length) return
            p.push(regelverkObject())
            setLov([])
            setText('')
            // controlRef.current?.focus()
          }
          return (
            <FormControl>
              <Block>
                <Block>
                  <Block display="flex" alignItems={'flex-end'}>
                    <Block width="100%" maxWidth="400px" marginRight={theme.sizing.scale400}>
                      <LabelWithTooltip
                        label={'Regelverk'}
                        tooltip={'Velg relevant regelverk fra nedtrekksmenyen, og angi hvilke(n) bestemmelse(r) kravet har sin opprinnelse fra.'}
                      />
                      <CustomizedRegelverkSelect
                        controlRef={controlRef}
                        placeholder={'Velg regelverk'}
                        aria-label={'Velg regelverk'}
                        maxDropdownHeight="400px"
                        value={lov}
                        options={codelist.getParsedOptionsForLov(forVirkemiddel)}
                        onChange={({ value }) => {
                          setLov(value)
                        }}
                        overrides={{
                          ControlContainer: {
                            style: {
                              backgroundColor: p.form.errors.regelverk ? ettlevColors.error50 : ettlevColors.white,
                              ...borderColor(p.form.errors.regelverk ? ettlevColors.red600 : ettlevColors.grey200),
                              ...borderWidth('2px'),
                            },
                          },
                        }}
                      />
                    </Block>
                    <Block width="100%">
                      <LabelWithTooltip label={'Paragraf, kapittel eller artikkel i regelverk'} tooltip={'Legg til paragraf, kapittel eller artikkel fra regelverk du har valgt.'} />
                      <CustomizedInput
                        value={text}
                        onChange={(e) => setText((e.target as HTMLInputElement).value)}
                        placeholder={'Beskrivelse, paragraf, artikkel eller kapittel i regelverk'}
                        overrides={{
                          Input: {
                            style: {
                              backgroundColor: p.form.errors.regelverk ? ettlevColors.error50 : '',
                            },
                          },
                          Root: {
                            style: {
                              borderRightColor: p.form.errors.regelverk ? ettlevColors.red600 : ettlevColors.grey200,
                              borderLeftColor: p.form.errors.regelverk ? ettlevColors.red600 : ettlevColors.grey200,
                              borderTopColor: p.form.errors.regelverk ? ettlevColors.red600 : ettlevColors.grey200,
                              borderBottomColor: p.form.errors.regelverk ? ettlevColors.red600 : ettlevColors.grey200,
                            },
                          },
                        }}
                      />
                    </Block>

                    <Block minWidth="107px">
                      <Button type="button" size="compact" onClick={add} marginLeft kind="secondary">
                        Legg til
                      </Button>
                    </Block>
                  </Block>
                  {!!lov.length && text && (
                    <Block display="flex" alignItems="center" marginTop={theme.sizing.scale400}>
                      <LabelSmall marginRight={theme.sizing.scale800}>Forhåndsvisning: </LabelSmall>
                      <LovView regelverk={regelverkObject()} />
                    </Block>
                  )}
                </Block>
                <RenderTagList
                  wide
                  list={p.form.values.regelverk.map((r: Regelverk) => (
                    <LovView regelverk={r} />
                  ))}
                  onRemove={p.remove}
                />
              </Block>
            </FormControl>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
