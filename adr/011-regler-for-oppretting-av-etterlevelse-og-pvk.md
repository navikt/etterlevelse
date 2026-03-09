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

1. Etterlevelsesdokumentasjon **skal** opprettes for alle behandlinger som er registrert i Behandlingskatalogen og er i aktiv bruk.

// **Kommentar:** Dette innrømmer ikke at du kan ha en etterlevelse som ikke bruker en behandling, som du faktisk kan. Ei heller at man kan ha med to eller flere behandlinger i samme etterlevelsesdokument.

2. Det er **ett etterlevelsesdokument per behandling**. Duplikater er ikke tillatt.

// **Feil:** Det er ikke 1:1 Behandling:Etterlevelsesdokument. Du kan ha 0:1, 1:1, 2:1 osv.

3. Det er **behandlingsansvarlig team** som oppretter og eier etterlevelsesdokumentasjonen.

// **Hva vil det si å være behandlingsansvarlig?**

4. Etterlevelsesdokumentasjonen skal romme besvarelse av etterlevelseskravene, vurdering av om PVK er nødvendig, og risikoeiers godkjenning.

### Regler for oppretting av PVK

1. Etterlever **skal** vurdere om PVK er nødvendig for sin behandling. Vurderingen skal dokumenteres med en begrunnelse.
2. PVK **skal** opprettes dersom behandlingen er klassifisert som høy risiko iht. GDPR artikkel 35, for eksempel ved:
   - Systematisk og omfattende profilering av personer
   - Behandling av særlige kategorier personopplysninger i stor skala
   - Systematisk overvåking av et offentlig tilgjengelig område i stor skala
3. Dersom PVK **ikke** er nødvendig (`SKAL_IKKE_UTFORE`), skal etterlever dokumentere begrunnelsen i løsningen.
4. Dersom PVK **allerede er gjennomført** (`ALLEREDE_UTFORT`), skal det lenkes til eller refereres til den eksisterende vurderingen.
5. Det er **ett PVK-dokument per etterlevelsesdokument**. Dersom et PVK-dokument allerede finnes for en behandling, skal det eksisterende gjenbrukes fremfor å opprette et nytt.
6. PVK-dokumentet kan **ikke slettes** dersom det finnes tilknyttede risikoscenarioer eller tiltak.
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
