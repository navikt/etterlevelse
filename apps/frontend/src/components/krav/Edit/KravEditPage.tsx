import { Box, Button, Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { getEtterlevelserByKravNumberKravVersion } from '../../../api/EtterlevelseApi'
import {
  TKravIdParams,
  getKravByKravNumberAndVersion,
  getKravByKravNummer,
  kravMapToFormVal,
  updateKrav,
} from '../../../api/KravApi'
import { GetKravData, IKravDataProps, TKravById } from '../../../api/KravEditApi'
import {
  EKravStatus,
  IEtterlevelse,
  IKrav,
  IKravVersjon,
  IPageResponse,
  TKravQL,
} from '../../../constants'
import { kravBreadCrumbPath } from '../../../pages/util/BreadCrumbPath'
import { CodelistService, EListName, ICode, TLovCode } from '../../../services/Codelist'
import { user } from '../../../services/User'
import ErrorModal from '../../ErrorModal'
import { TextAreaField } from '../../common/Inputs'
import { kravNummerVersjonUrl, kravlisteUrl } from '../../common/RouteLinkKrav'
import { ContentLayout } from '../../layout/layout'
import { PageLayout } from '../../scaffold/Page'
import { kravEditValidation } from './KravSchemaValidation'
import { KravEditStatusModal } from './components/KravEditStatusModal'
import { KravFormFields } from './components/KravFormFields'
import { KravStandardButtons } from './components/KravStandardButtons'

export const KravEditPage = () => {
  const navigate: NavigateFunction = useNavigate()
  const params: Readonly<Partial<TKravIdParams>> = useParams<TKravIdParams>()
  const kravData: IKravDataProps | undefined = GetKravData(params)
  const [codelistUtils] = CodelistService()
  const kravQuery: TKravById | undefined = kravData?.kravQuery
  const kravLoading: boolean | undefined = kravData?.kravLoading
  const [krav, setKrav] = useState<TKravQL | undefined>()
  const [isEditingUtgaattKrav, setIsEditingUtgaattKrav] = useState<boolean>(false)
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
      underavdeling: underavdeling as ICode | undefined,
      varselMelding: varselMeldingActive ? krav.varselMelding : undefined,
    }
    const etterlevelser: IPageResponse<IEtterlevelse> =
      await getEtterlevelserByKravNumberKravVersion(krav.kravNummer, krav.kravVersjon)
    if (etterlevelser.totalElements > 0 && krav.status === EKravStatus.UTKAST) {
      setErrorModalMessage(
        'Du kan ikke sette dette kravet til «Utkast» fordi det er minst én etterlevelse som bruker kravet i sin dokumentasjon.'
      )
      setShowErrorModal(true)
    } else if (krav.id) {
      close(await updateKrav(mutatedKrav))
      setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
    }
  }

  const close = (krav: IKrav): void => {
    if (krav) {
      navigate(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon))
    }
  }

  useEffect(() => {
    if (krav) {
      getKravByKravNummer(krav.kravNummer).then((response: IPageResponse<IKrav>) => {
        if (response.content.length) {
          const alleVersjoner: IKravVersjon[] = response.content
            .map((krav: IKrav) => {
              return {
                kravVersjon: krav.kravVersjon,
                kravNummer: krav.kravNummer,
                kravStatus: krav.status,
              }
            })
            .sort((a: IKravVersjon, b: IKravVersjon) => (a.kravVersjon > b.kravVersjon ? -1 : 1))

          const filteredVersjoner = alleVersjoner.filter(
            (krav: IKravVersjon) => krav.kravStatus !== EKravStatus.UTKAST
          )

          if (filteredVersjoner.length) {
            setAlleKravVersjoner(filteredVersjoner)
          }
        }
      })
    }
  }, [krav])

  useEffect(() => {
    if (kravQuery?.kravById) {
      setKrav(kravQuery.kravById)

      setIsEditingUtgaattKrav(kravQuery.kravById.status === EKravStatus.UTGAATT ? true : false)
    }
  }, [kravQuery])

  return (
    <>
      {krav && krav.status === EKravStatus.UTGAATT && !user.isAdmin() && (
        <PageLayout
          pageTitle='Redigér krav'
          currentPage='Redigér krav'
          breadcrumbPaths={[kravBreadCrumbPath]}
          key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon}
        >
          <Box padding='4' background='surface-warning-subtle'>
            Det er ikke lov å redigere på et utgått krav.
          </Box>
          <Button
            className='mt-4'
            variant='secondary'
            type='button'
            onClick={() => {
              if (krav.kravNummer && krav.kravVersjon) {
                navigate(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon))
              }
            }}
          >
            Gå tilbake
          </Button>
        </PageLayout>
      )}

      {krav && (krav.status !== EKravStatus.UTGAATT || user.isAdmin()) && (
        <PageLayout
          pageTitle='Redigér krav'
          currentPage='Redigér krav'
          breadcrumbPaths={[kravBreadCrumbPath]}
          key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon}
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
                {({ values, errors, isSubmitting, submitForm, initialValues }) => (
                  <Form>
                    <div>
                      <div className='w-full'>
                        <Heading level='1' size='medium'>
                          Redigér krav
                        </Heading>
                        <Heading level='2' size='small'>
                          {`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}{' '}
                        </Heading>
                      </div>
                      <KravFormFields
                        mode='edit'
                        kravVersjon={values.kravVersjon}
                        errors={errors}
                        varselMeldingActive={varselMeldingActive}
                        setVarselMeldingActive={setVarselMeldingActive}
                        isEditingUtgaattKrav={isEditingUtgaattKrav}
                      />
                      <div className='button_container flex flex-col mt-5 py-4 px-4 sticky bottom-0 border-t-2 z-10 bg-white'>
                        <div className='flex w-full flex-row-reverse'>
                          <KravStandardButtons
                            submitCancelButton={() => {
                              if (krav.kravNummer && krav.kravVersjon) {
                                navigate(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon))
                              } else {
                                navigate(kravlisteUrl())
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
                          <ContentLayout>
                            {krav.status === EKravStatus.AKTIV && (
                              <div className='mr-2'>
                                <Button
                                  variant='secondary'
                                  onClick={() => {
                                    values.status = EKravStatus.UTGAATT
                                    setUtgaattKravMessage(true)
                                  }}
                                  disabled={isSubmitting}
                                  type='button'
                                >
                                  Sett kravet til utgått
                                </Button>
                              </div>
                            )}

                            {user.isAdmin() && krav.status === EKravStatus.UTGAATT && (
                              <div className='mr-2'>
                                <Button
                                  variant='secondary'
                                  onClick={() => setAktivKravMessage(true)}
                                  disabled={isSubmitting}
                                  type='button'
                                >
                                  Sett versjonen til aktiv
                                </Button>
                              </div>
                            )}

                            {user.isAdmin() && krav.status !== EKravStatus.UTKAST && (
                              <div className='mr-2'>
                                <Button
                                  variant='secondary'
                                  onClick={() => {
                                    values.status = EKravStatus.UTKAST
                                    submitForm()
                                  }}
                                  disabled={isSubmitting}
                                  type='button'
                                >
                                  Sett kravet til utkast
                                </Button>
                              </div>
                            )}

                            <KravEditStatusModal
                              status='utgått'
                              open={utgaattKravMessage}
                              brukerBeskjed='Denne handligen kan ikke reverseres'
                              setKravMessage={() => {
                                values.status = initialValues.status
                                setUtgaattKravMessage(false)
                              }}
                              formComponent={
                                <TextAreaField
                                  label='Beskriv hvorfor kravet er utgått'
                                  name='beskrivelse'
                                  height='15.625rem'
                                  markdown
                                />
                              }
                            >
                              <Button
                                type='button'
                                className='mr-4'
                                variant='primary'
                                onClick={() => {
                                  submitForm()

                                  if (values.beskrivelse) {
                                    setUtgaattKravMessage(false)
                                  }
                                }}
                              >
                                Ja, sett til utgått
                              </Button>
                            </KravEditStatusModal>

                            <KravEditStatusModal
                              status='aktiv'
                              open={aktivKravMessage}
                              brukerBeskjed='Kravet har en nyere versjon som settes til utkast'
                              setKravMessage={() => setAktivKravMessage(false)}
                            >
                              <Button
                                type='button'
                                variant='primary'
                                onClick={async () => {
                                  const newVersionOfKrav: IKrav | undefined =
                                    await getKravByKravNumberAndVersion(
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
                          </ContentLayout>
                        </div>
                      </div>
                      <div className='py-12'>
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
            </div>
          )}
        </PageLayout>
      )}
    </>
  )
}
