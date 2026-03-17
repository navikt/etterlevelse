import {
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { BodyLong, Heading, InfoCard, List } from '@navikt/ds-react'
import Link from 'next/link'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import EtterlevelsesDokumentasjonGodkjenningsHistorikk from '../common/etterlevelsesDokumentasjonGodkjenningsHistorikk'
import { SendTilRisikoeierGodkjenningReadOnly } from '../sendTilRisikoeierGodkjenningReadOnly/sendTilRisikoeierGodkjenningReadOnly'
import SendTilRisikoeierGodkjenningUnderArbeid from '../sendTilRisikoeierGodkjenningUnderArbeid/sendTilRisikoeierGodkjenningUnderArbeid'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
    }>
  >
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
}

const SendTilRisikoeierGodkjenning: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  params,
  setEtterlevelseDokumentasjon,
}) => {
  const user = useContext(UserContext)

  const [submitAlert, setSubmitAlert] = useState<string>('')
  const [saveSuccessful, setSaveSuccessful] = useState<boolean>(false)
  const [trekkInnsendingSuccessful, setTrekkInnsendingSuccessful] = useState<boolean>(false)

  const hasAccess =
    (etterlevelseDokumentasjon && etterlevelseDokumentasjon.hasCurrentUserAccess === true) ||
    user.isAdmin()

  const [pvkDokument, setPvkDokument] = useState<IPvkDokument | undefined>(undefined)

  useEffect(() => {
    if (etterlevelseDokumentasjon?.id) {
      getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
        .then(setPvkDokument)
        .catch(() => setPvkDokument(undefined))
    }
  }, [etterlevelseDokumentasjon?.id])

  const pvkBlocksSending =
    pvkDokument !== undefined &&
    pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
    pvkDokument.status !== EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER

  const submit = async (submitValues: IEtterlevelseDokumentasjon, skipSaveAlert?: boolean) => {
    await getEtterlevelseDokumentasjon(submitValues.id).then(async (response) => {
      if (response.status === EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER) {
        setSubmitAlert('Etterlevelsesdokument er allerede godkjent av risikoeier.')
      } else {
        const pvkDokument = await getPvkDokumentByEtterlevelseDokumentId(submitValues.id).catch(
          () => undefined
        )
        if (
          pvkDokument &&
          pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
          pvkDokument.status !== EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
          submitValues.status ===
            EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
        ) {
          setSubmitAlert(
            'Kan ikke sende til godkjenning når det finnes en personvernkonsekvensvurdering som ikke er ferdig.'
          )
        } else {
          const updatedEtterlevelseDokumentasjon = { ...response }
          updatedEtterlevelseDokumentasjon.status = submitValues.status
          updatedEtterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier =
            submitValues.meldingEtterlevelerTilRisikoeier

          await updateEtterlevelseDokumentasjon(updatedEtterlevelseDokumentasjon).then((resp) => {
            setEtterlevelseDokumentasjon(resp)
            if (!skipSaveAlert) setSaveSuccessful(true)
          })
        }
      }
    })
  }

  return (
    <div>
      <Heading level='1' size='large' className='mb-10'>
        Få etterlevelsen godkjent av risikoeier
      </Heading>
      {etterlevelseDokumentasjon.etterlevelseDokumentVersjon > 1 && (
        <EtterlevelsesDokumentasjonGodkjenningsHistorikk
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )}
      <Heading level='2' size='medium' className='mb-5'>
        Send til {etterlevelseDokumentasjon.etterlevelseDokumentVersjon === 1 ? '' : 'ny'}{' '}
        godkjenning
      </Heading>
      {pvkBlocksSending && (
        <InfoCard data-color='warning' className='mb-5 max-w-[75ch]' size='small'>
          <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
            <InfoCard.Title>
              Dere kan ikke sende etterlevelsen til risikoeier før deres PVK er ferdig godkjent.
            </InfoCard.Title>
          </InfoCard.Header>
        </InfoCard>
      )}
      {etterlevelseDokumentasjon.risikoeiere.length === 0 && (
        <InfoCard data-color='warning' className='my-5 max-w-[75ch]' size='small'>
          <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
            <InfoCard.Title>
              <div>
                <Heading spacing size='small' level='3'>
                  Denne etterlevelsen har ingen risikoeier
                </Heading>
                Risikoeier må legges til under{' '}
                <Link
                  target='_blank'
                  rel='noopener noreferrer'
                  href={`${etterlevelsesDokumentasjonEditUrl(params.etterlevelseDokumentasjonId)}#risikoeiereData`}
                  className='inline'
                >
                  Rediger dokumentegenskaper.
                </Link>{' '}
                Dere kan ikke sende etterlevelsen til godkjenning uten en utnevnt risikoeier.
              </div>
            </InfoCard.Title>
          </InfoCard.Header>
        </InfoCard>
      )}
      <BodyLong>
        Dere kan til enhver tid be risikoeier om å godkjenne etterlevelsesdokumentasjonen.
        Risikoeieren vil da godkjenne:
      </BodyLong>
      <List as='ul' className='max-w-[75ch]'>
        <List.Item>
          Dokumentasjon av alle etterlevelseskrav som er en del av etterlevelsesdokumentet på
          godkjenningstidspunktet. Dette gjelder også etterlevelseskrav som ikke er ferdigstilt.
        </List.Item>
        <List.Item>
          Svar på om det er nødvendig å gjennomføre PVK. Dette gjelder kun hvis dere har huket av
          for at personopplysninger behandles under Dokumentegenskaper.
        </List.Item>
      </List>
      <BodyLong className='mt-5'>
        Risikoeier vil kun godkjenne etterlevelsesdokumentet. Dersom det finnes et PVK-dokument, vil
        dette ikke være en del av denne godkjenningen.
        <br />
        <br />
        Når risikoeier godkjenner, arkiveres etterlevelsen og godkjenningen i Public 360.
      </BodyLong>

      {etterlevelseDokumentasjon.status === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID &&
        hasAccess && (
          <SendTilRisikoeierGodkjenningUnderArbeid
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            saveSuccessful={saveSuccessful}
            setSaveSuccessful={setSaveSuccessful}
            setSubmitAlert={setSubmitAlert}
            setTrekkInnsendingSuccessful={setTrekkInnsendingSuccessful}
            submit={submit}
            submitAlert={submitAlert}
            trekkInnsendingSuccessful={trekkInnsendingSuccessful}
            pvkBlocksSending={pvkBlocksSending}
          />
        )}
      {([
        EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER,
        EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER,
      ].includes(etterlevelseDokumentasjon.status) ||
        !hasAccess) && (
        <SendTilRisikoeierGodkjenningReadOnly
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          saveSuccessful={saveSuccessful}
          setSaveSuccessful={setSaveSuccessful}
          setSubmitAlert={setSubmitAlert}
          setTrekkInnsendingSuccessful={setTrekkInnsendingSuccessful}
          submit={submit}
          submitAlert={submitAlert}
          hasAccess={hasAccess}
        />
      )}
    </div>
  )
}

export default SendTilRisikoeierGodkjenning
