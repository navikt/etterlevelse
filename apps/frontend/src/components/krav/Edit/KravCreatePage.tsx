import { Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createKrav, kravMapToFormVal } from '../../../api/KravApi'
import { EKravStatus, TKravQL } from '../../../constants'
import { kravBreadCrumbPath } from '../../../pages/util/BreadCrumbPath'
import { EListName, codelist } from '../../../services/Codelist'
import { ScrollToFieldError } from '../../../util/formikUtils'
import ErrorModal from '../../ErrorModal'
import { TextAreaField } from '../../common/Inputs'
import { PageLayout } from '../../scaffold/Page'
import { kravCreateValidation } from './KravSchemaValidation'
import { KravFormFields } from './components/KravFormFields'
import { KravStandardButtons } from './components/KravStandardButtons'

export const KravCreatePage = () => {
  const [loading, setLoading] = useState(false)
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>([])
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')

  const navigate = useNavigate()

  const submit = (krav: TKravQL) => {
    setLoading(true)
    const regelverk = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov.code)
    const underavdeling = codelist.getCode(EListName.UNDERAVDELING, regelverk?.data?.underavdeling)

    const mutatedKrav = {
      ...krav,
      underavdeling: underavdeling,
    }

    createKrav(mutatedKrav)
      .then((krav) => {
        setLoading(false)
        navigate('/krav/' + krav.id)
      })
      .catch((e) => setErrorModalMessage(e))
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

                <div className="button_container flex flex-col py-4 px-4 sticky mt-5 bottom-0 border-t-2 z-10 bg-bg-default">
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
              <ScrollToFieldError />
            </Form>
          )}
        </Formik>
      )}
    </PageLayout>
  )
}
