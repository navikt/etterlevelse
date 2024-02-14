import { ApolloQueryResult } from '@apollo/client'
import { Alert, Button, Checkbox, CheckboxGroup, Heading, Loader, Modal } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getEtterlevelserByKravNumberKravVersion } from '../../../api/EtterlevelseApi'
import {
  TKravIdParams,
  createKrav,
  getKravByKravNumberAndVersion,
  getKravByKravNummer,
  kravMapToFormVal,
  updateKrav,
} from '../../../api/KravApi'
import { GetKravData, IKravDataProps, TKravById } from '../../../api/KravEditApi'
import { EKravStatus, IKrav, IKravId, IKravVersjon, TKravQL } from '../../../constants'
import { TSection } from '../../../pages/EtterlevelseDokumentasjonPage'
import { EListName, codelist } from '../../../services/Codelist'
import { user } from '../../../services/User'
import { useLocationState } from '../../../util/hooks'
import ErrorModal from '../../ErrorModal'
import { IBreadcrumbPaths } from '../../common/CustomizedBreadcrumbs'
import { InputField, MultiInputField, TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import { PageLayout } from '../../scaffold/Page'
import { EditKravMultiOptionField } from './EditKravMultiOptionField'
import { EditKravRelasjoner } from './EditKravRelasjoner'
import { EditBegreper } from './KravBegreperEdit'
import { kravSchema } from './KravEditPageValidation'
import { KravSuksesskriterierEdit } from './KravSuksesskriterieEdit'
import { KravVarslingsadresserEdit } from './KravVarslingsadresserEdit'
import { RegelverkEdit } from './RegelverkEdit'

type TLocationState = { tab: TSection; avdelingOpen?: string }

const kravBreadCrumbPath: IBreadcrumbPaths = {
  href: '/kravliste',
  pathName: 'Forvalte og opprette krav',
}

const maxInputWidth = '400px'

export const KravEditPage = () => {
  const params: Readonly<Partial<TKravIdParams>> = useParams<TKravIdParams>()
  const kravData: IKravDataProps | undefined = GetKravData(params)

  const kravQuery: TKravById | undefined = kravData?.kravQuery
  const kravLoading: boolean | undefined = kravData?.kravLoading
  const reloadKrav:
    | Promise<
        ApolloQueryResult<{
          kravById: TKravQL
        }>
      >
    | undefined = kravData?.reloadKrav

  const { navigate } = useLocationState<TLocationState>()
  const [krav, setKrav] = useState<TKravQL | undefined>()
  const [newKrav, setNewKrav] = useState<boolean>(false)
  const [edit, setEdit] = useState(krav && !krav.id)
  const [kravId, setKravId] = useState<IKravId>()
  const [newVersionWarning, setNewVersionWarning] = useState<boolean>(false)
  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])

  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>(
    krav?.varselMelding ? ['VarselMelding'] : []
  )

  const [UtgaattKravMessage, setUtgaattKravMessage] = useState<boolean>(false)
  const [aktivKravMessage, setAktivKravMessage] = useState<boolean>(false)

  const submit = async (krav: TKravQL) => {
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
    if (etterlevelser.totalElements > 0 && krav.status === EKravStatus.UTKAST && !newVersion) {
      setErrorModalMessage(
        'Kravet kan ikke settes til «Utkast» når det er tilknyttet dokumentasjon av etterlevelse'
      )
      setShowErrorModal(true)
    } else if (krav.id) {
      close(await updateKrav(mutatedKrav))
      setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
    } else {
      close(await createKrav(mutatedKrav))
      setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
    }
  }

  const newVersion = () => {
    if (!krav) return
    setKravId({ id: krav.id, kravVersjon: krav.kravVersjon })
    setKrav({ ...krav, id: '', kravVersjon: krav.kravVersjon + 1, nyKravVersjon: true })
    setEdit(true)
    setNewVersionWarning(true)
  }

  const close = (k: IKrav): void => {
    if (k) {
      navigate(`/krav/${k.kravNummer}/${k.kravVersjon}`)
    } else if (krav?.nyKravVersjon && kravId) {
      setKrav({ ...krav, id: kravId.id, kravVersjon: kravId.kravVersjon })
    }
    setEdit(false)
    setNewVersionWarning(false)
    setNewKrav(false)
  }

  useEffect(() => {
    // hent krav på ny ved avbryt ny versjon
    if (!edit && !krav?.id && krav?.nyKravVersjon) {
      reloadKrav
      navigate(`/krav/${krav.kravNummer}/${krav.kravVersjon}`)
    }
  }, [edit])

  useEffect(() => {
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
    }
  }, [krav])

  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  useEffect(() => {
    if (params.id === 'ny') {
      setKrav(kravMapToFormVal({}) as TKravQL)
      setEdit(true)
      setNewKrav(true)
    }
  }, [params.id])

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
              validationSchema={kravSchema({ newKrav, krav, alleKravVersjoner })}
            >
              {({ values, errors, isSubmitting, handleReset, submitForm, setErrors }) => (
                <Form>
                  <div>
                    <div className="w-full">
                      <Heading level="1" size="medium">
                        {newVersionWarning ? 'Ny versjon' : newKrav ? 'Nytt krav' : 'Rediger krav'}
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
                        <div className="mb-10">
                          <Heading level="3" size="medium" className="mb-2">
                            Suksesskriterier
                          </Heading>
                          <KravSuksesskriterierEdit newVersion={!!newVersionWarning} />
                        </div>

                        <Heading level="3" size="medium" className="mb-2">
                          Dokumentasjon
                        </Heading>

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
                              if (krav.kravNummer && krav.kravVersjon) {
                                navigate(`/krav/${krav.kravNummer}/${krav.kravVersjon}`)
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
                    <div className="py-12">
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
