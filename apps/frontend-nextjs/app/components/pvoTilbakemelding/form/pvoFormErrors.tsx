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

  // Sort errors by the top-to-bottom position of their corresponding form field
  const sortByFieldPosition = (a: [string, unknown], b: [string, unknown]) => {
    const [keyA] = a
    const [keyB] = b
    const elementA = typeof document !== 'undefined' ? document.getElementById(keyA) : null
    const elementB = typeof document !== 'undefined' ? document.getElementById(keyB) : null

    // If one element is missing, keep stable ordering for existing ones
    if (elementA && !elementB) return -1
    if (!elementA && elementB) return 1
    if (!elementA && !elementB) return 0

    const rectA = elementA!.getBoundingClientRect()
    const rectB = elementB!.getBoundingClientRect()

    // First sort by Y (top), then by X (left) as a tiebreaker
    if (rectA.top !== rectB.top) return rectA.top - rectB.top
    return rectA.left - rectB.left
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
            .sort(sortByFieldPosition)
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
