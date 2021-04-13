import { Krav, KravQL, KravStatus } from '../../constants'
import { Form, Formik } from 'formik'
import { createKrav, mapToFormVal, updateKrav } from '../../api/KravApi'
import { Block } from 'baseui/block'
import Button from '../common/Button'
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

type EditKravProps = {
  krav: KravQL,
  close: (k?: Krav) => void,
  formRef: React.Ref<any>
}

export const EditKrav = ({ krav, close, formRef }: EditKravProps) => {
  const submit = async (krav: KravQL) => {
    if (krav.id) {
      close(await updateKrav(krav))
    } else {
      close(await createKrav(krav))
    }
  }

  return (
    <Block width='calc(100%-80px)' paddingLeft='40px' paddingRight='40px'>
      <Formik
        onSubmit={submit}
        initialValues={mapToFormVal(krav)}
        validationSchema={kravSchema()}
        innerRef={formRef}
      >{({ isSubmitting, submitForm }) => (
        <Form>
          <Block>
            <InputField label='Navn' name='navn' tooltip={'Gi kravet en kort tittel. Kravet formuleres som en aktivitet eller målsetting.'} />
            <TextAreaField label='Hensikt' name='hensikt' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
              tooltip={'Bruk noen setninger på å forklare hensikten med kravet. Formålet er at leseren skal forstå hvorfor vi har dette kravet.'} />
            <KravSuksesskriterierEdit />
            <TextAreaField label='Beskrivelse' name='beskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)} tooltip={'Beskriv selve innholdet i kravet.'} />

            <TextAreaField label='Utfyllende beskrivelse' name='utdypendeBeskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
              tooltip={'Legg til en utfyllende beskrivelse av kravet. Benyttes kun der det er behov for det.'} />
            <TextAreaField label='Endringer fra forrige versjon' name='versjonEndringer' tooltip={'Gi informasjon om hva som er endret siden forrige versjon av kravet.'} />

            <MultiInputField label='Dokumentasjon' name='dokumentasjon' link
              tooltip={'Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller Websak.'} />
            <KravRegelverkEdit />
            <MultiInputField label='Rettskilder' name='rettskilder' link />

            <MultiInputField label='Tagger' name='tagger' tooltip={'Tag kravet med et eller flere nøkkelord. Hensikten er å skape relasjon(er) til andre krav.'} />
            <MultiOptionField label='Kravet er relevant for' name='relevansFor' listName={ListName.RELEVANS}
              tooltip={'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'} />
            <MultiInputField label='Relevante implementasjoner' name='implementasjoner' tooltip={'Vis til gode eksisterende implementasjoner som ivaretar kravet.'} />
            <EditBegreper />

            <DateField label='Gyldig from' name='periode.start' tooltip={'Legg til gyldighetsperiode for kravet der det er aktuelt. Hvis ikke skal feltene være blanke.'} />
            <DateField label='Gyldig tom' name='periode.slutt' tooltip={'Legg til gyldighetsperiode for kravet der det er aktuelt. Hvis ikke skal feltene være blanke.'} />

            <OptionField label='Status' name='status' options={Object.values(KravStatus).map(id => ({ id, label: kravStatus(id) }))}
              tooltip={'Velg status for kravet. Utkast er kun synlig for kraveier selv. Aktiv/utgått er synlig for alle.'} />
            <KravVarslingsadresserEdit />
            {/* <OptionField label='Avdeling' name='avdeling' listName={ListName.AVDELING} tooltip={'Angi hvilken avdeling som har det overordnede ansvaret for kravet.'} /> */}
            <OptionField label='Underavdeling' name='underavdeling' listName={ListName.UNDERAVDELING} tooltip={'Angi hvilken seksjon/underavdeling som har ansvaret for kravet.'} />

          </Block>

          <Block display='flex' justifyContent='flex-end'>
            <Button type='button' kind='secondary' marginRight onClick={close}>Avbryt</Button>
            <Button type='button' disabled={isSubmitting} onClick={submitForm}>Lagre</Button>
          </Block>
        </Form>
      )}
      </Formik>
    </Block>
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
