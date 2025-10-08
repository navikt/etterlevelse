import { ISuksesskriterieBegrunnelse } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { ErrorSummary } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import _ from 'lodash'
import { Fragment, FunctionComponent } from 'react'

type TProps = {
  errors: FormikErrors<ISuksesskriterieBegrunnelse>[]
}

export const SuksesskriterieErrorFields: FunctionComponent<TProps> = ({ errors }) => {
  return (
    <>
      {errors.map((error, index) => {
        if (!_.isEmpty(error)) {
          return (
            <Fragment key={'suksesskrietier_error_' + index}>
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
            </Fragment>
          )
        }
      })}
    </>
  )
}
export default SuksesskriterieErrorFields
