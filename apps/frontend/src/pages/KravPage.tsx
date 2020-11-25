import * as yup from 'yup'
import {Block} from 'baseui/block'
import {H2, LabelSmall} from 'baseui/typography'
import {useParams} from 'react-router-dom'
import {createKrav, mapToFormVal, updateKrav, useKrav} from '../api/KravApi'
import {Spinner} from '../components/common/Spinner'
import React, {useState} from 'react'
import {theme} from '../util'
import {Krav, KravStatus} from '../constants'
import {Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik, FormikProps} from 'formik'
import {disableEnter} from '../components/common/Table'
import {FormControl} from 'baseui/form-control'
import {Input} from 'baseui/input'
import {renderTagList} from '../components/common/TagList'
import Button from '../components/common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'

export const kravName = (krav: Krav) => `${krav.kravNummer}.${krav.kravVersjon} - ${krav.navn}`

export const kravStatus = (krav: Krav) => {
  switch (krav.status) {
    case KravStatus.UNDER_REDIGERING:
      return 'Under redigering'
    case KravStatus.FERDIG:
      return 'Ferdig'
    default:
      return krav.status
  }
}

export const KravPage = () => {
  const id = useParams<{id: string}>().id
  const [krav, setKrav] = useKrav(id)
  const [edit, setEdit] = useState(false)

  const submit = (krav: Krav) => {
    if (krav.id) {
      updateKrav(krav).then(setKrav)
      setEdit(false)
    } else {
      createKrav(krav).then(setKrav)
      setEdit(false)
    }
  }

  if (!edit && !krav) return <Spinner size={'40px'}/>

  return (
    <Block>

      <Block display='flex' justifyContent='space-between' alignItems='center'>
        <H2>Krav: {kravName(krav)}</H2>

        <Block>
          <Button size='compact' onClick={() => setEdit(!edit)}>{edit ? 'Avbryt' : 'Rediger'}</Button>
        </Block>
      </Block>

      {!edit && <Block>
        <Label title='Beskrivelse'>{krav.beskrivelse}</Label>
        <Label title='Utdypende beskrivelse'>{krav.utdypendeBeskrivelse}</Label>
        <Label title='Hensikt'>{krav.hensikt}</Label>
        <Label title='Dokumentasjon'>{krav.dokumentasjon.join(', ')}</Label>
        <Label title='Relevante implementasjoner'>{krav.implementasjoner.join(', ')}</Label>
        <Label title='Begreper'>{krav.begreper.join(', ')}</Label>
        <Label title='Kontaktpersoner'>{krav.kontaktPersoner.join(', ')}</Label>
        <Label title='Rettskilder'>{krav.rettskilder.join(', ')}</Label>
        <Label title='Tagger'>{krav.tagger.join(', ')}</Label>
        <Label title='Periode'>{krav.periode?.start} {krav.periode?.slutt}</Label>
        <Label title='Avdeling'>{krav.avdeling}</Label>
        <Label title='Underavdeling'>{krav.underavdeling}</Label>
        <Label title='Relevant for'>{krav.relevansFor?.shortName}</Label>
        <Label title='Status'>{kravStatus(krav)}</Label>
      </Block>}

      {edit && krav && <EditKrav krav={krav} submit={submit} cancel={() => setEdit(false)}/>}
    </Block>
  )
}


const Label = (props: {title: string, children: React.ReactNode}) => {
  return (
    <Block display='flex' marginBottom={theme.sizing.scale100}>
      <LabelSmall marginRight={theme.sizing.scale400}>{props.title}: </LabelSmall>
      <LabelSmall>{props.children}</LabelSmall>
    </Block>
  )
}

const EditKrav = (props: {krav: Krav, submit: (krav: Krav) => void, cancel: () => void}) => {
  return (
    <Formik
      onSubmit={props.submit}
      initialValues={mapToFormVal(props.krav)}
      validationSchema={kravSchema()}
    >{(formik: FormikProps<Krav>) => {
      return (
        <Form onKeyDown={disableEnter}>
          <Block>

            <InputField label='Navn' name='navn'/>
            <InputField label='Beskrivelse' name='beskrivelse'/>
            <InputField label='Utdypende beskrivelse' name='utdypendeBeskrivelse'/>
            <InputField label='Hensikt' name='hensikt'/>

            <MultiInputField label='Dokumentasjon' name='dokumentasjon'/>
            <MultiInputField label='Relevante implementasjoner' name='implementasjoner'/>
            <MultiInputField label='Begreper' name='begreper'/>
            <MultiInputField label='Kontaktpersoner' name='kontaktPersoner'/>
            <MultiInputField label='Rettskilder' name='rettskilder'/>
            <MultiInputField label='Tagger' name='tagger'/>

            <InputField label='Avdeling' name='avdeling'/>
            <InputField label='Underavdeling' name='underavdeling'/>

          </Block>

          <Block>
            <Button type='button' kind='secondary' marginRight onClick={props.cancel}>Avbryt</Button>
            <Button type='submit'>Lagre</Button>
          </Block>
        </Form>
      )
    }}
    </Formik>
  )
}

const InputField = (props: {label: string, name: keyof Krav}) => (
  <Field name={props.name}>
    {(p: FieldProps) =>
      <FormControl label={props.label} error={p.meta.error}>
        <Input {...p.field}/>
      </FormControl>
    }
  </Field>
)

const MultiInputField = (props: {label: string, name: keyof Krav}) => {
  const [val, setVal] = useState('')
  return (
    <FieldArray name={props.name}>{(p: FieldArrayRenderProps) => {
      const add = () => {
        p.push(val);
        setVal('')
      }
      const onKey = (e: React.KeyboardEvent) => (e.key === 'Enter' && val) && add()

      return (
        <FormControl label={props.label} error={p.form.errors[props.name]}>
          <Block>
            <Input onKeyDown={onKey} value={val}
                   onChange={e => setVal((e.target as HTMLInputElement).value)}
                   endEnhancer={() => <Button type='button' onClick={add}><FontAwesomeIcon icon={faPlus}/> </Button>}
            />
            {renderTagList(p.form.values[props.name] as string[], p.remove)}
          </Block>
        </FormControl>
      )
    }}
    </FieldArray>
  )
}

const kravSchema = () => {
  return yup.object<Krav>()
}
