# Regler for oppretting og håndtering av etterlevelsesdokumentasjon og PVK

## Dato

15.04.2026

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
7. Når PVO har vurdert PVK-en, gir de én av følgende tilbakemeldinger. Etterlever **skal** lese tilbakemeldingen, ta stilling til kommentarene og gjøre nødvendige endringer før PVK-en sendes videre til risikoeier for godkjenning. Dersom PVO mener PVK-en trenger mer arbeid (`VURDERT_AV_PVO_TRENGER_MER_ARBEID`), skal etterlever sende PVK-en tilbake til PVO for revurdering (`SENDT_TIL_PVO_FOR_REVURDERING`) — og PVK-en kan ikke gå videre til risikoeier uten at PVO er fornøyd.

   | PVOs vurdering                       | Hva etterlever skal gjøre                                                                                                                                                                                                               |
   | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | **Dette er en god PVK**              | Les og ta stilling til tilbakemeldinger, gjør eventuelle endringer – send deretter PVK-en til risikoeier for godkjenning.                                                                                                               |
   | **PVK-en er stort sett bra**         | Les og ta stilling til tilbakemeldinger, gjør eventuelle endringer – send deretter PVK-en til risikoeier for godkjenning.                                                                                                               |
   | **PVK-en har noen mangler**          | Ta stilling til kommentarene og gjør endringer. PVO forutsetter at endringene er gjort før PVK-en sendes til risikoeier.                                                                                                                |
   | **PVK-en har en hel del mangler**    | Ta stilling til kommentarene og gjør nødvendige endringer. Det anbefales at behandlingen ikke starter, eller stoppes, inntil endringene er utført og PVK-en er sendt til risikoeier.                                                    |
   | **PVK-en har grunnleggende mangler** | Ta stilling til kommentarene og gjør nødvendige endringer. Behandlingen bør stoppes inntil endringene er utført. PVO ber om at risikoeier ikke godkjenner PVK-en før dette er gjort. PVO kan eskalere saken til nødvendig ledelsesnivå. |

   PVO kan i tillegg angi om de vil følge opp endringene etterlever gjør, eller om de ønsker å få PVK-en i retur etter at etterlever har gjennomgått tilbakemeldingene.

### Statusflyt for PVK

PVK-dokumentet følger denne statusflyten:

1. `UNDERARBEID` – Etterlever fyller ut PVK
2. `SENDT_TIL_PVO` – PVK er sendt til personvernombudet (PVO) for vurdering
3. `PVO_UNDERARBEID` – PVO behandler innsendt PVK
4. `VURDERT_AV_PVO` – PVO har gitt tilbakemelding
5. `VURDERT_AV_PVO_TRENGER_MER_ARBEID` – PVO ønsker å få PVK-en i retur for ytterligere gjennomgang
6. `SENDT_TIL_PVO_FOR_REVURDERING` – Etterlever sender revidert PVK tilbake til PVO
7. `TRENGER_GODKJENNING` – Klar for risikoeiers godkjenning
8. `GODKJENT_AV_RISIKOEIER` – Risikoeier har godkjent restrisiko og PVK er ferdigstilt

**Merknader til statusflyten:**

- Statusen `VURDERT_AV_PVO_TRENGER_MER_ARBEID` settes når PVO markerer at de ønsker PVK-en i retur (`vilFaPvkIRetur = true`). I dette tilfellet **skal** etterlever gjennomgå tilbakemeldingen, gjøre nødvendige endringer og sende PVK-en tilbake til PVO for revurdering (`SENDT_TIL_PVO_FOR_REVURDERING`). PVK-en kan ikke gå videre til `TRENGER_GODKJENNING` uten at PVO har kvittert ut revurderingen. Merk: det er `vilFaPvkIRetur`-flagget — ikke selve vurderingsteksten — som avgjør om PVO vil ha PVK-en i retur.

- Dersom etterlevelsesdokumentasjonen er på **versjon 2 eller høyere**, noe som innebærer at PVK allerede er godkjent av risikoeier (`GODKJENT_AV_RISIKOEIER`), kan etterlever sende oppdateringer direkte til risikoeier for godkjenning — uten at PVK-en må innom PVO på nytt. Dersom endringene er av en slik karakter at det er faglig behov for ny PVO-vurdering, **skal** etterlever likevel sende PVK-en til PVO til en ny vurdering.

### Ansvar

| Rolle                                  | Ansvar                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Etterlever (behandlingsansvarlig team) | Opprette etterlevelsesdokument, fylle ut og sende PVK til PVO, ta stilling til PVOs tilbakemelding og gjøre nødvendige endringer |
| Personvernombudet (PVO)                | Gi tilbakemelding på PVK                                                                                                         |
| Risikoeier                             | Godkjenne restrisiko og PVK                                                                                                      |

## Status

Besluttet og implementert.

## Konsekvenser

PLUSS

- Klare regler gjør det enklere for etterlevere å vite hva de skal gjøre og når
- Vi unngår duplisering av dokumenter og tvetydighet rundt eierskap
- Reglene er i tråd med GDPR-kravene og etterlevelsesrammeverket
- Enklere å validere og håndheve reglene teknisk i løsningen

MINUS

- Strenge regler kan oppleves som byrdefulle for team med mange behandlinger
- Reglene forutsetter at Behandlingskatalogen er oppdatert og korrekt
