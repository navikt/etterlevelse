[![Backend](https://github.com/navikt/etterlevelse/workflows/Backend/badge.svg?branch=master)](https://github.com/navikt/etterlevelse/actions)
[![Frontend](https://github.com/navikt/etterlevelse/workflows/Frontend/badge.svg?branch=master)](https://github.com/navikt/etterlevelse/actions)


url for løsningen:
- prod: https://etterlevelse.ansatt.nav.no/
- dev: https://etterlevelse.ansatt.dev.nav.no/


Løsningen tar vare på versjoner av krav og etterlevelse dokumentasjon uten å slette data. Krav som ikke er aktive blir satt til utgått og etterlevelse dokumentasjon knyttet til de er bevart.

For å gjøre endringer kreves det innlogget bruker. Løsningen lagrer alle endringer av data med tid, dato og bruker.

Løsingen brukes kun internt i NAV og har disse rollene: 
  - Admin: Full tilgang til oppdatering og oppretting av kodeverk, krav, etterlevelse dokumentasjon, meldinger og info til bruker.
  - Kraveier: Tilgang til å opprette og oppdatere krav og etterlevelse dokumentasjon.
  - Bruker: Tilgang til å dokumentere etterlevelse.
