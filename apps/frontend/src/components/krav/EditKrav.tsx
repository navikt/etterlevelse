import {Krav, KravStatus} from '../../constants'
import {Form, Formik} from 'formik'
import {createKrav, mapToFormVal, updateKrav} from '../../api/KravApi'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React from 'react'
import * as yup from 'yup'
import {ListName} from '../../services/Codelist'
import {kravStatus} from '../../pages/KravPage'
import {DateField, InputField, MultiInputField, MultiOptionField, OptionField, TextAreaField} from '../common/Inputs'
import axios from 'axios'
import {env} from '../../util/env'
import {KravVarslingsadresserEdit} from './Edit/KravVarslingsadresserEdit'
import {KravRegelverkEdit} from './Edit/KravRegelverkEdit'
import {KravSuksesskriterierEdit} from './Edit/KravSuksesskriterieEdit'

type EditKravProps = {
  krav: Krav,
  close: (k?: Krav) => void,
  formRef: React.Ref<any>
}

export const EditKrav = ({krav, close, formRef}: EditKravProps) => {
  const submit = async (krav: Krav) => {
    if (krav.id) {
      close(await updateKrav(krav))
    } else {
      close(await createKrav(krav))
    }
  }

  return (
    <Formik
      onSubmit={submit}
      initialValues={mapToFormVal(krav)}
      validationSchema={kravSchema()}
      innerRef={formRef}
    >{({isSubmitting, submitForm}) => (
      <Form>
        <Block>
          <InputField label='Navn' name='navn' caption={'Gi kravet en kort tittel. Kravet formuleres som en aktivitet eller målsetting.'}/>
          <TextAreaField label='Hensikt' name='hensikt' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
                         caption={'Bruk noen setninger på å forklare hensikten med kravet. Formålet er at leseren skal forstå hvorfor vi har dette kravet.'}/>
          <KravSuksesskriterierEdit/>
          <TextAreaField label='Beskrivelse' name='beskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)} caption={'Beskriv selve innholdet i kravet.'}/>

          <TextAreaField label='Utfyllende beskrivelse' name='utdypendeBeskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
                         caption={'Legg til en utfyllende beskrivelse av kravet. Benyttes kun der det er behov for det.'}/>
          <TextAreaField label='Endringer fra forrige versjon' name='versjonEndringer' caption={'Gi informasjon om hva som er endret siden forrige versjon av kravet.'}/>

          <MultiInputField label='Dokumentasjon' name='dokumentasjon' link
                           caption={'Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller Websak.'}/>
          <KravRegelverkEdit/>
          <MultiInputField label='Rettskilder' name='rettskilder' link/>

          <MultiInputField label='Tagger' name='tagger' caption={'Tag kravet med et eller flere nøkkelord. Hensikten er å skape relasjon(er) til andre krav.'}/>
          <MultiOptionField label='Kravet er relevant for' name='relevansFor' listName={ListName.RELEVANS}
                            caption={'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'}/>
          <MultiInputField label='Relevante implementasjoner' name='implementasjoner' caption={'Vis til gode eksisterende implementasjoner som ivaretar kravet.'}/>
          <MultiInputField label='Begreper' name='begreper' caption={'Legg ved lenke til relevante begrep(er) i Begrepskatalogen.'}/>

          <DateField label='Gyldig from' name='periode.start' caption={'Legg til gyldighetsperiode for kravet der det er aktuelt. Hvis ikke skal feltene være blanke.'}/>
          <DateField label='Gyldig tom' name='periode.slutt'/>

          <OptionField label='Status' name='status' options={Object.values(KravStatus).map(id => ({id, label: kravStatus(id)}))} caption={'Velg status for kravet. Utkast er kun synlig for kraveier selv. Aktiv/utgått er synlig for alle.'}/>
          <KravVarslingsadresserEdit/>
          <OptionField label='Avdeling' name='avdeling' listName={ListName.AVDELING} caption={'Angi hvilken avdeling som har det overordnede ansvaret for kravet.'}/>
          <OptionField label='Underavdeling' name='underavdeling' listName={ListName.UNDERAVDELING} caption={'Angi hvilken seksjon/underavdeling som har ansvaret for kravet.'}/>

        </Block>

        <Block display='flex' justifyContent='flex-end'>
          <Button type='button' kind='secondary' marginRight onClick={close}>Avbryt</Button>
          <Button type='button' disabled={isSubmitting} onClick={submitForm}>Lagre</Button>
        </Block>
      </Form>
    )}
    </Formik>
  )
}

const onImageUpload = (kravId: string) => async (file: File) => {
  const config = {headers: {'content-type': 'multipart/form-data'}}
  const formData = new FormData()
  formData.append('file', file)
  const id = (await axios.post<string[]>(`${env.backendBaseUrl}/krav/${kravId}/files`, formData, config)).data[0]

  return `/api/krav/${kravId}/files/${id}`
}

const kravSchema = () => {
  return yup.object({})
}
