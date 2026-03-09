# Regler for oppretting og håndtering av etterlevelsesdokumentasjon og PVK

## Dato

09.03.2026

## Kontekst

Det er behov for å definere klare regler for hvordan etterlevelsesdokumentasjon og personvernkonsekvensvurdering (PVK) opprettes, redigeres, vurderes av PVO, godkjennes av risikoeier og versjoneres.

Etterlevelsesdokumentasjon brukes til å dokumentere at krav er oppfylt. Den kan knyttes til én eller flere behandlinger i Behandlingskatalogen, men det er ikke et krav at alle etterlevelsesdokumenter har en tilknyttet behandling i Behandlingskatalogen.

PVK er en grundig risikovurdering som gjøres for behandlinger der det er høy risiko for at folks rettigheter og friheter ikke ivaretas godt nok, jf. GDPR artikkel 35.

Systemet støtter i dag følgende PVK-vurderinger:

- `UNDEFINED` – Behov for PVK er ikke ennå vurdert (starttilstand)
- `SKAL_UTFORE` – PVK er nødvendig og skal gjennomføres
- `SKAL_IKKE_UTFORE` – PVK er vurdert til ikke å være nødvendig, med begrunnelse
- `ALLEREDE_UTFORT` – PVK er tidligere gjennomført og gjelder fortsatt

## Beslutning

### Regler for oppretting av etterlevelsesdokumentasjon

1. Etterlevelsesdokumentasjon **kan** opprettes uten tilknytning til en behandling i Behandlingskatalogen. Dersom dokumentasjonen gjelder én eller flere behandlinger, **skal** disse knyttes til etterlevelsesdokumentet.

2. Det er **teamet eller personene som er ansvarlige for å dokumentere etterlevelsen**, samt **seksjonen eller avdelingen som er ansvarlig for etterlevelsen**.

3. Etterlevelsesdokumentasjonen skal romme besvarelse av etterlevelseskravene, vurdering av om PVK er nødvendig, og risikoeiers godkjenning.

### Regler for oppretting av PVK

1. Etterlever **skal** vurdere om PVK er nødvendig for sin behandling. Vurderingen skal dokumenteres med en begrunnelse.
2. PVK **skal** opprettes dersom behandlingen er klassifisert som høy risiko iht. GDPR artikkel 35.
3. Dersom PVK **ikke** er nødvendig (`SKAL_IKKE_UTFORE`), skal etterlever dokumentere begrunnelsen i løsningen.
4. Dersom PVK **allerede er gjennomført og godkjent utenfor løsningen** (`ALLEREDE_UTFORT`), skal etterlever dokumentere dette i løsningen med en begrunnelse og lenke til eller referere til den eksisterende vurderingen.
5. Det er **ett PVK-dokument per etterlevelsesdokument**. Dersom et PVK-dokument allerede finnes for etterlevelsesdokumentet, vil systemet automatisk gjenbruke det eksisterende fremfor å opprette et nytt. Dette skjer i backend og er ikke synlig for brukeren.
6. PVK-dokumentet kan **ikke slettes** dersom dokumentasjonsarbeidet er påbegynt. Minimumskravet for at en PVK anses som påbegynt er at minst ett av følgende er oppfylt:
   - Det finnes minst ett risikoscenario med navn og beskrivelse (Identifisering av risikoscenarioer og tiltak)
   - Minst ett felt for involvering av eksterne er utfylt, dvs. involvering av representanter eller databehandlerrepresentanter (Involvering av eksterne)
   - Det er lagt inn en kommentar til PVO.
7. Dersom PVO vurderer at PVK-en trenger mer arbeid (`VURDERT_AV_PVO_TRENGER_MER_ARBEID`), **skal** etterlever gjennomgå PVOs tilbakemelding, gjøre nødvendige endringer og sende PVK-en tilbake til PVO for revurdering (`SENDT_TIL_PVO_FOR_REVURDERING`). PVK-en kan ikke gå videre til risikoeier for godkjenning uten at PVO er fornøyd med arbeidet.


### Statusflyt for PVK

PVK-dokumentet følger denne statusflyten:

1. `UNDERARBEID` – Etterlever fyller ut PVK
2. `SENDT_TIL_PVO` – PVK er sendt til personvernombudet (PVO) for vurdering
3. `PVO_UNDERARBEID` – PVO behandler innsendt PVK
4. `VURDERT_AV_PVO` – PVO har gitt tilbakemelding
5. `VURDERT_AV_PVO_TRENGER_MER_ARBEID` – PVO mener PVK trenger mer arbeid
6. `SENDT_TIL_PVO_FOR_REVURDERING` – Etterlever sender revidert PVK tilbake til PVO
7. `TRENGER_GODKJENNING` – Klar for risikoeiers godkjenning
8. `GODKJENT_AV_RISIKOEIER` – Risikoeier har godkjent restrisiko og PVK er ferdigstilt

**Merknader til statusflyten:**

- Dersom PVO setter status til `VURDERT_AV_PVO_TRENGER_MER_ARBEID`, **skal** etterlever gjennomgå tilbakemeldingen, gjøre nødvendige endringer og sende PVK-en tilbake til PVO for revurdering (`SENDT_TIL_PVO_FOR_REVURDERING`). PVK-en kan ikke gå videre til `TRENGER_GODKJENNING` uten at PVO er fornøyd med arbeidet.
- Dersom etterlevelsesdokumentasjonen er på **versjon 2 eller høyere** og PVK allerede er godkjent av risikoeier (`GODKJENT_AV_RISIKOEIER`), kan etterlever sende oppdateringer direkte til risikoeier for godkjenning — uten at PVK-en må innom PVO på nytt. Dersom endringene er av en slik karakter at det er faglig behov for ny PVO-vurdering, **kan** etterlever likevel velge å sende PVK-en til PVO før den sendes til risikoeier.

### Ansvar

| Rolle                                  | Ansvar                                                        |
| -------------------------------------- | ------------------------------------------------------------- |
| Etterlever (behandlingsansvarlig team) | Opprette etterlevelsesdokument, fylle ut og sende PVK til PVO |
| Personvernombudet (PVO)                | Gi tilbakemelding på PVK                                      |
| Risikoeier                             | Godkjenne restrisiko og ferdigstille PVK                      |

## Status

Under arbeid / til beslutning i teamet.

## Konsekvenser

PLUSS

- Klare regler gjør det enklere for etterlevere å vite hva de skal gjøre og når
- Vi unngår duplisering av dokumenter og tvetydighet rundt eierskap
- Reglene er i tråd med GDPR-kravene og etterlevelsesrammeverket
- Enklere å validere og håndheve reglene teknisk i løsningen

MINUS

- Strenge regler kan oppleves som byrdefulle for team med mange behandlinger
- Reglene forutsetter at Behandlingskatalogen er oppdatert og korrekt
