import { ErrorSummary } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import _ from 'lodash'
import { ISuksesskriterieBegrunnelse } from '../../../constants'

interface IProps {
  errors: FormikErrors<ISuksesskriterieBegrunnelse>[]
}

export const SuksesskriterieErrorFields = (props: IProps) => {
  const { errors } = props

  return (
    <>
      {errors.map((error, index) => {
        if (!_.isEmpty(error)) {
          return (
            <div key={'suksesskrietier_error_' + index}>
              {error.begrunnelse && (
                <ErrorSummary.Item href={'#begrunnelse_' + index}>
                  {error.begrunnelse}
                </ErrorSummary.Item>
              )}
              {error.suksesskriterieStatus && (
                <ErrorSummary.Item href={'#suksesskriterieStatus_' + index}>
                  {error.suksesskriterieStatus}
                </ErrorSummary.Item>
              )}
            </div>
          )
        }
      })}
    </>
  )
}
export default SuksesskriterieErrorFields
