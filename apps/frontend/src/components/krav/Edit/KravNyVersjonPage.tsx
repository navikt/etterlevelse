import { Alert, Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TKravIdParams, createKrav, kravMapToFormVal } from '../../../api/KravApi'
import { GetKravData, IKravDataProps, TKravById } from '../../../api/KravEditApi'
import { EKravStatus, IKrav, TKravQL } from '../../../constants'
import { kravBreadCrumbPath } from '../../../pages/util/BreadCrumbPath'
import { EListName, codelist } from '../../../services/Codelist'
import { ScrollToFieldError } from '../../../util/formikUtils'
import { TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import { PageLayout } from '../../scaffold/Page'
import { kravNewVersionValidation } from './KravSchemaValidation'
import { KravFormFields } from './components/KravFormFields'
import { KravStandardButtons } from './components/KravStandardButtons'

export const KravNyVersjonPage = () => {
  const params: Readonly<Partial<TKravIdParams>> = useParams<TKravIdParams>()
  const kravData: IKravDataProps | undefined = GetKravData(params)

  const kravQuery: TKravById | undefined = kravData?.kravQuery
  const kravLoading: boolean | undefined = kravData?.kravLoading

  const navigate = useNavigate()
  const [krav, setKrav] = useState<TKravQL | undefined>()
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>(
    krav?.varselMelding ? ['VarselMelding'] : []
  )

  const submit = async (krav: TKravQL): Promise<void> => {
    const regelverk = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov.code)
    const underavdeling = codelist.getCode(EListName.UNDERAVDELING, regelverk?.data?.underavdeling)
    const mutatedKrav = {
      ...krav,
      underavdeling: underavdeling,
      varselMelding: varselMeldingActive ? krav.varselMelding : undefined,
    }
    close(await createKrav(mutatedKrav))
    setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
  }

  const close = (k: IKrav): void => {
    if (k) {
      navigate(`/krav/${k.kravNummer}/${k.kravVersjon}`)
    }
  }

  useEffect(() => {
    if (kravQuery?.kravById)
      setKrav({
        ...kravQuery.kravById,
        id: '',
        kravVersjon: kravQuery.kravById.kravVersjon + 1,
        nyKravVersjon: true,
        status: EKravStatus.UTKAST,
      })
  }, [kravQuery])

  return (
    <>
      {krav && (
        <PageLayout
          pageTitle="Rediger krav"
          currentPage="Rediger krav"
          breadcrumbPaths={[kravBreadCrumbPath]}
          key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon}
        >
          {kravLoading && (
            <div className="w-full flex items-center flex-col">
              <Loader size="3xlarge" />{' '}
            </div>
          )}

          <div>
            <Formik
              initialValues={kravMapToFormVal({ ...krav, versjonEndringer: '' })}
              onSubmit={submit}
              validationSchema={kravNewVersionValidation()}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ values, errors, isSubmitting, submitForm }) => (
                <Form>
                  <div>
                    <div className="w-full">
                      <Heading level="1" size="medium">
                        Ny versjon
                      </Heading>
                      <Heading level="2" size="small">
                        {`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}{' '}
                      </Heading>
                      <Alert variant="warning">
                        <Heading spacing size="small" level="4">
                          Sikker på at du vil opprette en ny versjon?
                        </Heading>
                        Ny versjon av kravet skal opprettes når det er{' '}
                        <strong>vesentlige endringer</strong> i kravet som gjør at{' '}
                        <strong>teamene må revurdere</strong> sin besvarelse av kravet. Ved alle
                        mindre justeringer, endre i det aktive kravet, og da slipper teamene å
                        revurdere sin besvarelse.
                      </Alert>
                    </div>

                    <KravFormFields
                      mode="edit"
                      kravVersjon={values.kravVersjon}
                      errors={errors}
                      varselMeldingActive={varselMeldingActive}
                      setVarselMeldingActive={setVarselMeldingActive}
                    />

                    <div className="button_container flex flex-col mt-5 py-4 px-4 sticky bottom-0 border-t-2 z-10 bg-bg-default">
                      {errors.status && (
                        <div className="mb-3">
                          <FormError fieldName="status" />
                        </div>
                      )}

                      <div className="flex w-full">
                        <KravStandardButtons
                          submitCancelButton={() => {
                            navigate(`/krav/${krav.kravNummer}/${krav.kravVersjon - 1}`)
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
                    <div className="py-12">
                      <TextAreaField
                        label="Notater (Kun synlig for kraveier)"
                        name="notat"
                        height="15.625rem"
                        markdown
                      />
                    </div>
                  </div>
                  <ScrollToFieldError />
                </Form>
              )}
            </Formik>
          </div>
        </PageLayout>
      )}
    </>
  )
}
