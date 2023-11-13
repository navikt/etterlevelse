import { Krav, KravQL, KravStatus, KravVersjon } from '../../constants'
import { Form, Formik } from 'formik'
import { createKrav, getKravByKravNumberAndVersion, kravMapToFormVal, updateKrav } from '../../api/KravApi'
import { Block } from 'baseui/block'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { codelist, ListName } from '../../services/Codelist'
import { InputField, MultiInputField, TextAreaField } from '../common/Inputs'
import axios from 'axios'
import { env } from '../../util/env'
import { KravVarslingsadresserEdit } from './Edit/KravVarslingsadresserEdit'
import { RegelverkEdit } from './Edit/RegelverkEdit'
import { KravSuksesskriterierEdit } from './Edit/KravSuksesskriterieEdit'
import { EditBegreper } from './Edit/KravBegreperEdit'
import { HeadingXLarge, HeadingXXLarge, LabelLarge, LabelSmall, ParagraphMedium, ParagraphXSmall } from 'baseui/typography'
import CustomizedModal from '../common/CustomizedModal'
import Button from '../common/Button'
import { ettlevColors, responsivePaddingLarge, responsiveWidthLarge, theme } from '../../util/theme'
import { getEtterlevelserByKravNumberKravVersion } from '../../api/EtterlevelseApi'
import ErrorModal from '../ErrorModal'
import { Error } from '../common/ModalSchema'
import { ErrorMessageModal } from './ErrorMessageModal'
import { KIND as NKIND, Notification } from 'baseui/notification'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EditKravMultiOptionField } from './Edit/EditKravMultiOptionField'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../common/Style'
import { Checkbox } from 'baseui/checkbox'
import { warningAlert } from '../Images'
import { user } from '../../services/User'
import { Modal as BaseModal, ModalBody, ModalHeader } from 'baseui/modal'
import { EditKravRelasjoner } from './Edit/EditKravRelasjoner'
import AlertUnsavedPopup from '../common/AlertUnsavedPopup'
import _ from 'lodash'

type EditKravProps = {
  krav: KravQL
  close: (k?: Krav) => void
  formRef: React.Ref<any>
  isOpen: boolean | undefined
  setIsOpen: Function
  newVersion?: boolean
  newKrav?: boolean
  alleKravVersjoner: KravVersjon[]
}

const maxInputWidth = '400px'
const inputMarginBottom = theme.sizing.scale900

export const kravModal = () => document.querySelector('#krav-modal')

export const EditKrav = ({ krav, close, formRef, isOpen, setIsOpen, newVersion, newKrav, alleKravVersjoner }: EditKravProps) => {
  const [stickyHeader, setStickyHeader] = React.useState(false)
  const [stickyFooterStyle, setStickyFooterStyle] = React.useState(true)
  const [showErrorModal, setShowErrorModal] = React.useState(false)
  const [errorModalMessage, setErrorModalMessage] = React.useState('')
  const [varlselMeldingActive, setVarselMeldingActive] = React.useState<boolean>(krav.varselMelding ? true : false)
  const [UtgaattKravMessage, setUtgaattKravMessage] = React.useState<boolean>(false)
  const [aktivKravMessage, setAktivKravMessage] = React.useState<boolean>(false)

  const [isAlertModalOpen, setIsAlertModalOpen] = React.useState<boolean>(false)
  const [isFormDirty, setIsFormDirty] = React.useState<boolean>(false)

  const kravSchema = () =>
    yup.object({
      navn: yup.string().required('Du må oppgi et navn til kravet'),
      suksesskriterier: yup.array().test({
        name: 'suksesskriterierCheck',
        message: errorMessage,
        test: function (suksesskriterier) {
          const { parent } = this
          if (parent.status === KravStatus.AKTIV) {
            return suksesskriterier && suksesskriterier.length > 0 && suksesskriterier.every((s) => s.navn) ? true : false
          }
          return true
        },
      }),
      hensikt: yup.string().test({
        name: 'hensiktCheck',
        message: errorMessage,
        test: function (hensikt) {
          const { parent } = this
          if (parent.status === KravStatus.AKTIV) {
            return hensikt ? true : false
          }
          return true
        },
      }),
      regelverk: yup.array().test({
        name: 'regelverkCheck',
        message: errorMessage,
        test: function (regelverk) {
          const { parent } = this
          if (parent.status === KravStatus.AKTIV) {
            return regelverk && regelverk.length > 0 ? true : false
          }
          return true
        },
      }),
      varslingsadresser: yup.array().test({
        name: 'varslingsadresserCheck',
        message: errorMessage,
        test: function (varslingsadresser) {
          const { parent } = this
          if (parent.status === KravStatus.AKTIV) {
            return varslingsadresser && varslingsadresser.length > 0 ? true : false
          }
          return true
        },
      }),
      status: yup.string().test({
        name: 'statusCheck',
        message: 'Det er ikke lov å sette versjonen til utgått. Det eksistere en aktiv versjon som er lavere enn denne versjonen',
        test: function (status) {
          const { parent } = this
          const nyesteAktivKravVersjon = alleKravVersjoner.filter((k) => k.kravStatus === KravStatus.AKTIV)
          if (status === KravStatus.UTGAATT && nyesteAktivKravVersjon.length >= 1 && parent.kravVersjon > nyesteAktivKravVersjon[0].kravVersjon) {
            return false
          }
          return true
        },
      }),
    })

  const submit = async (krav: KravQL) => {
    setIsFormDirty(false)
    const regelverk = codelist.getCode(ListName.LOV, krav.regelverk[0]?.lov.code)
    const underavdeling = codelist.getCode(ListName.UNDERAVDELING, regelverk?.data?.underavdeling)

    const mutatedKrav = {
      ...krav,
      underavdeling: underavdeling,
      varselMelding: varlselMeldingActive ? krav.varselMelding : undefined,
    }

    const etterlevelser = await getEtterlevelserByKravNumberKravVersion(krav.kravNummer, krav.kravVersjon)
    if (etterlevelser.totalElements > 0 && krav.status === KravStatus.UTKAST && !newVersion) {
      setErrorModalMessage('Kravet kan ikke settes til «Utkast» når det er tilknyttet dokumentasjon av etterlevelse')
      setShowErrorModal(true)
    } else if (krav.id) {
      close(await updateKrav(mutatedKrav))
      setVarselMeldingActive(!!mutatedKrav.varselMelding)
    } else {
      close(await createKrav(mutatedKrav))
      setVarselMeldingActive(!!mutatedKrav.varselMelding)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setStickyHeader(false)
      return
    }
    const listener = (event: any) => {
      const buttonPosition = document.querySelector('.content_container')?.clientHeight || 0
      if (event.target.scrollTop === 0) {
        setStickyHeader(false)
      } else if (event.target.scrollTop > buttonPosition) {
        setStickyFooterStyle(false)
      } else {
        setStickyFooterStyle(true)
        setStickyHeader(true)
      }
    }
    setTimeout(() => kravModal()?.addEventListener('scroll', listener), 200)
    return () => kravModal()?.removeEventListener('scroll', listener)
  }, [isOpen])

  return (
    <div>
      <CustomizedModal
        closeable={false}
        onClose={() => {
          if (isFormDirty) {
            setIsAlertModalOpen(true)
          } else {
            setIsOpen(false)
          }
        }}
        isOpen={isOpen}
        overrides={{
          Root: {
            props: {
              id: 'krav-modal',
            },
          },
        }}
      >
        <Formik
          onSubmit={submit}
          initialValues={!newKrav && newVersion ? kravMapToFormVal({ ...krav, versjonEndringer: '' }) : kravMapToFormVal(krav)}
          validationSchema={kravSchema()}
          innerRef={formRef}
        >
          {({ values, errors, isSubmitting, submitForm, setErrors, initialValues }) => (
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
              <AlertUnsavedPopup
                isActive={isFormDirty}
                isModalOpen={isAlertModalOpen}
                setIsModalOpen={setIsAlertModalOpen}
                onClose={() => close(values)}
                onSubmit={() => submit(values)}
              />
              <div className={`pt-6 ${!stickyHeader ? 'pb-12' : 'pb-5'} px-24 sticky top-0 ${!stickyHeader ? 'block' : 'flex'} z-30 bg-green-800`}>
                {stickyHeader && (
                  <div className="flex w-full justify-start">
                    <LabelLarge $style={{ color: '#F8F8F8' }}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}</LabelLarge>
                  </div>
                )}
                {!stickyHeader && (
                  <div className="w-full">
                    <HeadingXXLarge $style={{ color: '#F8F8F8' }}>{newVersion ? 'Ny versjon' : newKrav ? 'Ny krav' : 'Rediger kravside'}: </HeadingXXLarge>
                    <HeadingXLarge $style={{ color: '#F8F8F8' }}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`} </HeadingXLarge>
                    {newVersion && (
                      <Notification
                        closeable
                        overrides={{
                          Body: {
                            style: {
                              backgroundColor: ettlevColors.warning50,
                              ...borderWidth('1px'),
                              ...borderColor('#D47B00'),
                              ...borderRadius('4px'),
                              width: '100%',
                            },
                          },
                        }}
                      >
                        <div className="flex">
                          <div className="mr-3" >
                            <img src={warningAlert} alt="warning icon" />
                          </div>
                          <div>
                            <LabelSmall $style={{ fontSize: '16px', lineHeight: '20px' }}>Sikker på at du vil opprette en ny versjon?</LabelSmall>
                            <ParagraphXSmall $style={{ fontSize: '16px', lineHeight: '20px' }}>
                              Ny versjon av kravet skal opprettes når det er <strong>vesentlige endringer</strong> i kravet som gjør at <strong>teamene må revurdere</strong> sin
                              besvarelse av kravet. Ved alle mindre justeringer, endre i det aktive kravet, og da slipper teamene å revurdere sin besvarelse.
                            </ParagraphXSmall>
                          </div>
                        </div>
                      </Notification>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="title_container py-16 px-24">
                  <InputField
                    marginBottom={inputMarginBottom}
                    label="Krav-tittel"
                    name="navn"
                    tooltip={'Gi kravet en kort tittel. Kravet formuleres som en aktivitet eller målsetting.'}
                  />
                  <div className="mb-14">
                    <Checkbox
                      overrides={{
                        Checkmark: {
                          style: ({ $isFocused }) => ({
                            outlineColor: $isFocused ? ettlevColors.focusOutline : undefined,
                            outlineWidth: $isFocused ? '3px' : undefined,
                            outlineStyle: $isFocused ? 'solid' : undefined,
                          }),
                        },
                      }}
                      checked={varlselMeldingActive}
                      onChange={() => setVarselMeldingActive(!varlselMeldingActive)}
                    >
                      Gi kravet en varselmelding (eks. for kommende krav)
                    </Checkbox>
                    {varlselMeldingActive && (
                      <div className="w-full ml-8 mt-6">
                        <TextAreaField label="Forklaring til etterlevere" name="varselMelding" maxCharacter={100} rows={1} setIsFormDirty={setIsFormDirty} />
                      </div>
                    )}
                  </div>
                  <TextAreaField
                    label="Hensikt"
                    name="hensikt"
                    height="250px"
                    marginBottom="0px"
                    markdown
                    shortenLinks
                    onImageUpload={onImageUpload(krav.id)}
                    tooltip={'Bruk noen setninger på å forklare hensikten med kravet. Formålet er at leseren skal forstå hvorfor vi har dette kravet.'}
                    setIsFormDirty={setIsFormDirty}
                  />
                  <Error fieldName={'hensikt'} fullWidth />
                </div>

                <div className="content_container flex w-full justify-center">
                  <div className="w-5/6">
                    <HeadingXLarge marginBottom={inputMarginBottom}>Suksesskriterier</HeadingXLarge>
                    <KravSuksesskriterierEdit setIsFormDirty={setIsFormDirty} newVersion={!!newVersion} />

                    <div className="mb-8">
                      <HeadingXLarge>Dokumentasjon</HeadingXLarge>
                    </div>

                    <MultiInputField
                      marginBottom={inputMarginBottom}
                      maxInputWidth={maxInputWidth}
                      linkLabel="Navn på kilde"
                      name="dokumentasjon"
                      link
                      label="Lenke eller websaknr"
                      tooltip="Lenke til dokumentasjon"
                      linkTooltip={'Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller WebSak.'}
                      setErrors={() => setErrors({ dokumentasjon: 'Må ha navn på kilde.' })}
                    />
                    {errors.dokumentasjon && <ErrorMessageModal msg={errors.dokumentasjon} fullWidth={true} />}
                    <RegelverkEdit />
                    {errors.regelverk && <ErrorMessageModal msg={errors.regelverk} fullWidth={true} />}

                    <TextAreaField
                      label="Relevante implementasjoner"
                      name="implementasjoner"
                      height="250px"
                      markdown
                      tooltip={'Vis til gode eksisterende implementasjoner som ivaretar kravet.'}
                      setIsFormDirty={setIsFormDirty}
                    />

                    {!newKrav && (
                      <TextAreaField
                        label="Endringer siden siste versjon"
                        name="versjonEndringer"
                        height="250px"
                        marginBottom="0px"
                        markdown
                        shortenLinks
                        tooltip={'Beskrivelse av hva som er nytt siden siste versjon.'}
                        setIsFormDirty={setIsFormDirty}
                      />
                    )}

                    {/* <MultiInputField label='Rettskilder' name='rettskilder' link /> */}

                    <div className="mx-20">
                      <HeadingXLarge>Gruppering og etiketter</HeadingXLarge>
                    </div>
                    {/*
                    <Block width="100%" maxWidth={maxInputWidth}>
                      <EditVirkemidler />
                    </Block> */}

                    <div className="w-full max-w-md">
                      <EditKravMultiOptionField
                        marginBottom={inputMarginBottom}
                        name="relevansFor"
                        label="Legg til relevante kategorier"
                        listName={ListName.RELEVANS}
                        tooltip={'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'}
                      />
                      {errors.relevansFor && <ErrorMessageModal msg={errors.relevansFor} fullWidth={true} />}
                    </div>

                    <MultiInputField
                      marginBottom={inputMarginBottom}
                      maxInputWidth={maxInputWidth}
                      label="Etiketter"
                      name="tagger"
                      tooltip={'Tag kravet med et eller flere nøkkelord. Hensikten er å skape relasjon(er) til andre krav.'}
                    />

                    <div className="w-full mb-20 max-w-md">
                      <EditBegreper />
                    </div>

                    <div className="w-full mb-20 max-w-md">
                      <EditKravRelasjoner />
                    </div>

                    <div className="mb-8">
                      <HeadingXLarge>Egenskaper</HeadingXLarge>
                    </div>

                    <KravVarslingsadresserEdit />
                    {errors.varslingsadresser && <ErrorMessageModal msg={errors.varslingsadresser} fullWidth={true} />}
                    <div className="w-full">
                      {Object.keys(errors).length > 0 && !errors.dokumentasjon && (
                        <div className="flex w-full my-12">
                          <div className="w-full">
                            <Notification
                              overrides={{
                                Body: {
                                  style: {
                                    width: 'auto',
                                    ...borderStyle('solid'),
                                    ...borderWidth('1px'),
                                    ...borderColor(ettlevColors.red600),
                                    ...borderRadius('4px'),
                                  },
                                },
                              }}
                              kind={NKIND.negative}
                            >
                              <div className="flex justify-center">
                                <FontAwesomeIcon
                                  icon={faTimesCircle}
                                  style={{
                                    marginRight: '5px',
                                  }}
                                />
                                <ParagraphMedium marginBottom="0px" marginTop="0px" $style={{ lineHeight: '18px' }}>
                                  Du må fylle ut alle obligatoriske felter
                                </ParagraphMedium>
                              </div>
                            </Notification>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className="button_container sticky bottom-0 flex flex-col py-4 px-24"
/*                  backgroundColor={ettlevColors.grey25}
                  position="sticky"
                  bottom={0}
                  display="flex"
                  flexDirection="column"
                  paddingLeft={responsivePaddingLarge}
                  paddingRight={responsivePaddingLarge}
                  paddingBottom="16px"
                  paddingTop="16px"
                  $style={{
                    boxShadow: stickyFooterStyle ? '0px -4px 4px rgba(0, 0, 0, 0.12)' : '',
                    zIndex: 3,
                  }}*/
                >
                  {errors.status && (
                    <div className="mb-3">
                      <Error fieldName="status" fullWidth />
                    </div>
                  )}

                  <div className="flex w-full">
                    <div className="flex w-full">
                      {krav.status === KravStatus.AKTIV && !newVersion && (
                        <div className="mr-2">
                          <Button
                            size="compact"
                            kind="secondary"
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

                      {user.isAdmin() && krav.status === KravStatus.UTGAATT && !newVersion && (
                        <div className="mr-2">
                          <Button
                            size="compact"
                            kind="secondary"
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
                            size="compact"
                            kind="secondary"
                            onClick={() => {
                              values.status = KravStatus.UTKAST
                              submitForm()
                            }}
                            disabled={isSubmitting}
                            type={'button'}
                          >
                            Sett kravet til utkast
                          </Button>
                        </div>
                      )}

                      <BaseModal
                        overrides={{ Dialog: { style: { ...borderRadius('4px') } } }}
                        closeable={false}
                        isOpen={UtgaattKravMessage}
                        onClose={() => setUtgaattKravMessage(false)}
                      >
                        <ModalHeader>Sikker på at du vil sette kravet til utgått?</ModalHeader>
                        <ModalBody>Denne handligen kan ikke reverseres</ModalBody>
                        <div className="flex justify-center mx-6 my-8">
                          <div className="flex w-full">
                            <Button onClick={() => setUtgaattKravMessage(false)} kind={'secondary'} marginRight>
                              Nei, avbryt handlingen
                            </Button>
                          </div>
                          <div className="flex w-full justify-end">
                            <Button
                              onClick={() => {
                                values.status = KravStatus.UTGAATT
                                submitForm()
                                setUtgaattKravMessage(false)
                              }}
                            >
                              Ja, sett til utgått
                            </Button>
                          </div>
                        </div>
                      </BaseModal>

                      <BaseModal
                        overrides={{ Dialog: { style: { ...borderRadius('4px') } } }}
                        closeable={false}
                        isOpen={aktivKravMessage}
                        onClose={() => setAktivKravMessage(false)}
                      >
                        <ModalHeader>Sikker på at du vil sette versjonen til aktiv?</ModalHeader>
                        <ModalBody>Kravet har en nyere versjon som settes til utkast</ModalBody>
                        <div className="flex justify-center mx-6 my-8">
                          <div className="flex w-full">
                            <Button onClick={() => setAktivKravMessage(false)} kind={'secondary'} marginRight>
                              Nei, avbryt handlingen
                            </Button>
                          </div>
                          <div className="flex w-full justify-end">
                            <Button
                              onClick={async () => {
                                const newVersionOfKrav = await getKravByKravNumberAndVersion(krav.kravNummer, krav.kravVersjon + 1)
                                if (newVersionOfKrav) {
                                  updateKrav(
                                    kravMapToFormVal({
                                      ...newVersionOfKrav,
                                      status: KravStatus.UTKAST,
                                    }) as KravQL,
                                  ).then(() => {
                                    values.status = KravStatus.AKTIV
                                    submitForm()
                                    setAktivKravMessage(false)
                                  })
                                } else {
                                  values.status = KravStatus.AKTIV
                                  submitForm()
                                  setAktivKravMessage(false)
                                }
                              }}
                            >
                              Ja, sett til aktiv
                            </Button>
                          </div>
                        </div>
                      </BaseModal>
                    </div>
                    <div className="flex w-full justify-end">
                      <Button size="compact" kind={'secondary'} type={'button'} onClick={close} marginLeft>
                        Avbryt
                      </Button>

                      <Button
                        size="compact"
                        kind="primary"
                        onClick={() => {
                          if (newVersion) {
                            values.status = KravStatus.UTKAST
                          } else {
                            values.status = krav.status
                          }
                          submitForm()
                        }}
                        disabled={isSubmitting}
                        type={'button'}
                        marginLeft
                      >
                        {newVersion || krav.status !== KravStatus.AKTIV ? 'Lagre' : 'Publiser endringer'}
                      </Button>

                      {(newVersion || krav.status === KravStatus.UTKAST) && (
                        <Button
                          size="compact"
                          onClick={() => {
                            values.status = KravStatus.AKTIV
                            submitForm()
                          }}
                          disabled={isSubmitting}
                          type={'button'}
                          marginLeft
                        >
                          Publiser og gjør aktiv
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-24 py-12">
                  <TextAreaField label="Notater (Kun synlig for kraveier)" name="notat" height="250px" markdown tooltip={'Kraveiers notater'} />
                </div>
              </div>
              <ErrorModal isOpen={showErrorModal} errorMessage={errorModalMessage} submit={setShowErrorModal} />
            </Form>
          )}
        </Formik>
      </CustomizedModal>
    </div>
  )
}

const onImageUpload = (kravId: string) => async (file: File) => {
  const config = { headers: { 'content-type': 'multipart/form-data' } }
  const formData = new FormData()
  formData.append('file', file)
  const id = (await axios.post<string[]>(`${env.backendBaseUrl}/krav/${kravId}/files`, formData, config)).data[0]

  return `/api/krav/${kravId}/files/${id}`
}

const errorMessage = 'Feltet er påkrevd'
