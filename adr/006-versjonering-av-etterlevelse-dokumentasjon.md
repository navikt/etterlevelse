# Versjonering av Etterlevelses dokumentasjon

## Dato

ikke bestemt ennå / WIP

## Kontekst
Vi trenger å få implementert versjoner for etterlevelses dokumentasjon, behandlingenslivsløp, og pvk dokument. 
Risikoeier må kunne bestemme om dokumentet er ferdigstilt og der etter må kunne lage versjon 1. (eller 2.) og i tillegg kunne arkivere til P360

Teknisk behovet vi har er:
- etterlevelren må kunne se tidligere versjon av dokumentet
- mulighet til å endre/forkaste versjons endringen
- Vi trenger versjonering for å sikre at dokumentasjon ikke overskrives over tid. Behovet forsterkes når PVK integreres i Støtte til etterlevelse.
- Vi må versjonere etterleverens dokumentasjon på etterlevelseskravene også når det ikke skal gjennomføres en PVK. Versjonen vil da inneholde etterleverens besvarelse av etterlevelseskravene, hvilken kravversjon som ble besvart, eventuell vurdering av at PVK ikke er nødvendig og risikoeiers godkjenning. At risikoeier skal godkjenne etterlevelsesdokumentasjonen følger av etterlevelsesrammeverket med HUKI-matrise som ble besluttet i d-møte et par år tilbake i tid.
- Når det gjennomføres en PVK vil en versjon inneholde etterleverens besvarelse av etterlevelseskravene, hvilken kravversjon som ble besvart, personvernkonsekvensvurderingen, behandlingens livsløp, hvilke råd personvernombudet ga, hvordan rådene ble innarbeidet av etterlever og risikoeiers godkjenning.
- Det bør være slik at det er risikoeier som låser en versjon ved godkjenning. Dette gjelder ikke bare PVK-delen av dokumentasjonen men også besvarelsen på etterlevelseskravene. Versjonen skal så arkiveres.
- Det bør være opp til etterlever om, og eventuelt når, det skal opprettes en ny versjon av dokumentasjonen.
- Etterlever, personvernombudet og risikoeier må enkelt kunne se de ulike versjonene og hva de inneholder, samt hvilke datoer disse gjelder for.
- Hvis et krav settes til utgått før ny versjon av etterlevelsesdokumentasjonen opprettes, skal ikke dette kravet være en del av dokumentasjonen.



## Beslutning
ennå ikke beslutett / WIP

## Status
Pågående

## Implementasjoner:
- Hard versjonering
  kopiere data og oppretter ny rad i databasen for versjon 2

- Soft versjonering
  ha et felt i dataene hvor vi lagrer dato for de forskjellige versjonene og bruke audit log til å se tilstanden på det basert på dato

- Lazy versjonering
  vi bruker P360 eller en annen løsning/system som tar vare på tidligere versjon


## Konsekvenser
PLUSS
- Hard versjonering
  - oppretter dedikerte rad/data som ikke på virker den forrige versjon

- Soft versjonering
  - enklere å implementere enn hard versjonering og ikke trenger migrering av data/modellen og relasjon

- Lazy versjonering
  - vi trenger ikke å implementere noe vanskelig logikk


MINUS
PLUSS
- Hard versjonering
  - vi må transformere/endre/migrere tabell dataene og relasjonene for å implementere dette

- Soft versjonering
  - er avheniging av audit loggen for å se tidligere versjonen
  - må lage logikk for å null stille endringene basert på audit loggen

- Lazy versjonering
  - ikke så bruker venlig da etterlevere må forholde seg i to app for å se tidligere versjon
