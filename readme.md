[![Backend](https://github.com/navikt/etterlevelse/workflows/Backend/badge.svg?branch=master)](https://github.com/navikt/etterlevelse/actions/workflows/etterlevelse-backend.yml)
[![Frontend](https://github.com/navikt/etterlevelse/workflows/Frontend/badge.svg?branch=master)](https://github.com/navikt/etterlevelse/actions/workflows/etterlevelse-frontend.yml)
[![Frontend-Nextjs](https://github.com/navikt/etterlevelse/workflows/Frontend/badge.svg?branch=master)](https://github.com/navikt/etterlevelse/actions/workflows/etterlevelse-frontend-nextjs.yml)

url for løsningen:

- prod: https://etterlevelse.ansatt.nav.no/
- dev: https://etterlevelse.intern.dev.nav.no
- dev: https://etterlevelse-nextjs.intern.dev.nav.no/

Når du tar en `git clone` må du velge `https`. Hvis du velger `ssh`, så vil `nais` klage på at du har en `ssh`-nøkkel på maskinen din, som vil medføre at du mister tilgang til `nais` ved at `azure` innlogging sier at innlogging var vellykket, men allikevel har du ikke tilgang.

Løsningen tar vare på versjoner av krav og etterlevelse dokumentasjon uten å slette data. Krav som ikke er aktive blir satt til utgått og etterlevelse dokumentasjon knyttet til de er bevart.

For å gjøre endringer kreves det innlogget bruker. Løsningen lagrer alle endringer av data med tid, dato og bruker.

Løsingen brukes kun internt i NAV og har disse rollene:

- Admin: Full tilgang til oppdatering og oppretting av kodeverk, krav, etterlevelse dokumentasjon, meldinger og info til bruker.
- Kraveier: Tilgang til å opprette og oppdatere krav og etterlevelse dokumentasjon.
- Bruker: Tilgang til å dokumentere etterlevelse.
