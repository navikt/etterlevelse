# Varlsinger i dev miljøet

## Dato

09.07.2024

## Kontekst
Per dags dato varsler vi via registrete adresser satt i varselmeldingene for krav og etterlevelsesdokumentasjon. Det varsles både i dev og i prod.
Vi gjøre masse testing og endringer i dev som han foresake til at vi ender opp med å spamme brukere med varslinger.


## Beslutning
Alle registrete adresse i varselmeldingen er overskrevet i dev.
- epost: teamdatajegerne@nav.no
- slack kanal: etterlevelse-dev-varslinger
- slack bruker: overstyres og sendes til slack kanal(etterlevelse-dev-varslinger)


## Status
Implementert.

## Konsekvenser
PLUSS
- Slipper å spamme brukere
- kan gjøre tester og endringer uten fare for å varsle ekte brukere

MINUS
- kan ikke slette meldinger for teamdatajegerne@nav.no grupper
- får ikke sendt til registrete adresser dersom man ønsker dette
