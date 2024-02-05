import { FormikErrors, useFormikContext } from 'formik'
import { useEffect } from 'react'

const getFieldErrorNames = (formikErrors: FormikErrors<any>) => {
  const transformObjectToDotNotation = (obj: any, prefix = '', result: string[] = []) => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key]
      if (!value) return

      const nextKey = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'object') {
        transformObjectToDotNotation(value, nextKey, result)
      } else {
        result.push(nextKey)
      }
    })

    return result
  }

  return transformObjectToDotNotation(formikErrors)
}

export const ScrollToFieldError = () => {
  const { submitCount, isValid, errors } = useFormikContext()

  useEffect(() => {
    if (isValid) return

    const fieldErrorNames: string[] = getFieldErrorNames(errors)
    if (fieldErrorNames.length <= 0) return

    const element = document.querySelector(`#${fieldErrorNames[0]}`)
    if (!element) return

    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [submitCount, errors])

  return null
}
