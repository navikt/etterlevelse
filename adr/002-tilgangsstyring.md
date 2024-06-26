# Tilgangsstyring av etterlevelsesdokumenter

## Dato

26.06.2024

## Kontekst
Etterlevelsesdokumenter er i dag ikke tilgangsstyrte.
Vi har få eller ingen eksempler på at besvarelser er blitt endret av folk som ikke eier dokumentet.
Det er spesielt to grunner til at vi nå ser på tilgangsstyring:

- Vi legger opp til at produktteam og andre etterlevere kan gjenbruk vurderinger gjort i andre etterlevelsesdokumenter. 
Eksempelvis kan etterlevere gjenbruke vurderinger gjort av ResearchOps når de skal bruke Testlaben. 
Dokumentene som opprettes er da knyttet til et overordnet dokument.
Endringer i det overordna dokumentet vil da speiles ned til alle tilknytta dokumenter.
- Vi kommer til å lage funksjonalitet for at risikoeiere kan ta beslutninger i løsningen. 
Denne rollen må tilgangsstyres.

## Beslutning
Vi implementerer dette nå.

Etterlevere kan knytte team fra Teamkatalogen eller enkeltmedlemmer til etterlevelsesdokumenter.
Medlemmer trenger ikke å være del av et team i Teamkatalogen.
Disse medlemmene vil da ha tilgang til å kunne gjøre endringer i dokumentet. 

Alle som har skrivetilgang til dokumentet får samme rolle som medlem i dokumentet.

På sikt vil vi legge til rette for at noen av medlemmene får endret rolle til risikoeier, ref kulepunkt 2 under kontekst.

## Status
Under arbeid.

## Konsekvenser
PLUSS
- Kun de som skal redigere har muligheten til å gjøre det: Bedre dataintegritet
- Kun medlemmer av dokumentet kan åpne det for gjenbruk av andre
- Tydeligere eierskap til dokumentet ved at det eksplisitt ligger medlemmer inne
- Mindre forvirrende brukergrensesnitt for de som *ikke* eier et dokument. Eksempelvis skal kun de som eier et mordokument se knapper som er relevante for dem
- Mulighet for å senere legge til risikoeier som en egen rolle

MINUS
- For løsningen: Mer teknisk kompleksitet i løsningen
- For løsningen: Sterkere avhengighet til Teamkatalogen
- For etterleverne: Økt personavhengighet