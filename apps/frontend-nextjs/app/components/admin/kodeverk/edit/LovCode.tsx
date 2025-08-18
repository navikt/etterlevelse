import { OptionList } from '@/components/common/inputs'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import {
  EListName,
  ICodeListFormValues,
  ILovCodeData,
} from '@/constants/kodeverk/kodeverkConstants'
import { Label, TextField } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'

export const LovCodeDataForm = () => (
  <div className='flex w-full mt-4 items-center flex-col'>
    <div className='flex w-full mt-4 items-center'>
      <Label className='mr-4 w-1/4'>Lovkode data</Label>
    </div>
    <Field name='data'>
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
              className='w-full mt-4'
              label='Lov ID'
              error={
                codeListDataErrors && codeListDataErrors.lovId ? (
                  <FormError fieldName='data.lovId' />
                ) : undefined
              }
            />

            <div className='w-full mt-4'>
              <Label>Underavdeling</Label>
              <div className='mt-1.5'>
                <OptionList
                  listName={EListName.UNDERAVDELING}
                  value={data.underavdeling as string}
                  onChange={(val) => set({ underavdeling: val.code })}
                  label='underavdeling'
                  error={
                    codeListDataErrors && codeListDataErrors.underavdeling ? (
                      <FormError fieldName='data.underavdeling' />
                    ) : undefined
                  }
                />
              </div>
            </div>

            <div className='w-full mt-4'>
              <Label>Tema</Label>
              <div className='mt-1.5'>
                <OptionList
                  listName={EListName.TEMA}
                  value={data.tema as string}
                  onChange={(val) => set({ tema: val.code })}
                  label='tema'
                  error={
                    codeListDataErrors && codeListDataErrors.tema ? (
                      <FormError fieldName='data.tema' />
                    ) : undefined
                  }
                />
              </div>
            </div>
          </>
        )
      }}
    </Field>
  </div>
)
