import { useQuery } from '@apollo/client'
import {
  Alert,
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  Loader,
  Modal,
} from '@navikt/ds-react'
import { Form, Formik, FormikProps } from 'formik'
import _ from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  TKravId as KravIdQueryVariables,
  TKravIdParams,
  getKravByKravNumberAndVersion,
  getKravByKravNummer,
  kravMapToFormVal,
  updateKrav,
} from '../../../api/KravApi'
import { EKravStatus, IKravId, IKravVersjon, TKravQL } from '../../../constants'
import { getKravWithEtterlevelseQuery } from '../../../query/KravQuery'
import { EListName, TTemaCode, codelist } from '../../../services/Codelist'
import { user } from '../../../services/User'
import ErrorModal from '../../ErrorModal'
import { IBreadcrumbPaths } from '../../common/CustomizedBreadcrumbs'
import { InputField, MultiInputField, TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import { PageLayout } from '../../scaffold/Page'
import { EditKravMultiOptionField } from './EditKravMultiOptionField'
import { EditKravRelasjoner } from './EditKravRelasjoner'
import { EditBegreper } from './KravBegreperEdit'
import { KravSuksesskriterierEdit } from './KravSuksesskriterieEdit'
import { KravVarslingsadresserEdit } from './KravVarslingsadresserEdit'
import { RegelverkEdit } from './RegelverkEdit'

const kravBreadCrumbPath: IBreadcrumbPaths = {
  href: '/krav/redigering',
  pathName: 'Forvalte og opprette krav',
}

const maxInputWidth = '400px'
const modalWidth = '1276px'

const getQueryVariableFromParams = (params: Readonly<Partial<TKravIdParams>>) => {
  console.log('getQueryVariableFromParams', params)

  if (params.id) {
    console.log('params.id', params.id)

    return { id: params.id }
  } else if (params.kravNummer && params.kravVersjon) {
    return {
      kravNummer: parseInt(params.kravNummer),
      kravVersjon: parseInt(params.kravVersjon),
    }
  } else {
    return undefined
  }
}

export const KravEditPage = () => {
  const params = useParams<TKravIdParams>()
  const {
    loading: kravLoading,
    data: kravQuery,
    refetch: reloadKrav,
  } = useQuery<{ kravById: TKravQL }, KravIdQueryVariables>(getKravWithEtterlevelseQuery, {
    variables: getQueryVariableFromParams(params),
    skip: (!params.id || params.id === 'ny') && !params.kravNummer,
    fetchPolicy: 'no-cache',
  })
  console.log('params', params)

  const [krav, setKrav] = useState<TKravQL | undefined>()
  const [newKrav, setNewKrav] = useState<boolean>(false)
  const formRef = useRef<FormikProps<any>>()
  const [edit, setEdit] = useState(krav && !krav.id)
  const [kravId, setKravId] = useState<IKravId>()
  const [newVersionWarning, setNewVersionWarning] = useState<boolean>(false)
  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])

  const [stickyHeader, setStickyHeader] = useState(false)
  const [kravTema, setKravTema] = useState<TTemaCode>()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>(
    krav?.varselMelding ? ['VarselMelding'] : []
  )

  const [UtgaattKravMessage, setUtgaattKravMessage] = useState<boolean>(false)
  const [aktivKravMessage, setAktivKravMessage] = useState<boolean>(false)

  const submit = async (krav: TKravQL) => {
    //   setIsFormDirty(false)
    //   const regelverk = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov.code)
    //   const underavdeling = codelist.getCode(EListName.UNDERAVDELING, regelverk?.data?.underavdeling)
    //   const mutatedKrav = {
    //     ...krav,
    //     underavdeling: underavdeling,
    //     varselMelding: varselMeldingActive ? krav.varselMelding : undefined,
    //   }
    //   const etterlevelser = await getEtterlevelserByKravNumberKravVersion(
    //     krav.kravNummer,
    //     krav.kravVersjon
    //   )
    //   if (etterlevelser.totalElements > 0 && krav.status === EKravStatus.UTKAST && !newVersion) {
    //     setErrorModalMessage(
    //       'Kravet kan ikke settes til «Utkast» når det er tilknyttet dokumentasjon av etterlevelse'
    //     )
    //     setShowErrorModal(true)
    //   } else if (krav.id) {
    //     setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
    //   } else {
    //     setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
    //   }
  }

  // const kravSchema = () =>
  //   yup.object({
  //     navn: yup.string().required('Du må oppgi et navn til kravet'),
  //     suksesskriterier: yup.array().test({
  //       name: 'suksesskriterierCheck',
  //       message: EYupErrorMessage.PAAKREVD,
  //       test: function (suksesskriterier) {
  //         const { parent } = this
  //         if (parent.status === EKravStatus.AKTIV) {
  //           return suksesskriterier &&
  //             suksesskriterier.length > 0 &&
  //             suksesskriterier.every((s) => s.navn)
  //             ? true
  //             : false
  //         }
  //         return true
  //       },
  //     }),
  //     hensikt: yup.string().test({
  //       name: 'hensiktCheck',
  //       message: EYupErrorMessage.PAAKREVD,
  //       test: function (hensikt) {
  //         const { parent } = this
  //         if (parent.status === EKravStatus.AKTIV) {
  //           return hensikt ? true : false
  //         }
  //         return true
  //       },
  //     }),
  //     versjonEndringer: yup.string().test({
  //       name: 'versjonEndringerCheck',
  //       message: EYupErrorMessage.PAAKREVD,
  //       test: function (versjonEndringer) {
  //         const { parent } = this
  //         if (parent.status === EKravStatus.AKTIV) {
  //           if (!newKrav && krav.kravVersjon > 1) {
  //             return versjonEndringer ? true : false
  //           }
  //         }
  //         return true
  //       },
  //     }),
  //     regelverk: yup.array().test({
  //       name: 'regelverkCheck',
  //       message: EYupErrorMessage.PAAKREVD,
  //       test: function (regelverk) {
  //         const { parent } = this
  //         if (parent.status === EKravStatus.AKTIV) {
  //           return regelverk && regelverk.length > 0 ? true : false
  //         }
  //         return true
  //       },
  //     }),
  //     varslingsadresser: yup.array().test({
  //       name: 'varslingsadresserCheck',
  //       message: EYupErrorMessage.PAAKREVD,
  //       test: function (varslingsadresser) {
  //         const { parent } = this
  //         if (parent.status === EKravStatus.AKTIV) {
  //           return varslingsadresser && varslingsadresser.length > 0 ? true : false
  //         }
  //         return true
  //       },
  //     }),
  //     status: yup.string().test({
  //       name: 'statusCheck',
  //       message:
  //         'Det er ikke lov å sette versjonen til utgått. Det eksistere en aktiv versjon som er lavere enn denne versjonen',
  //       test: function (status) {
  //         const { parent } = this
  //         const nyesteAktivKravVersjon = alleKravVersjoner.filter(
  //           (k) => k.kravStatus === EKravStatus.AKTIV
  //         )
  //         if (
  //           status === EKravStatus.UTGAATT &&
  //           nyesteAktivKravVersjon.length >= 1 &&
  //           parent.kravVersjon > nyesteAktivKravVersjon[0].kravVersjon
  //         ) {
  //           return false
  //         }
  //         return true
  //       },
  //     }),
  //   })

  // const newVersion = () => {
  //   if (!krav) return
  //   setKravId({ id: krav.id, kravVersjon: krav.kravVersjon })
  //   setKrav({ ...krav, id: '', kravVersjon: krav.kravVersjon + 1, nyKravVersjon: true })
  //   setEdit(true)
  //   setNewVersionWarning(true)
  // }

  useEffect(() => {
    // hent krav på ny ved avbryt ny versjon
    if (!edit && !krav?.id && krav?.nyKravVersjon) reloadKrav()
  }, [edit])

  useEffect(() => {
    console.log('krav', krav)

    if (krav) {
      getKravByKravNummer(krav.kravNummer).then((resp) => {
        if (resp.content.length) {
          const alleVersjoner = resp.content
            .map((k) => {
              return { kravVersjon: k.kravVersjon, kravNummer: k.kravNummer, kravStatus: k.status }
            })
            .sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))

          const filteredVersjoner = alleVersjoner.filter((k) => k.kravStatus !== EKravStatus.UTKAST)

          if (filteredVersjoner.length) {
            setAlleKravVersjoner(filteredVersjoner)
          }
        }
      })
      const lovData = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov?.code)
      if (lovData?.data) {
        setKravTema(codelist.getCode(EListName.TEMA, lovData.data.tema))
      }
    }
  }, [krav])

  useEffect(() => {
    console.log('kravQuery efw', kravQuery)

    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  console.log('kravQuery', kravQuery)

  useEffect(() => {
    if (params.id === 'ny') {
      setKrav(kravMapToFormVal({}) as TKravQL)
      // setEdit(true)
      setNewKrav(true)
    }
  }, [params.id])

  // useEffect(() => {
  //   if (krav) {
  //     const lovData = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov?.code)
  //     if (lovData?.data) {
  //       setKravTema(codelist.getCode(EListName.TEMA, lovData.data.tema))
  //     }
  //   }
  // }, [krav])

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
              initialValues={
                !newKrav && newVersionWarning
                  ? kravMapToFormVal({ ...krav, versjonEndringer: '' })
                  : kravMapToFormVal(krav as TKravQL)
              }
              onSubmit={submit}
            >
              {({
                values,
                errors,
                isSubmitting,
                handleReset,
                submitForm,
                setErrors,
                initialValues,
              }) => (
                <Form
                  onChange={() => {
                    if (
                      !_.isEqual(initialValues, {
                        ...values,
                        suksesskriterier: values.suksesskriterier.map((s) => {
                          return { ...s, __typename: 'Suksesskriterie' }
                        }),
                      })
                    ) {
                      setIsFormDirty(true)
                    }
                  }}
                >
                  <div             >
                    {(
                      <div className="w-full">
                        <Heading level="1" size="medium" >
                          {newVersionWarning
                            ? 'Ny versjon'
                            : newKrav
                              ? 'Nytt krav'
                              : 'Rediger krav'}
                        </Heading>
                        <Heading level="2" size="small">
                          {`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}{' '}
                        </Heading>
                        {newVersionWarning && (
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
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="title_container py-16 px-24">
                      <InputField marginBottom label="Krav-tittel" name="navn" />
                      <div className="mb-14">
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
                      <FormError fieldName="hensikt" />
                    </div>

                    <div className="flex w-full justify-center">
                      <div className="w-full px-24 mb-2.5">
                        <Heading level="3" size="medium" className="mb-8">
                          Suksesskriterier
                        </Heading>
                        <KravSuksesskriterierEdit
                          setIsFormDirty={setIsFormDirty}
                          newVersion={!!newVersionWarning}
                        />

                        <div className="mb-8">
                          <Heading level="3" size="medium">
                            Dokumentasjon
                          </Heading>
                        </div>

                        <MultiInputField
                          marginBottom
                          maxInputWidth={maxInputWidth}
                          linkLabel="Navn på kilde"
                          name="dokumentasjon"
                          link
                          label="Lenke eller websaknr"
                          tooltip="Lenke til dokumentasjon"
                          linkTooltip={
                            'Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller WebSak.'
                          }
                          setErrors={() => setErrors({ dokumentasjon: 'Må ha navn på kilde' })}
                        />

                        <FormError fieldName="dokumentasjon" />
                        <RegelverkEdit />
                        <FormError fieldName="regelverk" />

                        {!newKrav && krav.kravVersjon > 1 && (
                          <>
                            <TextAreaField
                              label="Endringer siden siste versjon"
                              name="versjonEndringer"
                              height="250px"
                              markdown
                            />
                            <FormError fieldName={'versjonEndringer'} />
                          </>
                        )}

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
                            tooltip={
                              'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'
                            }
                          />

                          <FormError fieldName="relevansFor" />
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

                        <KravVarslingsadresserEdit />

                        <FormError fieldName="varslingsadresser" />

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
                        <div className="flex w-full">
                          {krav.status === EKravStatus.AKTIV && !newVersionWarning && (
                            <div className="mr-2">
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setUtgaattKravMessage(true)
                                }}
                                disabled={isSubmitting}
                                type={'button'}
                              >
                                Sett kravet til utgått
                              </Button>
                            </div>
                          )}

                          {user.isAdmin() &&
                            krav.status === EKravStatus.UTGAATT &&
                            !newVersionWarning && (
                              <div className="mr-2">
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setAktivKravMessage(true)
                                  }}
                                  disabled={isSubmitting}
                                  type={'button'}
                                >
                                  Sett versjonen til aktiv
                                </Button>
                              </div>
                            )}

                          {user.isAdmin() && !newVersionWarning && (
                            <div className="mr-2">
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  values.status = EKravStatus.UTKAST
                                  submitForm()
                                }}
                                disabled={isSubmitting}
                                type="button"
                              >
                                Sett kravet til utkast
                              </Button>
                            </div>
                          )}

                          <Modal
                            header={{
                              closeButton: false,
                              heading: 'Sikker på at du vil sette kravet til utgått?',
                            }}
                            open={UtgaattKravMessage}
                          >
                            <Modal.Body>Denne handligen kan ikke reverseres</Modal.Body>
                            <Modal.Footer>
                              <Button
                                type="button"
                                className="mr-4"
                                variant="secondary"
                                onClick={() => setUtgaattKravMessage(false)}
                              >
                                Nei, avbryt handlingen
                              </Button>
                              <Button
                                type="button"
                                variant="primary"
                                onClick={() => {
                                  values.status = EKravStatus.UTGAATT
                                  submitForm()
                                  setUtgaattKravMessage(false)
                                }}
                              >
                                Ja, sett til utgått
                              </Button>
                            </Modal.Footer>
                          </Modal>

                          <Modal
                            header={{
                              closeButton: false,
                              heading: 'Sikker på at du vil sette versjonen til aktiv?',
                            }}
                            open={aktivKravMessage}
                            onClose={() => setAktivKravMessage(false)}
                          >
                            <Modal.Body>
                              Kravet har en nyere versjon som settes til utkast
                            </Modal.Body>
                            <Modal.Footer>
                              <Button
                                type="button"
                                variant="primary"
                                onClick={async () => {
                                  const newVersionOfKrav = await getKravByKravNumberAndVersion(
                                    krav.kravNummer,
                                    krav.kravVersjon + 1
                                  )
                                  if (newVersionOfKrav) {
                                    updateKrav(
                                      kravMapToFormVal({
                                        ...newVersionOfKrav,
                                        status: EKravStatus.UTKAST,
                                      }) as TKravQL
                                    ).then(() => {
                                      values.status = EKravStatus.AKTIV
                                      submitForm()
                                      setAktivKravMessage(false)
                                    })
                                  } else {
                                    values.status = EKravStatus.AKTIV
                                    submitForm()
                                    setAktivKravMessage(false)
                                  }
                                }}
                              >
                                Ja, sett til aktiv
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setAktivKravMessage(false)}
                              >
                                Nei, avbryt handlingen
                              </Button>
                            </Modal.Footer>
                          </Modal>
                        </div>
                        <div className="flex w-full justify-end">
                          <Button
                            className="ml-4"
                            variant="secondary"
                            type="button"
                            onClick={() => {
                              handleReset()
                            }}
                          >
                            Avbryt
                          </Button>

                          <Button
                            className="ml-4"
                            variant="primary"
                            onClick={() => {
                              if (newVersionWarning) {
                                values.status = EKravStatus.UTKAST
                              } else {
                                values.status = krav.status
                              }
                              submitForm()
                            }}
                            disabled={isSubmitting}
                          >
                            {newVersionWarning || krav.status !== EKravStatus.AKTIV
                              ? 'Lagre'
                              : 'Publiser endringer'}
                          </Button>

                          {(newVersionWarning || krav.status === EKravStatus.UTKAST) && (
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
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-24 py-12">
                      <TextAreaField
                        label="Notater (Kun synlig for kraveier)"
                        name="notat"
                        height="250px"
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
          </div>
        </PageLayout>
      )}
    </>
  )
}
