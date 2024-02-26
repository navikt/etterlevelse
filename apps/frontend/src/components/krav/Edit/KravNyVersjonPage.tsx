import { Alert, Button, Checkbox, CheckboxGroup, Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TKravIdParams, createKrav, kravMapToFormVal } from '../../../api/KravApi'
import { GetKravData, IKravDataProps, TKravById } from '../../../api/KravEditApi'
import { EKravStatus, IKrav, TKravQL } from '../../../constants'
import { EListName, codelist } from '../../../services/Codelist'
import { ScrollToFieldError } from '../../../util/formikUtils'
import { IBreadcrumbPaths } from '../../common/CustomizedBreadcrumbs'
import { InputField, TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import { PageLayout } from '../../scaffold/Page'
import { EditKravMultiOptionField } from './EditKravMultiOptionField'
import { EditKravRelasjoner } from './EditKravRelasjoner'
import { EditBegreper } from './KravBegreperEdit'
import { kravNewVersionValidation } from './KravSchemaValidation'
import { KravSuksesskriterierEdit } from './KravSuksesskriterieEdit'
import { KravVarslingsadresserEdit } from './KravVarslingsadresserEdit'
import { RegelverkEdit } from './RegelverkEdit'
import { KravEditDokumentasjon } from './components/KravEditDokumentasjon'

const kravBreadCrumbPath: IBreadcrumbPaths = {
  href: '/kravliste',
  pathName: 'Forvalte og opprette krav',
}

const maxInputWidth = '400px'

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
                    <div className="mt-5 mb-10">
                      <InputField marginBottom label="Krav navn" name="navn" />
                      <div className="mb-10">
                        <CheckboxGroup
                          legend="Send varselmelding"
                          value={varselMeldingActive}
                          onChange={(value) => {
                            setVarselMeldingActive(value)
                          }}
                        >
                          <Checkbox value="VarselMelding">
                            Gi kravet en varselmelding (eks. for kommende krav)
                          </Checkbox>
                        </CheckboxGroup>

                        {varselMeldingActive.length > 0 && (
                          <div className="w-full ml-8 mt-6">
                            <TextAreaField
                              label="Forklaring til etterlevere"
                              name="varselMelding"
                              maxCharacter={100}
                              rows={2}
                              noPlaceholder
                            />
                          </div>
                        )}
                      </div>
                      <TextAreaField label="Hensikt" name="hensikt" height="250px" markdown />
                    </div>

                    <div className="flex w-full justify-center">
                      <div className="w-full mb-2.5">
                        <div className="mb-10" id="suksesskriterier">
                          <Heading level="3" size="medium" className="mb-2">
                            Suksesskriterier
                          </Heading>
                          <KravSuksesskriterierEdit newVersion={true} />
                        </div>

                        <KravEditDokumentasjon maxInputWidth={maxInputWidth} />

                        <RegelverkEdit />
                        <div id="versjonEndringer" className="w-full">
                          <TextAreaField
                            label="Endringer siden siste versjon"
                            name="versjonEndringer"
                            height="250px"
                            markdown
                          />
                        </div>

                        <div className="mt-20">
                          <Heading level="3" size="medium">
                            Gruppering
                          </Heading>
                        </div>

                        <div className="w-full max-w-md">
                          <EditKravMultiOptionField
                            marginBottom
                            name="relevansFor"
                            label="Legg til relevante kategorier"
                            listName={EListName.RELEVANS}
                            tooltip="Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n"
                          />
                        </div>

                        <div className="w-full mb-20 max-w-md">
                          <EditBegreper />
                        </div>

                        <div className="w-full mb-20 max-w-md">
                          <EditKravRelasjoner />
                        </div>

                        <div className="mb-8">
                          <Heading level="3" size="medium">
                            Egenskaper
                          </Heading>
                        </div>
                        <div id="varslingsadresser" className="w-full">
                          <KravVarslingsadresserEdit />
                        </div>

                        <FormError fieldName="varslingsadresser" akselStyling />

                        <div className="w-full">
                          {Object.keys(errors).length > 0 && !errors.dokumentasjon && (
                            <div className="flex w-full my-12">
                              <div className="w-full bg-red-300">
                                <Alert variant="warning" role="status">
                                  Du må fylle ut alle obligatoriske felter
                                </Alert>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="button_container flex flex-col mt-5 py-4 px-4 sticky bottom-0 border-t-2 z-10 bg-bg-default">
                      {errors.status && (
                        <div className="mb-3">
                          <FormError fieldName="status" />
                        </div>
                      )}

                      <div className="flex w-full">
                        <div className="flex w-full justify-end">
                          <Button
                            className="ml-4"
                            variant="secondary"
                            type="button"
                            onClick={() => {
                              if (krav.kravNummer && krav.kravVersjon) {
                                navigate(`/krav/${krav.kravNummer}/${krav.kravVersjon - 1}`)
                              } else {
                                navigate('/kravliste')
                              }
                            }}
                          >
                            Avbryt
                          </Button>

                          <Button
                            className="ml-4"
                            variant="primary"
                            onClick={() => {
                              values.status = EKravStatus.UTKAST
                              submitForm()
                            }}
                            disabled={isSubmitting}
                          >
                            Lagre
                          </Button>

                          <Button
                            type="button"
                            className="ml-4"
                            variant="primary"
                            onClick={() => {
                              values.status = EKravStatus.AKTIV
                              submitForm()
                            }}
                            disabled={isSubmitting}
                          >
                            Publiser og gjør aktiv
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="py-12">
                      <TextAreaField
                        label="Notater (Kun synlig for kraveier)"
                        name="notat"
                        height="250px"
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
