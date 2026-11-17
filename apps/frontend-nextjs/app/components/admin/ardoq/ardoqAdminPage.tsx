'use client'

import { Button, Heading, InfoCard, TextField } from '@navikt/ds-react'
import { useState } from 'react'
import * as yup from 'yup'
import {
  exportToArdoqEtterlevelseDokumentData,
  exportToArdoqSystemRelasjon,
  syncArdoqDataWithEtterlevelsesDokument,
} from '@/api/ardoq/ardoqApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IArdoqSyncData, IRawArdoqJsonData } from '@/constants/admin/ardoq/ardoqAdminConstants'
import { env } from '@/util/env/env'

const rawArdoqJsonSchema: yup.ObjectSchema<IRawArdoqJsonData> = yup.object({
  ardoq_id: yup.string().defined(),
  system_name: yup.string().defined(),
  dokumentnavn: yup.string().defined(),
  etterlevelses_dokument_nummer: yup.string().defined(),
  antall_krav: yup.number().defined(),
  krav_ferdig: yup.number().defined(),
  krav_ikke_startet: yup.number().defined(),
  krav_under_arbeid: yup.number().defined(),
  link_til_etterlevelses_dokument: yup.string().defined(),
})

const rawArdoqJsonArraySchema = yup.array().of(rawArdoqJsonSchema).defined()

const ArdoqAdminPage = () => {
  const [rawRequestString, setRawRequestString] = useState<string>('')
  const [rawRequestError, setRawRequestError] = useState<string>()

  const handleSync = async () => {
    setRawRequestError(undefined)
    try {
      const parsed: unknown = JSON.parse(rawRequestString)
      const rawRequestData: IRawArdoqJsonData[] = rawArdoqJsonArraySchema.validateSync(parsed, {
        strict: true,
      })

      const ardoqSyncData: IArdoqSyncData[] = []

      rawRequestData.forEach((data) => {
        const dokumentId = data.link_til_etterlevelses_dokument.split('/dokumentasjon/')[1]
        if (!dokumentId) {
          throw new yup.ValidationError(
            'link_til_etterlevelses_dokument må inneholde /dokumentasjon/ etterfulgt av en dokument-ID.'
          )
        }
        ardoqSyncData.push({
          system_id: data.ardoq_id,
          etterlevelses_dokument_id: dokumentId,
        })
      })

      await syncArdoqDataWithEtterlevelsesDokument(ardoqSyncData)
    } catch (error) {
      if (error instanceof SyntaxError) {
        setRawRequestError('Ugyldig JSON.')
      } else if (error instanceof yup.ValidationError) {
        setRawRequestError(`Ugyldig Ardoq-data: ${error.message}`)
      } else {
        throw error
      }
    }
  }

  return (
    <PageLayout pageTitle='Administrere Ardoq systemer' currentPage='Administrere Ardoq systemer'>
      <Heading size='medium' level='1'>
        Administrere Ardoq systemer
      </Heading>

      <div className='mt-5 w-full'>
        <InfoCard data-color='info' className='my-4 '>
          <InfoCard.Header>
            <InfoCard.Title>Infomarsjon om bruk av ardoq admin funksjoner</InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            Disse funksjonene skal aldri brukes i DEV, det er derfor de er deaktivert dersom vi er i
            dev løsning. Årsaken til dette er at dev og prod er koblet til ardoq sin prod server,
            dette vil da ødelegge ardoq sin prod data dersom vi publisere dev data til de. Det er
            gjort check i backend også.
          </InfoCard.Content>
        </InfoCard>

        <div className='gap-3 flex mb-5'>
          <Button
            className='mt-8'
            disabled={env.isDev}
            variant='secondary'
            onClick={async () => {
              await exportToArdoqSystemRelasjon()
            }}
          >
            Send system relasjon data til ardoq
          </Button>

          <Button
            className='mt-8'
            disabled={env.isDev}
            variant='secondary'
            onClick={async () => {
              await exportToArdoqEtterlevelseDokumentData()
            }}
          >
            Send etterlevelse dokument data til ardoq
          </Button>
        </div>

        <div className='flex items-start'>
          <div className='w-full mr-3'>
            <TextField
              label='Ardoq raw json data'
              placeholder='Ardoq raw json data'
              onChange={(e) => setRawRequestString(e.target.value)}
              error={rawRequestError}
              className='w-full'
            />
          </div>

          <Button
            className='mt-8'
            disabled={rawRequestString === '' && env.isDev}
            variant='secondary'
            onClick={handleSync}
          >
            Sync
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
export default ArdoqAdminPage
