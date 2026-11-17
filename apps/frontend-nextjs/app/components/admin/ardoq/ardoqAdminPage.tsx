'use client'

import { Button, Heading, InfoCard, TextField } from '@navikt/ds-react'
import { useState } from 'react'
import {
  exportToArdoqEtterlevelseDokumentData,
  exportToArdoqSystemRelasjon,
} from '@/api/ardoq/ardoqApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { env } from '@/util/env/env'

const ArdoqAdminPage = () => {
  const [rawRequestString, setRawRequestString] = useState<string>('')

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
              className='w-full'
            />
          </div>

          <Button
            className='mt-8'
            disabled={rawRequestString === '' && env.isDev}
            variant='secondary'
            onClick={() => {
              console.debug(rawRequestString)
            }}
          >
            Sync
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
export default ArdoqAdminPage
