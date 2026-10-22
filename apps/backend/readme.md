# Backend for Etterlevelse

#### Requirements

 * OpenJDK 25
 * Docker
 * Maven

For å bygge lokalt i Windows må man ha Docker desktop. Husk å legge til brukeren din i gruppen docker-users.

- run: `docker compose up -d`
- run `LocalAppStarter` under src/test/java/no/nav/data

## Kjøre fullstack lokalt (backend + frontend + kopi av dev-databasen)

Med dette oppsettet kjører backend, frontend og databasen på din egen maskin, med en kopi av dataene i dev.
Du kan teste endringer i både backend og frontend uten å påvirke dev.

### Hva du trenger

- JDK 25 (f.eks. `sdk install java 25.0.3-tem` med [SDKMAN](https://sdkman.io/))
- Maven, Docker, Node/yarn
- PostgreSQL-klientverktøy (`pg_dump`, `pg_restore`) versjon 16 eller nyere: `brew install postgresql@16`
- [nais CLI](https://doc.nais.io/operate/cli/) og `gcloud auth login`, og tilgang til databasen til `etterlevelse-backend` i dev

### 1. Start lokal database

```bash
cd apps/backend
docker compose up -d
```

Databasen kjører på `localhost:5433` (bruker `postgres`, passord `password`, database `etterlevelsedb`), og er kun tilgjengelig fra din egen maskin.

### 2. Kopier dev-databasen til lokal database

Terminal 1 – start en proxy mot dev-databasen og la den kjøre:

```bash
nais postgres proxy --reason "lokal kopi av dev" --port 5434 etterlevelse-backend --environment dev-gcp
```

Vi bruker port `5434`, fordi `5432` ofte er i bruk lokalt og `5433` brukes av databasen i docker.
Hvis du mangler tilgang: `nais postgres grant etterlevelse-backend --environment dev-gcp`.

Terminal 2 – ta en dump av dev og legg den inn lokalt (la passordet stå tomt for dev, bruk `password` lokalt):

```bash
pg_dump -h localhost -p 5434 -U <din-nav-epost> -d etterlevelsedb \
  -Fc --no-owner --no-acl -f ~/etterlevelse-dev.dump

pg_restore -h localhost -p 5433 -U postgres -d etterlevelsedb \
  --clean --if-exists --no-owner --no-acl ~/etterlevelse-dev.dump
```

Stopp proxyen (Ctrl+C) når dumpen er ferdig.

> **Viktig:** Dumpen inneholder ekte data fra dev (navn, NAV-identer m.m.). Lagre den utenfor repoet,
> og ikke del eller commit den. For å nullstille lokal database senere kjører du bare `pg_restore`-kommandoen på nytt.

### 3. Start backend

Alternativ A – fra terminal (fungerer likt for alle):

```bash
cd apps/backend
mvn test-compile exec:java -Dexec.mainClass=no.nav.data.LocalAppStarter -Dexec.classpathScope=test
```

Alternativ B – fra IntelliJ:

1. **File → Project Structure → Project**: sett SDK til JDK 25 og language level til 25.
2. Kjør `LocalAppStarter` (`src/test/java/no/nav/data`).

Alternativ C – fra Eclipse:

1. Bruk en Eclipse-versjon med støtte for Java 25.
2. Installer Lombok i Eclipse: kjør `java -jar ~/.m2/repository/org/projectlombok/lombok/<versjon>/lombok-<versjon>.jar`,
   velg Eclipse-installasjonen og restart Eclipse. Uten dette får du kompileringsfeil på alle Lombok-klasser.
3. **File → Import → Maven → Existing Maven Projects** og velg `apps/backend`.
4. **Preferences → Java → Installed JREs**: legg til JDK 25 og huk den av som standard.
   Sjekk at prosjektet bruker den under **Properties → Java Compiler** (compliance level 25).
5. Høyreklikk `LocalAppStarter` (`src/test/java/no/nav/data`) → **Run As → Java Application**.

Backend kjører på `localhost:8080`, og lytter kun på `127.0.0.1` (se `server.address` i `application-local.yml`),
slik at ingen andre på nettverket når den lokale admin-brukeren eller kopien av dev-dataene.

Med `local`-profilen:

- er Azure-innlogging slått av. [LocalConfig](src/test/java/no/nav/data/LocalConfig.java) logger alle requests inn som brukeren
  `FullStackLocal` (e-post `fullstacklocal@nav.no`) med alle roller. Vil du være en annen bruker (f.eks. for å se dokumenter der du selv har dokumentert krav under «Siste dokumentasjoner»),
  legg til `-Dlocal.user.ident=<NAV-ident> -Dlocal.user.name="Navn Navnesen"` (VM options i IntelliJ, VM arguments under **Run Configurations** i Eclipse, eller på slutten av mvn-kommandoen).
  E-post blir `<ident>@nav.no`, og kan overstyres med `-Dlocal.user.email=...`. Brukeren legges også inn i den mockede Teamkatalogen,
  slik at f.eks. tilbakemeldinger fungerer.
- er Teamkatalogen, Behandlingskatalogen og Slack mocket med WireMock, så team- og personoppslag viser testdata.
  «Mine dokumentasjoner» bygger på teamene dine fra Teamkatalogen, og viser derfor ikke dine ekte dokumenter lokalt.
  Personsøket i den mockede Teamkatalogen svarer bare på søkeordet `fam`, så du kan ikke legge til ekte personer på dokumenter.
  Søk etter behandlinger i den mockede Behandlingskatalogen gir ingen treff.
- svarer den mockede Slacken på oppslag av brukere med «Lokal Slack-bruker», slik at krav og dokumenter med Slack-brukere
  som varslingsadresse kan vises. Det sendes ingen meldinger til Slack.
- er Ardoq (systemer) mocket med fem fiktive systemer. Søk f.eks. på «lokal». Ardoq krever et hemmelig token, så det finnes
  ikke noe alternativ for å bruke Ardoq i dev lokalt. Dokumenter fra dev som allerede har systemer knyttet til seg, viser ikke navnet på dem.
- kjører backend som miljøet `dev-gcp` (`etterlev.security.env` i `application-local.yml`). Da brukes de samme faste
  avdelingene og seksjonene som i dev, i stedet for NOM, og e-post går til dev-adressen i stedet for ekte mottakere.

#### Bruke Teamkatalogen og Behandlingskatalogen i dev (for å teste f.eks. kraveier- og PVK-flyt)

Trenger du å legge til personer eller behandlinger på dokumenter, eller se dine egne team, kan backend bruke
Teamkatalogen og Behandlingskatalogen i dev i stedet for mockene. Det krever naisdevice.
Legg til disse VM options (eller på slutten av mvn-kommandoen):

```
-Dclient.teamcat.url=https://teamkatalog-api.intern.dev.nav.no -Dclient.behandlingskatalog.base-url=https://behandlingskatalog-backend.intern.dev.nav.no -Dlocal.user.ident=<NAV-ident> "-Dlocal.user.name=Fornavn Etternavn"
```

- Bytt ut `<NAV-ident>` med din egen ident (én bokstav og seks siffer), uten `<` `>`. Identen må finnes i Teamkatalogen i dev,
  ellers feiler oppslag på innlogget bruker (f.eks. tilbakemeldinger). Sjekk med
  `curl https://teamkatalog-api.intern.dev.nav.no/resource/<NAV-ident>`.
- Ha anførselstegn rundt hele `-Dlocal.user.name=...` når navnet inneholder mellomrom.
- Personsøk, team, «Mine dokumentasjoner» og søk etter behandlinger bruker da ekte data fra dev. Slack og Ardoq er fortsatt mocket.
  Finner du ikke en person på navn i søket, søk på NAV-identen i stedet.
- Du kan bruke bare én av dem: ta med `-Dclient.teamcat.url=...` og/eller `-Dclient.behandlingskatalog.base-url=...`.
- Fjern VM options og start på nytt for å gå tilbake til `FullStackLocal` og mockene.

### 4. Start frontend

```bash
cd apps/frontend-nextjs
yarn install
yarn dev --hostname 127.0.0.1
```

`--hostname 127.0.0.1` gjør at frontend kun er tilgjengelig fra din egen maskin. Uten den lytter Next.js på alle nettverksgrensesnitt,
og andre på nettverket kan nå backend (og dev-dataene) via `/api`-proxyen.

Åpne [http://localhost:3000](http://localhost:3000). Frontend sender `/api`-kall til `localhost:8080` i dev-modus.
Ikke kjør `kubectl port-forward` mot dev-backend samtidig, siden den også bruker port 8080.

### Vanlige feil

| Feil | Løsning |
| --- | --- |
| `bind: address already in use` når du starter proxyen | Bruk en annen port med `--port`, og samme port i `pg_dump`. |
| `Cannot compile module ... JVM target 25 ... SDK version 21` i IntelliJ | Sett Project SDK til JDK 25 (se steg 3). |
| `ClassNotFoundException`/`NoClassDefFoundError` når du kjører `LocalAppStarter`, eller 500-feil med et klassenavn (f.eks. `...$KravDataBuilder`) | Noe annet har overskrevet `target/classes`, typisk Java-utvidelsen i VS Code som bygger `apps/backend` automatisk. Lukk VS Code-vinduet med repoet, åpne bare `apps/frontend-nextjs` i VS Code, eller slå av **Language Support for Java** for workspacet. Kjør så **Build → Rebuild Project** og start på nytt. |
| `Could not find or load main class ...` | Mellomrom i VM options uten anførselstegn, f.eks. en plassholder som `<NAV-ident>` som ikke er byttet ut. |
| Samme feil i Eclipse | **Project → Clean...** og høyreklikk prosjektet → **Maven → Update Project**. |
| Kompileringsfeil på getters/builders (`cannot find symbol`) i Eclipse | Lombok er ikke installert i Eclipse (se steg 3, alternativ C). |
| Microsoft-innlogging med `AADSTS700016` | Backend kjører ikke, eller kjører uten `local`-profilen. Start via `LocalAppStarter`. |

#### Build 
`mvn clean package`

### Azure bruker trenger tilgang til


#### Azure scopes:
- Mail.Send - Delegated
#### Epostbruker
- Gi tilgang til epostbruker: teamkatalog@nav.no til app (dev/prod-fss:teamdatajegerne:etterlevelse-backend)
- Gi tilgang til epostinnlogging i azure
    - App-registrations -> finn app -> Authentication
        - Advanced settings -> Allow public client flows -> Enable the following mobile and desktop flows: Yes

