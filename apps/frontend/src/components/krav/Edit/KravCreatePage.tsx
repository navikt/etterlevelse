import { Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { createKrav, kravMapToFormVal } from '../../../api/KravApi'
import { EKravStatus, IKrav, TKravQL } from '../../../constants'
import { kravBreadCrumbPath } from '../../../pages/util/BreadCrumbPath'
import { CodelistService, EListName, ICode, TLovCode } from '../../../services/Codelist'
import ErrorModal from '../../ErrorModal'
import { TextAreaField } from '../../common/Inputs'
import { PageLayout } from '../../scaffold/Page'
import { kravCreateValidation } from './KravSchemaValidation'
import { KravFormFields } from './components/KravFormFields'
import { KravStandardButtons } from './components/KravStandardButtons'

export const KravCreatePage = () => {
  const navigate: NavigateFunction = useNavigate()
  const [loading, setLoading] = useState(false)
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>([])
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const [codelistUtils] = CodelistService()

  const submit = (krav: TKravQL): void => {
    setLoading(true)
    const regelverk: TLovCode = codelistUtils.getCode(
      EListName.LOV,
      krav.regelverk[0]?.lov.code
    ) as TLovCode
    const underavdeling: ICode = codelistUtils.getCode(
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
        navigate('/krav/' + krav.id)
      })
      .catch((error: any) => setErrorModalMessage(error))
  }

  return (
    <PageLayout
      pageTitle="Opprett ny krav"
      currentPage="Opprett ny krav"
      breadcrumbPaths={[kravBreadCrumbPath]}
    >
      {loading && (
        <div className="w-full flex items-center flex-col">
          <Heading level="1" size="medium">
            Oppretter nytt krav. Du vil bli sendt til kravet når det er opprettet
          </Heading>
          <Loader size="3xlarge" />
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
              <Heading className="mb-6" level="1" size="medium">
                Opprett nytt krav
              </Heading>

              <div>
                <KravFormFields
                  mode="create"
                  kravVersjon={values.kravVersjon}
                  errors={errors}
                  varselMeldingActive={varselMeldingActive}
                  setVarselMeldingActive={setVarselMeldingActive}
                />

                <div className="button_container flex flex-col py-4 px-4 sticky mt-5 bottom-0 border-t-2 z-10 bg-white">
                  <div className="flex w-full">
                    <KravStandardButtons
                      submitCancelButton={() => {
                        navigate('/kravliste')
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
                  </div>
                </div>

                <div className=" py-12">
                  <TextAreaField
                    label="Notater (Kun synlig for kraveier)"
                    name="notat"
                    height="15.625rem"
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
