import {Krav, KravQL, KravStatus} from '../../constants'
import {Form, Formik} from 'formik'
import {createKrav, mapToFormVal, updateKrav} from '../../api/KravApi'
import {Block} from 'baseui/block'
import React, {useEffect} from 'react'
import * as yup from 'yup'
import {codelist, ListName} from '../../services/Codelist'
import {kravStatus} from '../../pages/KravPage'
import {InputField, MultiInputField, OptionField, TextAreaField} from '../common/Inputs'
import axios from 'axios'
import {env} from '../../util/env'
import {KravVarslingsadresserEdit} from './Edit/KravVarslingsadresserEdit'
import {KravRegelverkEdit} from './Edit/KravRegelverkEdit'
import {KravSuksesskriterierEdit} from './Edit/KravSuksesskriterieEdit'
import {EditBegreper} from './Edit/KravBegreperEdit'
import {H1, H2, LabelLarge} from 'baseui/typography'
import CustomizedModal from '../common/CustomizedModal'
import Button from '../common/Button'
import {ettlevColors, maxPageWidth, responsivePaddingLarge, responsiveWidthLarge, theme} from '../../util/theme'
import {getEtterlevelserByKravNumberKravVersion} from "../../api/EtterlevelseApi";
import ErrorModal from "../ErrorModal";
import {Error} from "../common/ModalSchema";
import {ErrorMessageModal} from "./ErrorMessageModal";
import {KIND as NKIND, Notification} from "baseui/notification";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {EditKravMultiOptionField} from './Edit/EditKravMultiOptionField'

type EditKravProps = {
  krav: KravQL
  close: (k?: Krav) => void
  formRef: React.Ref<any>
  isOpen: boolean | undefined
  setIsOpen: Function
}

const padding = 212
const paddingPx = padding + 'px'
const width = `calc(100% - ${padding * 2}px)`
const maxInputWidth = '400px'
const inputMarginBottom = theme.sizing.scale900

export const kravModal = () => document.querySelector('#krav-modal')

export const EditKrav = ({krav, close, formRef, isOpen, setIsOpen}: EditKravProps) => {
  const [stickyHeader, setStickyHeader] = React.useState(false)
  const [showErrorModal, setShowErrorModal] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  const submit = async (krav: KravQL) => {
    const regelverk = codelist.getCode(ListName.LOV, krav.regelverk[0]?.lov.code)
    const underavdeling = codelist.getCode(ListName.UNDERAVDELING, regelverk?.data?.underavdeling)

    const mutatedKrav = {
      ...krav,
      underavdeling: underavdeling,
    }
    const etterlevelser = await getEtterlevelserByKravNumberKravVersion(krav.kravNummer, krav.kravVersjon)
    if (etterlevelser.totalElements > 0 && krav.status === KravStatus.UTKAST) {
      setErrorMessage('Kravet kan ikke settes til «Utkast» når det er tilknyttet dokumentasjon av etterlevelse')
      setShowErrorModal(true)
    } else if (krav.id) {
      close(await updateKrav(mutatedKrav))
    } else {
      close(await createKrav(mutatedKrav))
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setStickyHeader(false)
      return
    }
    const listener = () => setStickyHeader(true)
    setTimeout(() => kravModal()?.addEventListener('scroll', listener), 200)
    return () => kravModal()?.removeEventListener('scroll', listener)
  }, [isOpen])

  return (
    <Block maxWidth={maxPageWidth}>
      <CustomizedModal
        onClose={() => setIsOpen(false)}
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
          initialValues={mapToFormVal(krav)}
          validationSchema={kravSchema()}
          innerRef={formRef}>
          {({touched, errors, isSubmitting, submitForm,setErrors}) => (
            <Form>
              <Block
                backgroundColor={ettlevColors.green800}
                paddingTop="23px"
                paddingBottom={!stickyHeader ? '48px' : '20px'}
                paddingLeft={responsivePaddingLarge}
                paddingRight={responsivePaddingLarge}
                position="sticky"
                top={0}
                display={!stickyHeader ? 'block' : 'flex'}
                $style={{zIndex: 3}}
              >
                {stickyHeader && (
                  <Block display="flex" width="100%" justifyContent="flex-start">
                    <LabelLarge $style={{color: '#F8F8F8'}}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}</LabelLarge>
                  </Block>
                )}
                {!stickyHeader && (
                  <Block>
                    <H1 $style={{color: '#F8F8F8'}}>Rediger kravside: </H1>
                    <H2 $style={{color: '#F8F8F8'}}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`} </H2>
                  </Block>
                )}
              </Block>
              <Block>
                <Block backgroundColor={ettlevColors.grey50} paddingTop="48px" paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge} paddingBottom="64px">
                  <InputField
                    marginBottom={inputMarginBottom}
                    label="Krav-tittel"
                    name="navn"
                    tooltip={'Gi kravet en kort tittel. Kravet formuleres som en aktivitet eller målsetting.'}
                  />
                  <TextAreaField
                    label="Hensikt"
                    name="hensikt"
                    height="250px"
                    marginBottom="0px"
                    markdown
                    shortenLinks
                    onImageUpload={onImageUpload(krav.id)}
                    tooltip={'Bruk noen setninger på å forklare hensikten med kravet. Formålet er at leseren skal forstå hvorfor vi har dette kravet.'}
                  />
                  <Error fieldName={'hensikt'} fullWidth/>

                </Block>

                <Block display="flex" width="100%" justifyContent="center">
                  <Block width={responsiveWidthLarge}>
                    <H2 marginBottom={inputMarginBottom}>Suksesskriterier</H2>
                    <KravSuksesskriterierEdit/>
                    {/*
                  <TextAreaField marginBottom='80px' label='Beskrivelse' name='beskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
                    tooltip={'Beskriv selve innholdet i kravet.'} />
                    */}
                    {/*
                      <TextAreaField label='Utfyllende beskrivelse' name='utdypendeBeskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
                        tooltip={'Legg til en utfyllende beskrivelse av kravet. Benyttes kun der det er behov for det.'} /> */}

                    <Block marginBottom={inputMarginBottom}>
                      <H2>Dokumentasjon</H2>
                    </Block>

                    <MultiInputField
                      marginBottom={inputMarginBottom}
                      maxInputWidth={maxInputWidth}
                      linkLabel="Navn på kilde"
                      name="dokumentasjon"
                      link
                      label="Lenke eller websaknr"
                      tooltip="Lenke til dokumentasjon"
                      linkTooltip={'Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller Websak.'}
                      setErrors={setErrors}
                    />
                    {errors.dokumentasjon && <ErrorMessageModal msg={errors.dokumentasjon} fullWidth={true}/>}
                    <KravRegelverkEdit/>
                    {errors.regelverk && <ErrorMessageModal msg={errors.regelverk} fullWidth={true}/>}
                    <TextAreaField
                      label="Relevante implementasjoner"
                      name="implementasjoner"
                      height="250px"
                      markdown
                      tooltip={'Vis til gode eksisterende implementasjoner som ivaretar kravet.'}
                    />

                    <TextAreaField
                      label="Endringer siden siste versjon"
                      name="versjonEndringer"
                      height="250px"
                      marginBottom="0px"
                      markdown
                      shortenLinks
                      tooltip={'Beskrivelse av hva som er nytt siden siste versjon.'}
                    />

                    {/* <MultiInputField label='Rettskilder' name='rettskilder' link /> */}

                    <Block marginTop="80px" marginBottom={inputMarginBottom}>
                      <H2>Gruppering og etiketter</H2>
                    </Block>

                    <Block width="100%" maxWidth={maxInputWidth}>
                      <EditKravMultiOptionField
                        marginBottom={inputMarginBottom}
                        name="relevansFor"
                        label="Relevant for"
                        listName={ListName.RELEVANS}
                        tooltip={'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'}
                      />
                      {errors.relevansFor && <ErrorMessageModal msg={errors.relevansFor} fullWidth={true}/>}
                    </Block>

                    <MultiInputField
                      marginBottom={inputMarginBottom}
                      maxInputWidth={maxInputWidth}
                      label="Etiketter"
                      name="tagger"
                      tooltip={'Tag kravet med et eller flere nøkkelord. Hensikten er å skape relasjon(er) til andre krav.'}
                    />

                    <Block width="100%" maxWidth={maxInputWidth} marginBottom="80px">
                      <EditBegreper/>
                    </Block>

                    <Block marginBottom={inputMarginBottom}>
                      <H2>Egenskaper</H2>
                    </Block>

                    <Block width="100%" maxWidth={maxInputWidth} marginBottom={inputMarginBottom}>
                      <OptionField
                        label="Status"
                        name="status"
                        options={Object.values(KravStatus).map((id) => ({id, label: kravStatus(id)}))}
                        tooltip={'Velg status for kravet. Utkast er kun synlig for kraveier selv. Aktiv/utgått er synlig for alle.'}
                      />
                    </Block>

                    <KravVarslingsadresserEdit/>
                    {errors.varslingsadresser && <ErrorMessageModal msg={errors.varslingsadresser} fullWidth={true}/>}
                    {/*

                                    <OptionField label='Ansvarlig' name='Ansvarlig' listName={ListName.UNDERAVDELING}
                    tooltip={'Angi hvilken seksjon/underavdeling som har ansvaret for kravet.'} />

                      <DateField label='Gyldig fra' name='periode.start' tooltip={'Legg til gyldighetsperiode for kravet der det er aktuelt. Hvis ikke skal feltene være blanke.'}/>
                      <DateField label='Gyldig til' name='periode.slutt' tooltip={'Legg til gyldighetsperiode for kravet der det er aktuelt. Hvis ikke skal feltene være blanke.'}/>

                      <OptionField label='Avdeling' name='avdeling' listName={ListName.AVDELING} tooltip={'Angi hvilken avdeling som har det overordnede ansvaret for kravet.'} />

                      <TextAreaField label='Endringer fra forrige versjon' name='versjonEndringer'
                                     tooltip={'Gi informasjon om hva som er endret siden forrige versjon av kravet.'}/>
                                     */}
                    <Block width={'100%'}>
                      {Object.keys(errors).length > 0 && (
                        <Block display="flex" width="100%" marginTop="3rem" marginBottom=".6em">
                          <Block width="100%">
                            <Notification overrides={{Body: {style: {width: 'auto'}}}} kind={NKIND.negative}>
                              <FontAwesomeIcon icon={faTimesCircle} style={{
                                marginRight : '5px'
                              }}/>
                              Du må fylle ut alle obligatoriske felter
                            </Notification>
                          </Block>
                        </Block>
                      )}
                    </Block>
                  </Block>
                </Block>
                <Block
                  display="flex"
                  justifyContent="flex-end"
                  paddingLeft={responsivePaddingLarge}
                  paddingRight={responsivePaddingLarge}
                  paddingBottom="16px"
                >
                  <Button
                    size="compact"
                    kind={'secondary'}
                    type={'button'}
                    onClick={close}
                    marginLeft
                  >
                    Avbryt
                  </Button>

                  <Button
                    size="compact"
                    kind="secondary"
                    onClick={submitForm}
                    disabled={isSubmitting}
                    type={'button'}
                    marginLeft>
                    Lagre
                  </Button>
                </Block>

                <Block backgroundColor={ettlevColors.grey50} paddingTop="48px" paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge} paddingBottom="64px">
                  <TextAreaField label="Notater (Kun synlig for kraveier)" name="notat" height="250px" markdown tooltip={'Kraveiers notater'}/>
                </Block>
              </Block>
              <ErrorModal isOpen={showErrorModal} errorMessage={errorMessage} submit={setShowErrorModal}/>
            </Form>
          )}
        </Formik>
      </CustomizedModal>
    </Block>
  )
}


const onImageUpload = (kravId: string) => async (file: File) => {
  const config = {headers: {'content-type': 'multipart/form-data'}}
  const formData = new FormData()
  formData.append('file', file)
  const id = (await axios.post<string[]>(`${env.backendBaseUrl}/krav/${kravId}/files`, formData, config)).data[0]

  return `/api/krav/${kravId}/files/${id}`
}

const errorMessage = "Feltet er påkrevd";

const kravSchema = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til kravet'),
    suksesskriterier: yup.array().of(yup.object({
      navn: yup.string().required('Du må oppgi et navn til suksesskriteriet')
    })).test({
      name: 'suksesskriterierCheck',
      message: errorMessage,
      test: function (suksesskriterier) {
        const {parent} = this
        if (parent.status === KravStatus.AKTIV || parent.status === KravStatus.UNDER_ARBEID) {
          return suksesskriterier && suksesskriterier.length > 0 ? true : false
        }
        return true
      },
    }),
    hensikt: yup.string().test({
      name: 'hensiktCheck',
      message: errorMessage,
      test: function (hensikt) {
        const {parent} = this
        if (parent.status === KravStatus.AKTIV || parent.status === KravStatus.UNDER_ARBEID) {
          return hensikt ? true : false
        }
        return true
      },
    }),
    regelverk: yup.array().test({
      name: 'regelverkCheck',
      message: errorMessage,
      test: function (regelverk) {
        const {parent} = this
        if (parent.status === KravStatus.AKTIV || parent.status === KravStatus.UNDER_ARBEID) {
          return regelverk && regelverk.length > 0 ? true : false
        }
        return true
      },
    }),
    varslingsadresser: yup.array().test({
      name: 'varslingsadresserCheck',
      message: errorMessage,
      test: function (varslingsadresser) {
        const {parent} = this
        if (parent.status === KravStatus.AKTIV || parent.status === KravStatus.UNDER_ARBEID) {
          return varslingsadresser && varslingsadresser.length > 0 ? true : false
        }
        return true
      },
    }),
  })
