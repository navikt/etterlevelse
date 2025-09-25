'use client'

import { EtterlevelseDokumentasjonList } from '@/components/frontpage/EtterlevelseDokumentasjonList'
import { IPageResponse } from '@/constants/commonConstants'
import {
  TEtterlevelseDokumentasjonQL,
  TVariables,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { getEtterlevelseDokumentasjonListQuery } from '@/query/etterlevelseDokumentasjon/etterlevelseDokumentasjonQuery'
import { user } from '@/services/user/userService'
import { useQuery } from '@apollo/client/react'
import { Button, Heading, Skeleton } from '@navikt/ds-react'

export const MineSistDokumenterte = () => {
  const { data, loading: etterlevelseDokumentasjonLoading } = useQuery<
    { etterlevelseDokumentasjoner: IPageResponse<TEtterlevelseDokumentasjonQL> },
    TVariables
  >(getEtterlevelseDokumentasjonListQuery, {
    variables: { sistRedigert: 20 },
    skip: !user.isLoggedIn(),
  })

  return (
    <>
      {etterlevelseDokumentasjonLoading && (
        <div className='bg-white mt-8 p-8 shadow-md shadow-[#00000040]'>
          <Heading as={Skeleton} size='large'>
            Card-title
          </Heading>
          <Skeleton variant='text' width='100%' />
          <Skeleton variant='text' width='100%' />
        </div>
      )}

      {!etterlevelseDokumentasjonLoading && data?.etterlevelseDokumentasjoner.content && (
        <div className='bg-white mt-8 p-8 shadow-md shadow-[#00000040]'>
          {data?.etterlevelseDokumentasjoner.content.length === 0 && (
            <div>
              <Heading size='medium' level='2'>
                Etterlevelse i Nav
              </Heading>
              <span>
                For å dokumentere etterlevelse må du opprette et etterlevelsesdokument. Du vil da se
                hvilke krav som gjelder for din løsning og kan dokumentere hvordan løsningen
                etterlever kravene.
              </span>
            </div>
          )}
          {data?.etterlevelseDokumentasjoner.content.length !== 0 && (
            <EtterlevelseDokumentasjonList
              etterlevelseDokumentasjoner={data?.etterlevelseDokumentasjoner.content}
            />
          )}
          <div className='mt-8 flex justify-end'>
            <div className='mr-4'>
              <Button
                onClick={() => {
                  window.scrollTo(0, 0)
                  // ampli.logEvent('knapp klikket', {
                  //   tekst: 'Nytt etterlevelsesdokument fra forsiden',
                  // })
                  console.debug('navigate(etterlevelseDokumentasjonCreateUrl)')
                  //navigate(etterlevelseDokumentasjonCreateUrl)
                }}
                size='medium'
                variant={data?.etterlevelseDokumentasjoner.content.length ? 'secondary' : 'primary'}
                className='whitespace-nowrap ml-5'
              >
                Nytt etterlevelsesdokument
              </Button>
            </div>
            <Button
              variant='tertiary'
              className='underline hover:no-underline'
              onClick={() => {
                window.scrollTo(0, 0)
                // ampli.logEvent('navigere', {
                //   app: 'etterlevelse',
                //   kilde: 'forside-panel',
                //   til: etterlevelseDokumentasjonerUrl(),
                //   fra: '/',
                // })
                console.debug('navigate(etterlevelseDokumentasjonerUrl())')
                //navigate(etterlevelseDokumentasjonerUrl())
              }}
            >
              Alle etterlevelsesdokumenter
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
