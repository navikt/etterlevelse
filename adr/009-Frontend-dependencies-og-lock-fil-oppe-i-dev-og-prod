# 250730 Dersom dev og prod feiler

Hvis disse feiler, kan det være vanskelig å vite hvilke av frontend eller backend som feiler.

## Er det frontend?

Dersom det feiler i dev og prod, men ikke feiler lokalt, kan det bety at det er en frontend feil.

Per nå, siden vi ikke har yarn.lock filen inkludert i dev og prod, kan det være lurt å teste med å inkludere denne i dev.

Første steg er å inkludere yarn.lock fil ved å gå til .ignore i øverste led og fjerne yarn.lock fra den, og dytte det til dev.
Dersom dev fungerer igjen, vet vi dette;

1. Det er frontend som feiler
2. Det er en dependency som har fått en ny version som forårsaker feilen
3. Bygg dev og prod med fungerende versjon
4. Finn ut hvilken og løs problemet i ro og mak
5. Dytt de nye endringene

### Fremgangsmåte (gitt at vi går for tiltak 1)

1. Slukk brannen
   1. Legg inn yarn.lock fil i dev, bygg og prodsett slik at brukere kan bruke løsningen
2. Finn ut hvorfor det brant
   1. Gå gjennom dependencies i package.json og finn ut hvilken pakke som trigget feilen
3. Fjern yarn.lock fil i dev, og vente på neste gang det feiler for å fikse den nye feilen

### Tiltak 1

Tiltak gitt at vi velger å ikke ha yarn.lock filen i dev og prod (for vi trenger fortsatt en trigger på hva som feiler):

- Pros
  - Når dev og prod går ned, vi vet at noe er endret
- Cons
  - Oppdaterer package.json dependencies hver morgen
  - Før man går hjem for dagen (siste utvikler) må teste at løsningen fortsatt fungerer; helst i inkognito mode
  - Brukere kan ikke bruke løsningen

### Tiltak 2

Tiltak gitt at vi velger å ha yarn.lock filen i dev og prod, hvordan vet vi at det feiler?:

- Pros
  - Dev og prod vil ikke feile selv om det kommer nye versjoner
  - Brukere kan bruke løsningen
- Cons
  - Teknisk gjeld hvis vi glemmer å oppdatere pakker i package.json
