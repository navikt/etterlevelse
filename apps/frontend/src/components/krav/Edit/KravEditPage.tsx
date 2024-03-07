import { Box, Button, Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEtterlevelserByKravNumberKravVersion } from '../../../api/EtterlevelseApi'
import {
  TKravIdParams,
  getKravByKravNumberAndVersion,
  getKravByKravNummer,
  kravMapToFormVal,
  updateKrav,
} from '../../../api/KravApi'
import { GetKravData, IKravDataProps, TKravById } from '../../../api/KravEditApi'
import { EKravStatus, IKrav, IKravVersjon, TKravQL } from '../../../constants'
import { kravBreadCrumbPath } from '../../../pages/util/BreadCrumbPath'
import { EListName, codelist } from '../../../services/Codelist'
import { user } from '../../../services/User'
import { ScrollToFieldError } from '../../../util/formikUtils'
import ErrorModal from '../../ErrorModal'
import { TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import { PageLayout } from '../../scaffold/Page'
import { kravEditValidation } from './KravSchemaValidation'
import { KravEditStatusModal } from './components/KravEditStatusModal'
import { KravFormFields } from './components/KravFormFields'
import { KravStandardButtons } from './components/KravStandardButtons'

export const KravEditPage = () => {
  const params: Readonly<Partial<TKravIdParams>> = useParams<TKravIdParams>()
  const kravData: IKravDataProps | undefined = GetKravData(params)

  const kravQuery: TKravById | undefined = kravData?.kravQuery
  const kravLoading: boolean | undefined = kravData?.kravLoading
  const navigate = useNavigate()
  const [krav, setKrav] = useState<TKravQL | undefined>()
  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>(
    krav?.varselMelding ? ['VarselMelding'] : []
  )

  const [utgaattKravMessage, setUtgaattKravMessage] = useState<boolean>(false)
  const [aktivKravMessage, setAktivKravMessage] = useState<boolean>(false)

  const submit = async (krav: TKravQL): Promise<void> => {
    const regelverk = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov.code)
    const underavdeling = codelist.getCode(EListName.UNDERAVDELING, regelverk?.data?.underavdeling)
    const mutatedKrav = {
      ...krav,
      underavdeling: underavdeling,
      varselMelding: varselMeldingActive ? krav.varselMelding : undefined,
    }
    const etterlevelser = await getEtterlevelserByKravNumberKravVersion(
      krav.kravNummer,
      krav.kravVersjon
    )
    if (etterlevelser.totalElements > 0 && krav.status === EKravStatus.UTKAST) {
      setErrorModalMessage('Kravet kan ikke settes til «Utkast» når det er tilknyttet etterlevelse')
      setShowErrorModal(true)
    } else if (krav.id) {
      close(await updateKrav(mutatedKrav))
      setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
    }
  }

  const close = (k: IKrav): void => {
    if (k) {
      navigate(`/krav/${k.kravNummer}/${k.kravVersjon}`)
    }
  }

  useEffect(() => {
    if (krav) {
      getKravByKravNummer(krav.kravNummer).then((resp) => {
        if (resp.content.length) {
          const alleVersjoner = resp.content
            .map((krav) => {
              return {
                kravVersjon: krav.kravVersjon,
                kravNummer: krav.kravNummer,
                kravStatus: krav.status,
              }
            })
            .sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))

          const filteredVersjoner = alleVersjoner.filter(
            (krav) => krav.kravStatus !== EKravStatus.UTKAST
          )

          if (filteredVersjoner.length) {
            setAlleKravVersjoner(filteredVersjoner)
          }
        }
      })
    }
  }, [krav])

  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  return (
    <>
      {krav && krav.status === EKravStatus.UTGAATT && !user.isAdmin() && (
        <PageLayout
          pageTitle="Rediger krav"
          currentPage="Rediger krav"
          breadcrumbPaths={[kravBreadCrumbPath]}
          key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon}
        >
          <Box padding="4" background="surface-warning-subtle">
            Det er ikke lov å redigere på et utgått krav.
          </Box>
          <Button
            className="mt-4"
            variant="secondary"
            type="button"
            onClick={() => {
              if (krav.kravNummer && krav.kravVersjon) {
                navigate(`/krav/${krav.kravNummer}/${krav.kravVersjon}`)
              }
            }}
          >
            Gå tilbake
          </Button>
        </PageLayout>
      )}

      {krav && (krav.status !== EKravStatus.UTGAATT || user.isAdmin()) && (
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
              initialValues={kravMapToFormVal(krav as TKravQL)}
              onSubmit={submit}
              validationSchema={kravEditValidation({ alleKravVersjoner })}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ values, errors, isSubmitting, submitForm }) => (
                <Form>
                  <div>
                    <div className="w-full">
                      <Heading level="1" size="medium">
                        Rediger krav
                      </Heading>
                      <Heading level="2" size="small">
                        {`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}{' '}
                      </Heading>
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
                        <div className="flex w-full">
                          {krav.status === EKravStatus.AKTIV && (
                            <div className="mr-2">
                              <Button
                                variant="secondary"
                                onClick={() => setUtgaattKravMessage(true)}
                                disabled={isSubmitting}
                                type="button"
                              >
                                Sett kravet til utgått
                              </Button>
                            </div>
                          )}

                          {user.isAdmin() && krav.status === EKravStatus.UTGAATT && (
                            <div className="mr-2">
                              <Button
                                variant="secondary"
                                onClick={() => setAktivKravMessage(true)}
                                disabled={isSubmitting}
                                type="button"
                              >
                                Sett versjonen til aktiv
                              </Button>
                            </div>
                          )}

                          {user.isAdmin() && krav.status !== EKravStatus.UTKAST && (
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

                          <KravEditStatusModal
                            status="utgått"
                            open={utgaattKravMessage}
                            brukerBeskjed="Denne handligen kan ikke reverseres"
                            setKravMessage={() => setUtgaattKravMessage(false)}
                          >
                            <Button
                              type="button"
                              className="mr-4"
                              variant="primary"
                              onClick={() => {
                                values.status = EKravStatus.UTGAATT
                                submitForm()
                                setUtgaattKravMessage(false)
                              }}
                            >
                              Ja, sett til utgått
                            </Button>
                          </KravEditStatusModal>

                          <KravEditStatusModal
                            status="aktiv"
                            open={aktivKravMessage}
                            brukerBeskjed="Kravet har en nyere versjon som settes til utkast"
                            setKravMessage={() => setAktivKravMessage(false)}
                          >
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
                          </KravEditStatusModal>
                        </div>

                        <KravStandardButtons
                          submitCancelButton={() => {
                            if (krav.kravNummer && krav.kravVersjon) {
                              navigate(`/krav/${krav.kravNummer}/${krav.kravVersjon}`)
                            } else {
                              navigate('/kravliste')
                            }
                          }}
                          submitSaveButton={() => {
                            values.status = krav.status
                            submitForm()
                          }}
                          kravStatus={krav.status}
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
                  <ErrorModal
                    isOpen={showErrorModal}
                    errorMessage={errorModalMessage}
                    submit={setShowErrorModal}
                  />
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
