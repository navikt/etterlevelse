import { Label, Select, TextField, Textarea } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import {
  ICodeListFormValues,
  ILovCodeData,
  ITemaCodeData,
  ListName,
  codelist,
  lovCodeRelevansToOptions,
} from '../../../services/Codelist'
import { temaBilder } from '../../Images'
import { OptionList } from '../../common/Inputs'
import { Error } from '../../common/ModalSchema'

export const LovCodeDataForm = () => {
  return (
    <div className="flex w-full mt-4 items-center flex-col">
      <div className="flex w-full mt-4 items-center">
        <Label className="mr-4 w-1/4">Lovkode data</Label>
      </div>
      <Field name="data">
        {({ field, form }: FieldProps<ILovCodeData, ICodeListFormValues>) => {
          const data = field.value

          const set = (val: Partial<ILovCodeData>) => {
            form.setFieldValue('data', { ...data, ...val })
          }

          // Migrate old
          if (!data.lovId && form.values.description) {
            set({ lovId: form.values.description })
          }

          return (
            <>
              <div className="flex w-full mt-4 items-center">
                <Label className="mr-4 w-1/4">Lov ID:</Label>
                <TextField
                  value={data.lovId}
                  onChange={(e) => set({ lovId: e.target.value })}
                  className="w-full"
                  label="Lov ID"
                  hideLabel
                />
              </div>

              <div className="flex w-full mt-4 items-center">
                <Label className="mr-1.5 w-1/4">Underavdeling:</Label>
                <OptionList
                  listName={ListName.UNDERAVDELING}
                  value={codelist.getCode(ListName.UNDERAVDELING, data.underavdeling)?.code}
                  onChange={(val) => set({ underavdeling: val.code })}
                  label={'underavdeling'}
                />
              </div>

              <div className="flex w-full mt-4 items-center">
                <Label className="mr-4 w-1/4">Tema:</Label>
                <OptionList
                  listName={ListName.TEMA}
                  value={codelist.getCode(ListName.TEMA, data.tema)?.code}
                  onChange={(val) => set({ tema: val.code })}
                  label={'tema'}
                />
              </div>

              <div className="flex w-full mt-4 items-center">
                <Label className="mr-4 w-1/4">Relevant for:</Label>
                <OptionList
                  options={lovCodeRelevansToOptions()}
                  value={data.relevantFor ? data.relevantFor : undefined}
                  onChange={(val) => set({ relevantFor: val })}
                  label={'relevant for'}
                />
              </div>
            </>
          )
        }}
      </Field>
    </div>
  )
}

export const TemaCodeDataForm = () => {
  const temaBildeOptions = Object.keys(temaBilder).map((id) => ({
    id,
    label: id,
    bilde: temaBilder[id],
  }))

  return (
    <div className="flex w-full mt-4 items-center flex-col">
      <div className="flex w-full mt-4 items-center">
        <Label className="mr-4 w-1/4">Temakode data</Label>
      </div>
      <Field name="data">
        {({ field, form }: FieldProps<ITemaCodeData, ICodeListFormValues>) => {
          const data = field.value

          const set = (val: Partial<ITemaCodeData>) => {
            form.setFieldValue('data', { ...data, ...val })
          }
          return (
            <>
              <div className="flex w-full mt-4 items-center">
                <Label className="mr-4 w-1/4">Bilde:</Label>
                <Select
                  className="w-full"
                  label="Bilde"
                  hideLabel
                  value={data.image}
                  onChange={(e) => {
                    const image = e.target.value
                    return set({ image })
                  }}
                >
                  <option value="">Velg bilde</option>
                  {temaBildeOptions.map((t, i) => (
                    <option key={i + '_' + t.label} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex w-full mt-4 items-center">
                <Label className="mr-4 w-1/4">Short Desciption:</Label>
                <Textarea
                  label="Short Desciption"
                  className="w-full"
                  hideLabel
                  value={data.shortDesciption}
                  onChange={(str) =>
                    set({ shortDesciption: (str.target as HTMLTextAreaElement).value })
                  }
                />
              </div>
              <Error fieldName="data.shortDesciption" />
            </>
          )
        }}
      </Field>
    </div>
  )
}
