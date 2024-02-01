import { Label, Select, TextField, Textarea } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import {
  EListName,
  ICodeListFormValues,
  ILovCodeData,
  ITemaCodeData,
  codelist,
  lovCodeRelevansToOptions,
} from '../../../services/Codelist'
import { temaBilder } from '../../Images'
import { OptionList } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'

export const LovCodeDataForm = () => (
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
            <TextField
              value={data.lovId}
              onChange={(e) => set({ lovId: e.target.value })}
              className="w-full mt-4"
              label="Lov ID"
            />

            <div className="w-full mt-4">
              <Label>Underavdeling</Label>
              <div className="mt-1.5">
                <OptionList
                  listName={EListName.UNDERAVDELING}
                  value={codelist.getCode(EListName.UNDERAVDELING, data.underavdeling)?.code}
                  onChange={(val) => set({ underavdeling: val.code })}
                  label="underavdeling"
                />
              </div>
            </div>

            <div className="w-full mt-4">
              <Label>Tema</Label>
              <div className="mt-1.5">
                <OptionList
                  listName={EListName.TEMA}
                  value={codelist.getCode(EListName.TEMA, data.tema)?.code}
                  onChange={(val) => set({ tema: val.code })}
                  label="tema"
                />
              </div>
            </div>

            <div className="w-full mt-4">
              <Label>Relevant for</Label>
              <div className="mt-1.5">
                <OptionList
                  options={lovCodeRelevansToOptions()}
                  value={data.relevantFor ? data.relevantFor : undefined}
                  onChange={(val) => set({ relevantFor: val })}
                  label="relevant for"
                />
              </div>
            </div>
          </>
        )
      }}
    </Field>
  </div>
)

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
              <div className="w-full mt-4">
                <Label className="mr-4 w-1/4">Bilde</Label>
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
              <Textarea
                label="Kort beskrivelse"
                className="w-full mt-4"
                value={data.shortDesciption}
                onChange={(str) =>
                  set({ shortDesciption: (str.target as HTMLTextAreaElement).value })
                }
              />
              <FormError fieldName="data.shortDesciption" />
            </>
          )
        }}
      </Field>
    </div>
  )
}
