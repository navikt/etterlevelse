'use client'

import { createKrav, kravMapToFormVal } from '@/api/krav/kravApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { ContentLayout } from '@/components/others/layout/content/content'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EListName, ICode, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, IKrav, TKravQL } from '@/constants/krav/kravConstants'
import { codelist } from '@/provider/kodeverk/kodeverkService'
import { kravNummerUrl, kravlisteUrl } from '@/routes/krav/kravRoutes'
import { kravCreateValidation } from '@/test/krav/schemaValidation/kravSchemaValidation'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { KravFormFields } from '../edit/kravFormFields/kravFormFields'
import { KravStandardButtons } from '../edit/kravStandardButtons/kravStandardButtons'
import ErrorModal from '../kravEditPage/errorModal/errorModal'

export const KravCreatePage = () => {
  const router: AppRouterInstance = useRouter()

  const [loading, setLoading] = useState(false)
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>([])
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')

  const submit = (krav: TKravQL): void => {
    setLoading(true)
    const regelverk: TLovCode = codelist.getCode(
      EListName.LOV,
      krav.regelverk[0]?.lov.code
    ) as TLovCode
    const underavdeling: ICode = codelist.getCode(
      EListName.UNDERAVDELING,
      regelverk?.data?.underavdeling
    ) as ICode
    const mutatedKrav: TKravQL = {
      ...krav,
      underavdeling: underavdeling,
    }
    createKrav(mutatedKrav)
      .then((krav: IKrav) => {
        setLoading(false)
        router.push(kravNummerUrl(krav.id))
      })
      .catch((error: any) => setErrorModalMessage(error))
  }

  return (
    <PageLayout
      pageTitle='Opprett nytt krav'
      currentPage='Opprett nytt krav'
      breadcrumbPaths={[kravBreadCrumbPath]}
    >
      {loading && (
        <div className='w-full flex items-center flex-col'>
          <Heading level='1' size='medium'>
            Oppretter nytt krav. Du vil bli sendt til kravet når det er opprettet
          </Heading>
          <Loader size='3xlarge' />
        </div>
      )}

      {!loading && (
        <Formik
          onSubmit={submit}
          initialValues={kravMapToFormVal({})}
          validationSchema={kravCreateValidation()}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ values, errors, isSubmitting, submitForm }) => (
            <Form>
              <Heading className='mb-6' level='1' size='medium'>
                Opprett nytt krav
              </Heading>
              <div>
                <KravFormFields
                  mode='create'
                  kravVersjon={values.kravVersjon}
                  errors={errors}
                  varselMeldingActive={varselMeldingActive}
                  setVarselMeldingActive={setVarselMeldingActive}
                />

                <div className='button_container flex flex-col py-4 px-4 sticky mt-5 bottom-0 border-t-2 z-10 bg-white'>
                  <ContentLayout>
                    <KravStandardButtons
                      submitCancelButton={() => {
                        router.push(kravlisteUrl)
                      }}
                      submitSaveButton={() => {
                        values.status = EKravStatus.UTKAST
                        submitForm()
                      }}
                      createMode
                      kravStatus={values.status}
                      submitAktivButton={() => {
                        values.status = EKravStatus.AKTIV
                        submitForm()
                      }}
                      isSubmitting={isSubmitting}
                    />
                  </ContentLayout>
                </div>

                <div className=' py-12'>
                  <TextAreaField
                    label='Notater (Kun synlig for kraveier)'
                    name='notat'
                    height='15.625rem'
                    markdown
                  />
                </div>
              </div>

              <ErrorModal
                isOpen={showErrorModal}
                errorMessage={errorModalMessage}
                submit={setShowErrorModal}
              />
            </Form>
          )}
        </Formik>
      )}
    </PageLayout>
  )
}
