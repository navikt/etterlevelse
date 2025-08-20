import { kravMapToFormVal } from '@/api/krav/kravApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IKravDataProps } from '@/constants/krav/edit/kravEditConstant'
import { IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { kravEditValidation } from '@/test/validation/kravEditValidation'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { FunctionComponent, useState } from 'react'

type TProps = {
  krav: TKravQL | undefined
  kravData: IKravDataProps | undefined
}

export const KravEdit: FunctionComponent<TProps> = ({ krav, kravData }) => {
  const [isEditingUtgaattKrav, setIsEditingUtgaattKrav] = useState<boolean>(false)
  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])

  const kravLoading: boolean | undefined = kravData?.kravLoading

  const submit = async (krav: TKravQL): Promise<void> => {}

  return (
    <PageLayout
      pageTitle='Rediger krav'
      currentPage='Rediger krav'
      breadcrumbPaths={[kravBreadCrumbPath]}
      key={`K${krav?.kravNummer}${krav?.kravVersjon}`}
    >
      {kravLoading && (
        <div className='w-full flex items-center flex-col'>
          <Loader size='3xlarge' />
        </div>
      )}

      {!kravLoading && (
        <div>
          <Formik
            initialValues={kravMapToFormVal(krav as TKravQL)}
            onSubmit={submit}
            validationSchema={kravEditValidation({ alleKravVersjoner, isEditingUtgaattKrav })}
            validateOnChange={false}
            validateOnBlur={false}
          >
            <Form></Form>
          </Formik>
        </div>
      )}
    </PageLayout>
  )
}
