import { Block, BlockProps } from 'baseui/block'
import { Label2 } from 'baseui/typography'
import { Field, FieldProps } from 'formik'
import { Code, codelist, CodeListFormValues, ListName, LovCodeData, TemaCodeData } from '../../../services/Codelist'
import * as React from 'react'
import { SIZE as InputSIZE } from 'baseui/input'
import { OptionList } from '../../common/Inputs'
import { temaBilder } from '../../Images'
import { StatefulTooltip } from 'baseui/tooltip'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { theme } from '../../../util'
import Button from '../../common/Button'
import CustomizedInput from '../../common/CustomizedInput'
import CustomizedSelect from '../../common/CustomizedSelect'
import CustomizedTextarea from "../../common/CustomizedTextarea";
import {Error} from "../../common/ModalSchema";

const rowBlockProps: BlockProps = {
  display: 'flex',
  width: '100%',
  marginTop: '1rem',
  alignItems: 'center',
}

export const LovCodeDataForm = () => {
  return (
    <Block {...rowBlockProps} flexDirection="column">
      <Block {...rowBlockProps}>
        <Label2 marginRight={'1rem'} width="25%">
          Lovkode data
        </Label2>
      </Block>
      <Field name="data">
        {({ field, form }: FieldProps<LovCodeData, CodeListFormValues>) => {
          const data = field.value

          const set = (val: Partial<LovCodeData>) => {
            form.setFieldValue('data', { ...data, ...val })
          }

          // Migrate old
          if (!data.lovId && form.values.description) {
            set({ lovId: form.values.description })
          }

          return (
            <>
              <Block {...rowBlockProps}>
                <Label2 marginRight={'1rem'} width="25%">
                  Lov ID:
                </Label2>
                <CustomizedInput type="input" size={InputSIZE.default} value={data.lovId} onChange={(str) => set({ lovId: (str.target as HTMLInputElement).value })} />
              </Block>

              <Block {...rowBlockProps}>
                <Label2 marginRight={'1rem'} width="25%">
                  {' '}
                  Underavdeling:{' '}
                </Label2>
                <OptionList
                  listName={ListName.UNDERAVDELING}
                  value={codelist.getCode(ListName.UNDERAVDELING, data.underavdeling)}
                  onChange={(val) => set({ underavdeling: val.code })}
                  label={'Underavdeling'}
                />
              </Block>

              <Block {...rowBlockProps}>
                <Label2 marginRight={'1rem'} width="25%">
                  Tema:{' '}
                </Label2>
                <OptionList
                  listName={ListName.TEMA}
                  value={codelist.getCode(ListName.TEMA, data.tema) as Code | undefined}
                  onChange={(val) => set({ tema: val.code })}
                  label={'Tema'}
                />
              </Block>
            </>
          )
        }}
      </Field>
    </Block>
  )
}

export const TemaCodeDataForm = () => {
  const temaBildeOptions = Object.keys(temaBilder).map((id) => ({
    id,
    label: id,
    bilde: temaBilder[id],
  }))

  return (
    <Block {...rowBlockProps} flexDirection="column">
      <Block {...rowBlockProps}>
        <Label2 marginRight={'1rem'} width="25%">
          Lovkode data
        </Label2>
      </Block>
      <Field name="data">
        {({ field, form }: FieldProps<TemaCodeData, CodeListFormValues>) => {
          const data = field.value

          const set = (val: Partial<TemaCodeData>) => {
            form.setFieldValue('data', { ...data, ...val })
          }
          return (
            <>
              <Block {...rowBlockProps}>
                <Label2 marginRight={'1rem'} width="25%">
                  Bilde:
                  <StatefulTooltip content={<PreviewImages set={(image) => set({ image })} />}>
                    <Block display="inline" marginLeft={theme.sizing.scale600}>
                      <FontAwesomeIcon color={theme.colors.primary400} icon={faQuestionCircle} />
                    </Block>
                  </StatefulTooltip>
                </Label2>
                <CustomizedSelect
                  options={temaBildeOptions}
                  clearable={false}
                  value={temaBildeOptions.filter((o) => o.id === data.image)}
                  onChange={(s) => {
                    const image = s.option?.id as string
                    return set({ image })
                  }}
                />
              </Block>
              <Block {...rowBlockProps}>
                <Label2 marginRight={'1rem'} width="25%">
                  Short Desciption:
                </Label2>
                <CustomizedTextarea
                  type="input"
                  size={InputSIZE.default}
                  value={data.shortDesciption}
                  onChange={(str) => set({ shortDesciption: (str.target as HTMLInputElement).value })}
                />
              </Block>
              <Error fieldName="data.shortDesciption" />
            </>
          )
        }}
      </Field>
    </Block>
  )
}

const PreviewImages = (props: { set: (key: string) => void }) => {
  return (
    <Block display="flex" flexDirection="column" height="80vh" overflow={'scrollY'}>
      {Object.keys(temaBilder).map((key) => (
        <Button type="button" kind="tertiary" onClick={() => props.set(key)}>
          <Block key={key} marginBottom={theme.sizing.scale600}>
            <Block>{key}</Block>
            <Block>
              <img src={temaBilder[key]} alt={'preview' + key} width={'400px'} />
            </Block>
          </Block>
        </Button>
      ))}
    </Block>
  )
}
