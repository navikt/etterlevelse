'use client'

import { getAuditByTableIdAndTimeStamp } from '@/api/audit/auditApi'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { Markdown } from '@/components/common/markdown/markdown'
import { ContentLayout } from '@/components/others/layout/content/content'
import NyttInnholdTag from '@/components/risikoscenario/common/NyttInnholdTag'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  IEtterlevelse,
  ISuksesskriterieBegrunnelse,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { ISuksesskriterie } from '@/constants/krav/kravConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import {
  getLabelForSuksessKriterie,
  getSuksesskriterieBegrunnelse,
} from '@/util/etterlevelseUtil/etterlevelseUtil'
import { Alert, BodyShort, Box, Heading, Label, ReadMore, Tag } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import EtterlevelseCard from '../../etterlevelseModal/etterlevelseCard'

type TProps = {
  etterlevelse: IEtterlevelse
  suksesskriterier: ISuksesskriterie[]
  tidligereEtterlevelser?: IEtterlevelse[]
  isBortfiltrert?: boolean
  previousVurdering?: IVurdering
}

export const EtterlevelseViewFields: FunctionComponent<TProps> = ({
  etterlevelse,
  suksesskriterier,
  tidligereEtterlevelser,
  isBortfiltrert,
  previousVurdering,
}) => {
  const user = useContext(UserContext)
  const [previousEtterlevelse, setPreviousEtterlevelse] = useState<IEtterlevelse>()

  useEffect(() => {
    ;(async () => {
      if (previousVurdering && user.isPersonvernombud() && !!etterlevelse) {
        await getAuditByTableIdAndTimeStamp(etterlevelse.id, previousVurdering.sendtDato).then(
          (audit) => {
            if (audit.length !== 0) {
              const previousData = (audit[0].data as { etterlevelseData: IEtterlevelse })
                .etterlevelseData
              setPreviousEtterlevelse(previousData)
            }
          }
        )
      }
    })()
  }, [previousVurdering, etterlevelse])

  return (
    <div>
      {(etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT ||
        etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
        <div className={'mb-12'}>
          <Alert className='mb-1' size='small' variant='info'>
            Dette kravet er dokumentert som ikke relevant 20.05.2022, og senere blitt bortfiltrert
          </Alert>
          <Label>Beskrivelse av hvorfor kraver er ikke relevant</Label>
          <BodyShort>{etterlevelse.statusBegrunnelse}</BodyShort>
        </div>
      )}

      <div className='flex w-full items-center mb-4'>
        <Label className='min-w-fit mt-3'>Hvilke suksesskriterier er oppfylt?</Label>
        {tidligereEtterlevelser && tidligereEtterlevelser.length > 0 && (
          <div className='flex w-full justify-end'>
            <EtterlevelseCard etterlevelse={tidligereEtterlevelser[0]} />
          </div>
        )}
      </div>

      {suksesskriterier.map((suksesskriterium, index) => {
        return (
          <div key={suksesskriterium.navn + '_' + index}>
            <KriterieBegrunnelse
              suksesskriterie={suksesskriterium}
              index={index}
              suksesskriterieBegrunnelser={etterlevelse.suksesskriterieBegrunnelser}
              previousEtterlevelse={previousEtterlevelse}
              totalSuksesskriterie={suksesskriterier.length}
              isBortfiltrert={isBortfiltrert}
            />
          </div>
        )
      })}

      {etterlevelse.changeStamp.lastModifiedDate && etterlevelse.changeStamp.lastModifiedBy && (
        <div className='pb-6 flex justify-end w-full'>
          <BodyShort>
            Sist utfylt: {moment(etterlevelse.changeStamp.lastModifiedDate).format('LL')} av{' '}
            {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
          </BodyShort>
        </div>
      )}
    </div>
  )
}

export const getSuksesskriterieStatus = (status: ESuksesskriterieStatus) => {
  switch (status) {
    case ESuksesskriterieStatus.IKKE_OPPFYLT:
      return (
        <Tag size='small' variant='warning'>
          Ikke oppfylt
        </Tag>
      )
    case ESuksesskriterieStatus.IKKE_RELEVANT:
      return (
        <Tag size='small' variant='info'>
          Ikke relevant
        </Tag>
      )
    case ESuksesskriterieStatus.OPPFYLT:
      return (
        <Tag size='small' variant='success'>
          Oppfylt
        </Tag>
      )
    default:
      return (
        <Tag size='small' variant='info'>
          Under arbeid
        </Tag>
      )
  }
}

type TKriterieBegrunnelseProps = {
  suksesskriterie: ISuksesskriterie
  index: number
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[]
  totalSuksesskriterie: number
  isBortfiltrert?: boolean
  previousEtterlevelse?: IEtterlevelse
}

const KriterieBegrunnelse: FunctionComponent<TKriterieBegrunnelseProps> = ({
  suksesskriterie,
  index,
  suksesskriterieBegrunnelser,
  totalSuksesskriterie,
  isBortfiltrert,
  previousEtterlevelse,
}) => {
  const user = useContext(UserContext)
  const suksesskriterieBegrunnelse = getSuksesskriterieBegrunnelse(
    suksesskriterieBegrunnelser,
    suksesskriterie
  )

  const [changesMade, setChangesMade] = useState<boolean>(false)

  useEffect(() => {
    if (previousEtterlevelse) {
      const previousBegrunnelse = getSuksesskriterieBegrunnelse(
        previousEtterlevelse.suksesskriterieBegrunnelser,
        suksesskriterie
      )

      setChangesMade(
        suksesskriterieBegrunnelse.suksesskriterieStatus !==
          previousBegrunnelse.suksesskriterieStatus ||
          suksesskriterieBegrunnelse.begrunnelse !== previousBegrunnelse.begrunnelse
      )
    }
  }, [previousEtterlevelse])

  return (
    <Box
      className='mb-4'
      borderColor='neutral-subtle'
      padding='space-8'
      borderWidth='3'
      borderRadius='8'
    >
      <div className='flex w-full lg:flex-row flex-col mb-2.5'>
        <BodyShort className='min-w-fit'>
          Suksesskriterium {index + 1} av {totalSuksesskriterie}
        </BodyShort>

        <div className='flex w-full lg:justify-end justify-normal'>
          {isBortfiltrert && <BodyShort className='text-text-danger'>Bortfiltert</BodyShort>}
          {!isBortfiltrert && suksesskriterieBegrunnelse.suksesskriterieStatus && (
            <BodyShort className='mb-1'>
              Status: {getSuksesskriterieStatus(suksesskriterieBegrunnelse.suksesskriterieStatus)}
            </BodyShort>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-4 mb-4'>
        <Heading size='xsmall' level='3'>
          {suksesskriterie.navn} &nbsp;&nbsp;{' '}
          {changesMade && user.isPersonvernombud() && <NyttInnholdTag />}
        </Heading>

        <ReadMore defaultOpen header='Utfyllende om kriteriet'>
          <Markdown source={suksesskriterie.beskrivelse} />
        </ReadMore>
      </div>

      {suksesskriterieBegrunnelse.veiledningsTekst && (
        <div className='my-5'>
          <Alert variant='info'>
            <Label>Navs tolkning av loven og besluttede praksiser i denne konteksten:</Label>
            <Markdown source={suksesskriterieBegrunnelse.veiledningsTekst} />
          </Alert>
        </div>
      )}

      {suksesskriterieBegrunnelse.veiledningsTekst2 && (
        <Alert variant='info'>
          <Label>Slik kan suksesskriteriet etterleves:</Label>
          <Markdown source={suksesskriterieBegrunnelse.veiledningsTekst2} />
        </Alert>
      )}

      <ContentLayout>
        {!suksesskriterie.behovForBegrunnelse && (
          <div className='w-full mt-8 '>
            <Label>Suksesskriteriet har ikke behov for begrunnelse.</Label>
          </div>
        )}

        {suksesskriterie.behovForBegrunnelse && (
          <div className='w-full mt-8 '>
            <LabelAboveContent
              fullWidth
              title={getLabelForSuksessKriterie(suksesskriterieBegrunnelse.suksesskriterieStatus)}
              markdown={
                suksesskriterieBegrunnelse.begrunnelse
                  ? suksesskriterieBegrunnelse.begrunnelse
                  : 'Ingen begrunnelse'
              }
            />
          </div>
        )}
      </ContentLayout>
    </Box>
  )
}

export default EtterlevelseViewFields
