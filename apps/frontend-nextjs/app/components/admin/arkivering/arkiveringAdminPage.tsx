'use client'

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  InfoCard,
  List,
  Radio,
  RadioGroup,
  TextField,
} from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { arkiver } from '@/api/p360/p360Api'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { UpdateMessage } from '../common/commonComponents'

const ArkiveringAdminPage = () => {
  const [etterlevelseDokumentasjonId, setEtterlevelseDokumentasjonId] = useState<string>('')
  const [responsiblePerson, setResponsiblePerson] = useState<string | undefined>('')

  const [updateMessage, setUpdateMessage] = useState('')
  const [isError, setIsError] = useState<boolean>(false)

  const [checkboxValue, setCheckboxValue] = useState<string[]>(['onlyActiveKrav'])
  const [radioValue, setRadioValue] = useState<string>('')

  const onlyActiveKrav = checkboxValue.includes('onlyActiveKrav')
  const forPvoNaarDeSenderTilbakemeldingTilPvo = radioValue === 'forPvo'
  const forGodkjenningAvPvkDokument = radioValue === 'forPvk'
  const forGodkjenningAvEtterlevelsesDokument = radioValue === 'forEtterlevelseDoc'

  return (
    <PageLayout pageTitle='Administrere P360 arkivering' currentPage='Administrere P360 arkivering'>
      <Heading size='medium' level='1'>
        Administrere P360 arkivering
      </Heading>

      <InfoCard data-color='info' className='my-4 '>
        <InfoCard.Header>
          <InfoCard.Title>Infomarsjon om arkivering</InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          Informasjon av bruk for manuel arkivering
          <List as='ul' className='mb-2'>
            <List.Item>
              Alle automatisk akrivering vi kjører tar kun aktiv krav (
              <span className='text-fuchsia-600'>only Active krav</span> på)
            </List.Item>
          </List>
        </InfoCard.Content>
      </InfoCard>

      <div className='mt-5 w-full'>
        <div className='flex items-start'>
          <div className='w-full mr-3'>
            <TextField
              label='Slett etterlevelse dokumentasjon med uid'
              placeholder='Etterlevelse dokumentasjon UID'
              value={etterlevelseDokumentasjonId}
              onChange={(e) => setEtterlevelseDokumentasjonId(e.target.value)}
              className='w-full'
            />

            <TextField
              label='Responsible person ident'
              placeholder='skriv ident'
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              className='w-full mt-3'
            />

            <CheckboxGroup
              className='mt-3'
              legend='arkivering settings'
              onChange={setCheckboxValue}
              value={checkboxValue}
            >
              <Checkbox value='onlyActiveKrav'>only Active krav</Checkbox>
            </CheckboxGroup>

            <RadioGroup
              className='mt-3'
              legend={
                <div className='flex gap-5'>
                  Velg hvem du arkiverer for:
                  {radioValue !== '' && (
                    <Button
                      type='button'
                      variant='secondary'
                      size='xsmall'
                      onClick={() => {
                        setRadioValue('')
                      }}
                    >
                      Nullstill valg
                    </Button>
                  )}
                </div>
              }
              value={radioValue}
              onChange={setRadioValue}
            >
              <Radio value='forPvo'>for Pvo når de sender tilbakemeldingr</Radio>
              <Radio value='forPvk'>for godkjenning av PvkDokument</Radio>
              <Radio value='forEtterlevelseDoc'>for godkjenning av etterlevelsesDokument</Radio>
            </RadioGroup>
          </div>

          <Button
            className='mt-8'
            disabled={!etterlevelseDokumentasjonId}
            variant='secondary'
            onClick={() => {
              setUpdateMessage('')
              arkiver(
                etterlevelseDokumentasjonId,
                onlyActiveKrav,
                forPvoNaarDeSenderTilbakemeldingTilPvo,
                forGodkjenningAvPvkDokument,
                forGodkjenningAvPvkDokument ? true : forGodkjenningAvEtterlevelsesDokument,
                responsiblePerson === '' || responsiblePerson === undefined
                  ? undefined
                  : responsiblePerson
              )
                .then(() => {
                  setIsError(false)
                  setUpdateMessage(
                    'Arkivering vellykket for etterlevelses med uid: ' + etterlevelseDokumentasjonId
                  )
                  setEtterlevelseDokumentasjonId('')
                  setCheckboxValue([])
                  setResponsiblePerson(undefined)
                })
                .catch((e: AxiosError<{ message?: string }>) => {
                  setIsError(true)
                  setUpdateMessage(
                    `Arkivering mislykket, error: ${e.status}, ${e.response?.data.message}`
                  )
                })
            }}
          >
            arkiver
          </Button>
        </div>
      </div>
      <UpdateMessage message={updateMessage} isError={isError} />
    </PageLayout>
  )
}
export default ArkiveringAdminPage
