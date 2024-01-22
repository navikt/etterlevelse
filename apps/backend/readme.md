# Backend for Etterlevelse

#### Requirements

 * OpenJDK 17
 * Docker
 * Maven

For å bygge lokalt i Windows må man ha Docker desktop. Husk å legge til brukeren din i gruppen docker-users.

- run: `docker compose up -d`
- run `LocalAppStarter` under src/test/java/no/nav/data

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

