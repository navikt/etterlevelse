import {Behandling, Etterlevelse, EtterlevelseStatus} from '../../constants'
import {Field, FieldProps, Form, Formik, FormikProps} from 'formik'
import {createEtterlevelse, mapToFormVal, updateEtterlevelse} from '../../api/EtterlevelseApi'
import {disableEnter} from '../common/Table'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React from 'react'
import * as yup from 'yup'
import {etterlevelseStatus} from '../../pages/EtterlevelsePage'
import {BoolField, DateField, MultiInputField, OptionField, TextAreaField} from '../common/Inputs'
import {theme} from '../../util'
import {FormControl} from 'baseui/form-control'
import {Select} from 'baseui/select'
import {useKrav, useSearchKrav} from '../../api/KravApi'
import {kravName} from '../../pages/KravPage'
import {behandlingName, useBehandling, useSearchBehandling} from '../../api/BehandlingApi'

export const EditEtterlevelse = ({etterlevelse, close}: {etterlevelse: Etterlevelse, close: (k?: Etterlevelse) => void}) => {

  const submit = async (etterlevelse: Etterlevelse) => {
    if (etterlevelse.id) {
      close(await updateEtterlevelse(etterlevelse))
    } else {
      close(await createEtterlevelse(etterlevelse))
    }
  }

  return (
    <Formik
      onSubmit={submit}
      initialValues={mapToFormVal(etterlevelse)}
      validationSchema={etterlevelseSchema()}
    >{({values, isSubmitting}: FormikProps<Etterlevelse>) => (
      <Form onKeyDown={disableEnter}>
        <Block>

          <SearchBehandling id={values.behandlingId}/>
          <SearchKrav kravNummer={values.kravNummer} kravVersjon={values.kravVersjon}/>

          <Block height={theme.sizing.scale600}/>

          <BoolField label='Etterleves' name='etterleves'/>
          <TextAreaField label='Begrunnelse' name='begrunnelse'/>
          <MultiInputField label='Dokumentasjon' name='dokumentasjon'/>

          <Block height={theme.sizing.scale600}/>

          <DateField label='Frist for ferdigstillelse' name='fristForFerdigstillelse'/>

          <Block height={theme.sizing.scale600}/>

          <OptionField label='Status' name='status' options={Object.values(EtterlevelseStatus).map(id => ({id, label: etterlevelseStatus(id)}))}/>

        </Block>

        <Block display='flex' justifyContent='flex-end'>
          <Button type='button' kind='secondary' marginRight onClick={close}>Avbryt</Button>
          <Button type='submit' disabled={isSubmitting}>Lagre</Button>
        </Block>
      </Form>
    )}
    </Formik>
  )
}

const etterlevelseSchema = () => {
  return yup.object({})
}

export const SearchKrav = (props: {kravNummer: number, kravVersjon: number}) => {
  const [results, setSearch, loading] = useSearchKrav()
  const [krav, setKrav] = useKrav(props, true)

  return (
    <Field name={'kravNummer'}>
      {(p: FieldProps<string>) => {
        return <FormControl label={'Krav'} error={p.meta.error}>
          <Select
            placeholder={'Søk krav'}
            maxDropdownHeight='400px'
            filterOptions={o => o}
            searchable
            noResultsMsg='Ingen resultat'

            options={results.map(k => ({id: k.id, label: kravName(k)}))}
            value={krav ? [{id: krav.id, label: kravName(krav)}] : []}
            onChange={({value}) => {
              const kravSelect = value.length ? results.find(k => k.id === value[0].id)! : undefined
              setKrav(kravSelect)
              p.form.setFieldValue('kravNummer', kravSelect?.kravNummer)
              p.form.setFieldValue('kravVersjon', kravSelect?.kravVersjon)
            }}
            onInputChange={event => setSearch(event.currentTarget.value)}
            isLoading={loading}
          />
        </FormControl>
      }
      }
    </Field>
  )
}

export const SearchBehandling = (props: {id: string}) => {
  const [results, setSearch, loading] = useSearchBehandling()
  const [behandling, setBehandling] = useBehandling(props.id)

  return (
    <Field name={'behandlingId'}>
      {(p: FieldProps<string>) => {
        return <FormControl label={'Behandling'} error={p.meta.error}>
          <Select
            placeholder={'Søk behandling'}
            maxDropdownHeight='400px'
            filterOptions={o => o}
            searchable
            noResultsMsg='Ingen resultat'

            options={results.map(k => ({id: k.id, label: behandlingName(k)}))}
            value={behandling ? [{id: behandling.id, label: behandlingName(behandling)}] : []}
            onChange={({value}) => {
              const select = value.length ? results.find(k => k.id === value[0].id)! : undefined
              setBehandling(select)
              p.form.setFieldValue('behandlingId', select?.id)
            }}
            onInputChange={event => setSearch(event.currentTarget.value)}
            isLoading={loading}
          />
        </FormControl>
      }
      }
    </Field>
  )
}
