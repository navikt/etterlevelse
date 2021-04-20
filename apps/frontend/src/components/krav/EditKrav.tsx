import { Krav, KravQL, KravStatus } from '../../constants'
import { Form, Formik } from 'formik'
import { createKrav, mapToFormVal, updateKrav } from '../../api/KravApi'
import { Block } from 'baseui/block'
import React from 'react'
import * as yup from 'yup'
import { ListName } from '../../services/Codelist'
import { kravStatus } from '../../pages/KravPage'
import { DateField, InputField, MultiInputField, MultiOptionField, OptionField, TextAreaField } from '../common/Inputs'
import axios from 'axios'
import { env } from '../../util/env'
import { KravVarslingsadresserEdit } from './Edit/KravVarslingsadresserEdit'
import { KravRegelverkEdit } from './Edit/KravRegelverkEdit'
import { KravSuksesskriterierEdit } from './Edit/KravSuksesskriterieEdit'
import { EditBegreper } from './Edit/KravBegreperEdit'
import { CustomizedTab, CustomizedTabs } from '../common/CustomizedTabs'
import { LabelLarge, H1, H2 } from 'baseui/typography'
import CustomizedModal from '../common/CustomizedModal'
import Button from '../common/Button'

type EditKravProps = {
  krav: KravQL,
  close: (k?: Krav) => void,
  formRef: React.Ref<any>,
  isOpen: boolean | undefined,
  setIsOpen: Function
}

export const EditKrav = ({ krav, close, formRef, isOpen, setIsOpen }: EditKravProps) => {

  const [modalIsOpen, setmodalIsOpen] = React.useState(false)
  const [stickyHeader, setStickyHeader] = React.useState(false)

  const submit = async (krav: KravQL) => {
    if (krav.id) {
      close(await updateKrav(krav))
    } else {
      close(await createKrav(krav))
    }
  }

  React.useEffect(() => {
    if (!modalIsOpen) {
      setStickyHeader(false)
    }

    document.querySelector('.modal')?.addEventListener('scroll', () => setStickyHeader(true))

  }, [modalIsOpen])

  return (
    <Block>
      <CustomizedModal
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        overrides={{
          Root: {
            props: (props: any) => {
              if (props.$isVisible) {
                setmodalIsOpen(props.$isOpen)
              }

              return {
                ...props,
                className: 'modal'
              }
            }
          }
        }}
      >
        <Formik
          onSubmit={submit}
          initialValues={mapToFormVal(krav)}
          validationSchema={kravSchema()}
          innerRef={formRef}
        >{({ isSubmitting, submitForm }) => (
          <Form>
            <Block
              backgroundColor='#112724'
              paddingTop='20px'
              paddingBottom='20px'
              paddingLeft='212px'
              paddingRight='32px'
              position='sticky'
              top={0}
              display={!stickyHeader ? 'block' : 'flex'}
              $style={{ zIndex: 1 }}
            >
              {stickyHeader && (
                <Block display='flex' width='100%' justifyContent='flex-start'>
                  <LabelLarge $style={{ color: '#F8F8F8' }}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}</LabelLarge>
                </Block>
              )}
              <Block display='flex' justifyContent='flex-end'>
                <Button
                  size='compact'
                  $style={{ color: '#112724', backgroundColor: '#F8F8F8', ':hover': { backgroundColor: '#F8F8F8' } }}
                  onClick={() => submitForm}
                  disabled={isSubmitting}
                  marginLeft>
                  Lagre
                </Button>
                <Button
                  size='compact'
                  $style={{ color: '#F8F8F8' }}
                  kind={'tertiary'}
                  onClick={
                    close
                  }
                  marginLeft>
                  Avbryt
                </Button>
              </Block>
              {

              }
              {!stickyHeader && (
                <Block>
                  <H1 $style={{ color: '#F8F8F8' }}>Rediger kravside: </H1>
                  <H2 $style={{ color: '#F8F8F8' }}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`} </H2>
                </Block>
              )}
            </Block>
            <Block>
              <Block backgroundColor='#F1F1F1' paddingLeft='212px' paddingRight='212px'>
                <InputField label='Krav-tittel' name='navn' tooltip={'Gi kravet en kort tittel. Kravet formuleres som en aktivitet eller målsetting.'} />
                <TextAreaField marginBottom='0px' label='Hensikt' name='hensikt' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
                  tooltip={'Bruk noen setninger på å forklare hensikten med kravet. Formålet er at leseren skal forstå hvorfor vi har dette kravet.'} />
              </Block>

              <Block display='flex' width='100%' justifyContent='center'>
                <Block backgroundColor='#F1F1F1' height='58px' width='212px' />
                <Block width='calc(100% - 424px)'>
                  <CustomizedTabs fontColor='#112624' tabBackground='#F1F1F1'>
                    <CustomizedTab title={<LabelLarge>Om kravet</LabelLarge>}>
                      <KravSuksesskriterierEdit />
                      <TextAreaField label='Beskrivelse' name='beskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)} tooltip={'Beskriv selve innholdet i kravet.'} />
                      {/* 
                      <TextAreaField label='Utfyllende beskrivelse' name='utdypendeBeskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
                        tooltip={'Legg til en utfyllende beskrivelse av kravet. Benyttes kun der det er behov for det.'} /> */}
                      <TextAreaField label='Endringer fra forrige versjon' name='versjonEndringer' tooltip={'Gi informasjon om hva som er endret siden forrige versjon av kravet.'} />

                      <Block marginBottom='49px'>
                        <LabelLarge><b>Dokumentasjon og relevanse</b></LabelLarge>
                      </Block>

                      <MultiInputField linkLabel='Navn på dokumentasjon' name='dokumentasjon' link label='Lenke eller websaknr' tooltip='Lenke til dokumentasjon'
                        linkTooltip={'Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller Websak.'} />
                      <KravRegelverkEdit />
                      <MultiInputField label='Relevante implementasjoner' name='implementasjoner' tooltip={'Vis til gode eksisterende implementasjoner som ivaretar kravet.'} />
                      {/* <MultiInputField label='Rettskilder' name='rettskilder' link /> */}

                      <Block marginBottom='49px'>
                        <LabelLarge><b>Gruppering og etiketter</b></LabelLarge>
                      </Block>

                      <MultiOptionField label='Relevant for' name='relevansFor' listName={ListName.RELEVANS}
                        tooltip={'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'} />

                      <EditBegreper />

                      <Block marginBottom='49px'>
                        <LabelLarge><b>Egenskaper</b></LabelLarge>
                      </Block>

                      <KravVarslingsadresserEdit />

                      <OptionField label='Status' name='status' options={Object.values(KravStatus).map(id => ({ id, label: kravStatus(id) }))}
                        tooltip={'Velg status for kravet. Utkast er kun synlig for kraveier selv. Aktiv/utgått er synlig for alle.'} />

                      <MultiInputField label='Tagger' name='tagger' tooltip={'Tag kravet med et eller flere nøkkelord. Hensikten er å skape relasjon(er) til andre krav.'} />


                      <DateField label='Gyldig from' name='periode.start' tooltip={'Legg til gyldighetsperiode for kravet der det er aktuelt. Hvis ikke skal feltene være blanke.'} />
                      <DateField label='Gyldig tom' name='periode.slutt' tooltip={'Legg til gyldighetsperiode for kravet der det er aktuelt. Hvis ikke skal feltene være blanke.'} />

                      {/* <OptionField label='Avdeling' name='avdeling' listName={ListName.AVDELING} tooltip={'Angi hvilken avdeling som har det overordnede ansvaret for kravet.'} /> */}
                      <OptionField label='Ansvarlig' name='Ansvarlig' listName={ListName.UNDERAVDELING} tooltip={'Angi hvilken seksjon/underavdeling som har ansvaret for kravet.'} />

                    </CustomizedTab>
                    <CustomizedTab title={<LabelLarge>Spørsmål og svar</LabelLarge>}>
                    </CustomizedTab>
                    <CustomizedTab title={<LabelLarge>Eksempler på etterlevelse</LabelLarge>}>
                    </CustomizedTab>
                  </CustomizedTabs>
                </Block>
                <Block backgroundColor='#F1F1F1' height='58px' width='212px' />
              </Block>
            </Block>
          </Form>
        )}
        </Formik>
      </CustomizedModal>
    </Block >
  )
}

const onImageUpload = (kravId: string) => async (file: File) => {
  const config = { headers: { 'content-type': 'multipart/form-data' } }
  const formData = new FormData()
  formData.append('file', file)
  const id = (await axios.post<string[]>(`${env.backendBaseUrl}/krav/${kravId}/files`, formData, config)).data[0]

  return `/api/krav/${kravId}/files/${id}`
}

const kravSchema = () => {
  return yup.object({})
}
