# Migrere bort fra create-react-app

## Dato

16.10.2024

## Kontekst
Create-react-app er ikke lenger vedlikeholdt og dersom vi ejecter fra prosjektet vil løsningen knekkes helt. Det å oppdatere dependencies som ligger under panseret
til create-react-app og håndtere breaking changes vil ta alt for mye tid.


## Beslutning
Vi flytter frontend prosjektet til remix.js eller next.js

## Status
Besluttet med å gå for remix.js. Remix vil kreve mindre tilpassing både for prosjektet og utviklere

## Konsekvenser
PLUSS
+ Vi får bekvitte oss av sårbarheter pga utdaterte dependecies
+ Vi flytter over til et rammeverk som er mer oppdatert og vedlikeholdt
+ Vi trenger ikke å bruke mye tid til å tilpasset oss på det nye kode/mappe struktur

MINUS
- Vi må bruke litt tid til å bli vandt til den nye kode/mappe struktur
