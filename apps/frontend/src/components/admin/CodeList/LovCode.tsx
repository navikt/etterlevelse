import { Label, TextField } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import {
  EListName,
  ICodeListFormValues,
  ILovCodeData,
  lovCodeRelevansToOptions,
} from '../../../services/Codelist'
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
        const codeListDataErrors = form.errors.data as ILovCodeData
        const set = (val: Partial<ILovCodeData>) => {
          form.setFieldValue('data', { ...data, ...val })
        }

        return (
          <>
            <TextField
              value={data.lovId}
              onChange={(e) => set({ lovId: e.target.value })}
              className="w-full mt-4"
              label="Lov ID"
              error={
                codeListDataErrors && codeListDataErrors.lovId ? (
                  <FormError fieldName="data.lovId" />
                ) : undefined
              }
            />

            <div className="w-full mt-4">
              <Label>Underavdeling</Label>
              <div className="mt-1.5">
                <OptionList
                  listName={EListName.UNDERAVDELING}
                  value={data.underavdeling as string}
                  onChange={(val) => set({ underavdeling: val.code })}
                  label="underavdeling"
                  error={
                    codeListDataErrors && codeListDataErrors.underavdeling ? (
                      <FormError fieldName="data.underavdeling" />
                    ) : undefined
                  }
                />
              </div>
            </div>

            <div className="w-full mt-4">
              <Label>Tema</Label>
              <div className="mt-1.5">
                <OptionList
                  listName={EListName.TEMA}
                  value={data.tema as string}
                  onChange={(val) => set({ tema: val.code })}
                  label="tema"
                  error={
                    codeListDataErrors && codeListDataErrors.tema ? (
                      <FormError fieldName="data.tema" />
                    ) : undefined
                  }
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
