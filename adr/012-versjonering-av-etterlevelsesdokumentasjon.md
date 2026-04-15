# Versjonering av etterlevelsesdokumentasjon

## Dato

15.04.2026

## Kontekst

Etterlevelsesdokumentasjonen må versjoneres for å sikre at dokumentasjon ikke overskrives over tid, og for å gi et sporbart bilde av hva som var gjeldende dokumentasjon på et gitt tidspunkt. Behovet gjelder besvarelse av etterlevelseskravene, eventuell PVK, og risikoeiers godkjenning.

Tre tilnærminger ble vurdert:

- **Hard versjonering** – opprette en ny rad i databasen per versjon (full kopi av alle data)
- **Soft versjonering** – bruke et versjonsnummerfelt og lagre tilstandssnapshoter, med støtte fra audit-loggen for historikk
- **Lazy versjonering** – overlate arkivering til et eksternt system (f.eks. P360)

Hard versjonering gir god dataisolasjon, men krever migrering av tabellstruktur og relasjoner. Lazy versjonering er tungvint for brukerne. Soft versjonering med et snapshotmønster ble valgt som en balansert løsning.

## Beslutning

Versjonering implementeres som **soft versjonering** direkte i etterlevelsesdokumentets eksisterende rad i databasen. Versjonslogikken er innebygd i JSON-datafeltet (`DATA`-kolonnen) på `ETTERLEVELSE_DOKUMENTASJON`-tabellen.

### Datamodell

Feltet `etterlevelseDokumentVersjon` (heltall, starter på 1) angir gjeldende versjonsnummer. Hvert dokument har i tillegg en liste `versjonHistorikk` av `EtterlevelseVersjonHistorikk`-objekter, ett per godkjent versjon, med følgende felter:

| Felt                      | Beskrivelse                                                |
| ------------------------- | ---------------------------------------------------------- |
| `versjon`                 | Versjonsnummeret dette historikkelementet gjelder          |
| `godkjentAvRisikoeier`    | Navn på risikoeier som godkjente                           |
| `godkjentAvRisikoierDato` | Tidspunkt for godkjenning                                  |
| `nyVersjonOpprettetDato`  | Tidspunkt da etterlever opprettet neste versjon            |
| `kravTilstandHistorikk`   | Snapshot av kravstatus per tema på godkjenningstidspunktet |

`KravTilstandHistorikk` inneholder per tema: antall krav under arbeid, ferdig utfylt, og antall suksesskriterier i ulike tilstander (under arbeid, oppfylt, ikke oppfylt, ikke relevant).

### Statusflyt for etterlevelsesdokumentet

Etterlevelsesdokumentet har følgende statuser knyttet til versjonssyklusen:

1. `UNDER_ARBEID` – Etterlever fyller ut dokumentasjonen (starttilstand og tilstand mellom versjoner)
2. `SENDT_TIL_GODKJENNING_TIL_RISIKOEIER` – Etterlever har sendt dokumentet til risikoeier for godkjenning
3. `GODKJENT_AV_RISIKOEIER` – Risikoeier har godkjent dokumentet; versjonen er låst

### Regler for godkjenning og ny versjon

1. Kun **risikoeier** (en person registrert i `risikoeiere`-feltet) kan godkjenne dokumentet. Godkjenning er bare mulig når status er `SENDT_TIL_GODKJENNING_TIL_RISIKOEIER`.
2. Dersom dokumentet har en PVK med `SKAL_UTFORE`, **må** PVK-dokumentet også ha status `GODKJENT_AV_RISIKOEIER` før etterlevelsesdokumentet kan godkjennes.
3. Ved godkjenning lagres risikoeiers navn, tidspunkt og et kravstatussnapshot (`kravTilstandHistorikk`) i `versjonHistorikk` for gjeldende versjonsnummer.
4. Kun **teammedlemmer, registrerte ressurser** på dokumentet, eller **administratorer** kan opprette en ny versjon.
5. Ny versjon kan bare opprettes når status er `GODKJENT_AV_RISIKOEIER` — og hvis PVK er `SKAL_UTFORE`, må PVK også være `GODKJENT_AV_RISIKOEIER`.
6. Når ny versjon opprettes, økes `etterlevelseDokumentVersjon` med 1, status settes tilbake til `UNDER_ARBEID`, og et nytt tomt `EtterlevelseVersjonHistorikk`-element legges til i `versjonHistorikk`. Tidspunktet for ny versjon settes på det forrige historikkelementet.

### Tilknytning til PVK

Når en ny versjon av etterlevelsesdokumentet opprettes, oppdateres PVK-dokumentets innsendinger og PVOs vurderinger med det nye versjonsnummeret. Dette gjør at det er sporbart hvilke PVO-innsendinger og vurderinger som hører til hvilken versjon av dokumentet.

## Status

Besluttet og implementert.

## Konsekvenser

PLUSS

- Enkel implementering uten behov for migrering av tabellstruktur eller relasjoner
- Versjonsnummer og historikk er alltid tilgjengelig direkte på dokumentobjektet
- Kravstatusen på godkjenningstidspunktet er sporbar per versjon
- PVK-innsendinger er koblet til riktig dokumentversjon

MINUS

- Det er ingen fullstendig arkivering av selve dokumentinnholdet (kravbesvarelsene) per versjon — kun et snapshot av kravstatusene lagres
- Historikk mellom versjoner baserer seg på audit-loggen og er ikke eksplisitt tilgjengelig i applikasjonen uten videre
