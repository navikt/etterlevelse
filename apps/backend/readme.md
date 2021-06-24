# Backend for Etterlevelse

#### Requirements

 * JDK 16
 * Docker
 * Maven
  
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
