
# Migrering av data ut av generic storage

## Dato

20.02.2025

## Kontekst
Vi har mye forskjellige data type i generic storage. Dette gjør at det er vanskelig å lage database relasjoner på de.
Eks. på data typene i generic storage
- krav
- etterlevelse dokumentasjon
- krav tilbakemelding
- system varsel
- osv.

  Hoved brukeren vår vil ikke merke noe forskje.


## Beslutning
Lage egen dedikert tabell for hver av data typene i generic storage

## Status
Pågående

## Konsekvenser
MINUS
- vi også migrere/lage logikk på dataene vi har i audit log

PLUSS
+ Lettere å ha foregn key på database modell
+ Lettere feilhåndtering av relasjonene når CRUD(create, read, update, delete) operasjoner blir brukt
