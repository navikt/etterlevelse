import { Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createKrav, kravMapToFormVal } from '../../../api/KravApi'
import { TKravQL } from '../../../constants'
import { EListName, codelist } from '../../../services/Codelist'
import { IBreadcrumbPaths } from '../../common/CustomizedBreadcrumbs'
import { PageLayout } from '../../scaffold/Page'
import { kravCreateValidation } from './KravSchemaValidation'

const kravBreadCrumbPath: IBreadcrumbPaths = {
  href: '/kravliste',
  pathName: 'Forvalte og opprette krav',
}

export const KravCreatePage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = (krav: TKravQL) => {
    setLoading(true)
    const regelverk = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov.code)
    const underavdeling = codelist.getCode(EListName.UNDERAVDELING, regelverk?.data?.underavdeling)

    const mutatedKrav = {
      ...krav,
      underavdeling: underavdeling,
    }
    createKrav(mutatedKrav).then((krav) => {
      setLoading(false)
      navigate('/krav/' + krav.id)
    })
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
            Jobber med å opprette ny krav. Du vil bli sendt til ny krav side når det er fullført
          </Heading>
          <Loader size="3xlarge" />
        </div>
      )}

      {/* <Formik
        onSubmit={submit}
        initialValues={kravMapToFormVal({})}
        validationSchema={kravCreateValidation()}
      >
        {({ values, errors, isSubmitting, handleReset, submitForm, setErrors, initialValues }) => (
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
            <div
              className={`pt-6 ${!stickyHeader ? 'pb-12' : 'pb-5'} px-24 sticky top-0 ${
                !stickyHeader ? 'block' : 'flex'
              } z-30 bg-green-800`}
            >
              {stickyHeader && (
                <div className="flex w-full justify-start">
                  <BodyShort className="text-white">{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}</BodyShort>
                </div>
              )}
              {!stickyHeader && (
                <div className="w-full">
                  <Heading level="1" size="medium" className="text-white">
                    {newVersion ? 'Ny versjon' : newKrav ? 'Nytt krav' : 'Rediger kravside'}:{' '}
                  </Heading>
                  <Heading level="2" size="small" className="text-white">
                    {`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}{' '}
                  </Heading>
                  {newVersion && (
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
                <InputField
                  marginBottom
                  label="Krav-tittel"
                  name="navn"
                  description="Gi kravet en kort tittel. Kravet formuleres som en aktivitet eller målsetting."
                />
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
                <TextAreaField
                  label="Hensikt"
                  name="hensikt"
                  height="250px"
                  markdown
                  shortenLinks
                  onImageUpload={onImageUpload(krav.id)}
                  tooltip={
                    'Bruk noen setninger på å forklare hensikten med kravet. Formålet er at leseren skal forstå hvorfor vi har dette kravet.'
                  }
                />
                <Error fieldName="hensikt" />
              </div>

              <div className="flex w-full justify-center">
                <div className="w-full px-24 mb-2.5">
                  <Heading level="3" size="medium" className="mb-8">
                    Suksesskriterier
                  </Heading>
                  <KravSuksesskriterierEdit
                    setIsFormDirty={setIsFormDirty}
                    newVersion={!!newVersion}
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
                    setErrors={() => setErrors({ dokumentasjon: 'Må ha navn på kilde.' })}
                  />

                  <Error fieldName="dokumentasjon" />
                  <RegelverkEdit />
                  <Error fieldName="regelverk" />

                  {!newKrav && krav.kravVersjon > 1 && (
                    <>
                      <TextAreaField
                        label="Endringer siden siste versjon"
                        name="versjonEndringer"
                        height="250px"
                        markdown
                        shortenLinks
                        tooltip={'Beskrivelse av hva som er nytt siden siste versjon.'}
                      />
                      <Error fieldName={'versjonEndringer'} />
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
                      tooltip={'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'}
                    />

                    <Error fieldName="relevansFor" />
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

                  <Error fieldName="varslingsadresser" />

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
              <div className="button_container sticky bottom-0 flex flex-col py-4 px-24 bg-gray-50 z-10">
                {errors.status && (
                  <div className="mb-3">
                    <Error fieldName="status" />
                  </div>
                )}

                <div className="flex w-full">
                  <div className="flex w-full">
                    {krav.status === EKravStatus.AKTIV && !newVersion && (
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

                    {user.isAdmin() && krav.status === EKravStatus.UTGAATT && !newVersion && (
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

                    {user.isAdmin() && !newVersion && (
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
                      <Modal.Body>Kravet har en nyere versjon som settes til utkast</Modal.Body>
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
                        setIsOpen(false)
                        handleReset()
                      }}
                    >
                      Avbryt
                    </Button>

                    <Button
                      className="ml-4"
                      variant="primary"
                      onClick={() => {
                        if (newVersion) {
                          values.status = EKravStatus.UTKAST
                        } else {
                          values.status = krav.status
                        }
                        submitForm()
                      }}
                      disabled={isSubmitting}
                    >
                      {newVersion || krav.status !== EKravStatus.AKTIV
                        ? 'Lagre'
                        : 'Publiser endringer'}
                    </Button>

                    {(newVersion || krav.status === EKravStatus.UTKAST) && (
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
                  tooltip={'Kraveiers notater'}
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
      </Formik> */}
    </PageLayout>
  )
}
