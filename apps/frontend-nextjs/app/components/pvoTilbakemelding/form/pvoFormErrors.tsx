import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { ErrorSummary } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject } from 'react'

type TProps = {
  errors: FormikErrors<IVurdering>
  errorSummaryRef: RefObject<HTMLDivElement | null>
}

export const PvoFormErrors: FunctionComponent<TProps> = ({ errors, errorSummaryRef }) => {
  const getErrorMessage = (key: string, error: string) => {
    if (key === 'pvoVurdering') {
      return 'Dere må oppgi en vurdering'
    } else {
      return error
    }
  }

  return (
    <>
      {!_.isEmpty(errors) && (
        <ErrorSummary
          ref={errorSummaryRef}
          heading='Dere må rette disse feilene før du kan fortsette'
          className='my-5'
        >
          {Object.entries(errors)
            .filter(([, error]) => error)
            .map(([key, error]) => (
              <ErrorSummary.Item href={`#${key}`} key={key} className='max-w-[75ch]'>
                {getErrorMessage(key, error as string)}
              </ErrorSummary.Item>
            ))}
        </ErrorSummary>
      )}
    </>
  )
}
export default PvoFormErrors
