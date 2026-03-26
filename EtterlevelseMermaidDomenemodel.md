# Etterlevelse – UML Architecture & Domain Model

**Date created:** 26 March 2026

---

## How to view Mermaid diagrams in VS Code

### Install the extension

1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows) or `Cmd+Shift+X` (Mac) to open the Extensions panel
3. Search for **"Mermaid"**
4. Install **"Markdown Preview Mermaid Support"** by Matt Bierner
   - Extension ID: `bierner.markdown-mermaid`

### Open and preview this file

| OS          | Steps                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| **Mac**     | Open this file → press `Cmd+Shift+V` to open Markdown Preview, or right-click the tab and choose **Open Preview**  |
| **Windows** | Open this file → press `Ctrl+Shift+V` to open Markdown Preview, or right-click the tab and choose **Open Preview** |

Alternatively, both platforms: click the **split preview** icon (📄 with magnifier) in the top-right corner of the editor when this file is open.

---

## System Architecture

```mermaid
graph TD
    subgraph FrontendNext["Frontend-NextJS (Next.js 14)"]
        NX_Pages["App Router Pages\n(Etterlevelse, Krav, PVK, PVO)"]
        NX_API["API Layer\n(axios + Apollo Client)"]
        NX_Pages --> NX_API
    end

    subgraph Backend["Backend (Spring Boot / Java)"]
        direction TB
        subgraph REST["REST Controllers"]
            C_ED["EtterlevelseDokumentasjonController"]
            C_Krav["KravController"]
            C_EL["EtterlevelseController"]
            C_PVK["PvkDokumentController"]
            C_RS["RisikoscenarioController"]
            C_TL["TiltakController"]
            C_PVO["PvoTilbakemeldingController"]
            C_AOO["BehandlingensArtOgOmfangController"]
            C_BL["BehandlingensLivslopController"]
            C_TB["TilbakemeldingController"]
        end

        subgraph GQL["GraphQL Controllers"]
            GQL_ED["EtterlevelseDokumentasjonGraphQlController"]
            GQL_K["KravGraphQlController"]
            GQL_E["EtterlevelseGraphQlController"]
            GQL_PVO["PvoTilbakemeldingGraphQlController"]
        end

        subgraph Services["Services"]
            S_ED["EtterlevelseDokumentasjonService"]
            S_K["KravService"]
            S_E["EtterlevelseService"]
            S_PVK["PvkDokumentService"]
            S_RS["RisikoscenarioService"]
            S_TL["TiltakService"]
            S_PVO["PvoTilbakemeldingService"]
            S_AOO["BehandlingensArtOgOmfangService"]
        end

        subgraph Integrations["External Integrations"]
            INT_TC["TeamcatTeamClient"]
            INT_RC["TeamcatResourceClient"]
            INT_B["BehandlingService"]
            INT_S["SlackClient"]
            INT_NOM["NOM API"]
        end

        REST --> Services
        GQL --> Services
        Services --> Integrations
    end

    subgraph DB["PostgreSQL Database"]
        T_ED["ETTERLEVELSE_DOKUMENTASJON"]
        T_K["KRAV"]
        T_E["ETTERLEVELSE"]
        T_PVK["PVK_DOKUMENT"]
        T_RS["RISIKOSCENARIO"]
        T_TL["TILTAK"]
        T_PVO["PVO_TILBAKEMELDING"]
        T_AOO["BEHANDLINGENS_ART_OG_OMFANG"]
        T_BL["BEHANDLINGENS_LIVSLOP"]
    end

    NX_API -->|REST + GraphQL| REST
    NX_API -->|GraphQL| GQL
    Services --> DB
```

---

## Domain Model (Class Diagram)

```mermaid
classDiagram
    class EtterlevelseDokumentasjon {
        +UUID id
        +String title
        +String beskrivelse
        +List~String~ teams
        +List~String~ resources
        +List~String~ risikoeiere
        +List~String~ behandlingIds
        +Boolean behandlerPersonopplysninger
        +List~IrrelevansFor~ irrelevansFor
        +Integer etterlevelseNummer
    }

    class Krav {
        +UUID id
        +Integer kravNummer
        +Integer kravVersjon
        +String navn
        +String beskrivelse
        +String hensikt
        +KravStatus status
        +List~Regelverk~ regelverk
        +List~Suksesskriterium~ suksesskriterier
        +List~Varslingsadresse~ varslingsadresser
    }

    class Etterlevelse {
        +UUID id
        +UUID etterlevelseDokumentasjonId
        +Integer kravNummer
        +Integer kravVersjon
        +EtterlevelseStatus status
        +Boolean etterleves
        +List~SuksesskriteriumBegrunnelse~ suksesskriterieBegrunnelser
    }

    class PvkDokument {
        +UUID id
        +UUID etterlevelseDokumentId
        +PvkDokumentStatus status
        +Boolean harInvolvertRepresentant
        +Integer antallInnsendingTilPvo
        +LocalDateTime godkjentAvRisikoeierDato
    }

    class Risikoscenario {
        +UUID id
        +UUID pvkDokumentId
        +String navn
        +String beskrivelse
        +Integer sannsynlighetsNivaa
        +Integer konsekvensNivaa
        +Boolean generelScenario
        +List~Integer~ relevanteKravNummer
    }

    class Tiltak {
        +UUID id
        +UUID pvkDokumentId
        +String navn
        +String beskrivelse
        +String ansvarlig
        +String ansvarligTeam
        +LocalDate frist
        +Boolean iverksatt
    }

    class PvoTilbakemelding {
        +UUID id
        +UUID pvkDokumentId
        +PvoTilbakemeldingStatus status
        +List~Vurdering~ vurderinger
    }

    class BehandlingensLivslop {
        +UUID id
        +UUID etterlevelseDokumentasjonId
        +String beskrivelse
        +List~Fil~ filer
    }

    class BehandlingensArtOgOmfang {
        +UUID id
        +UUID etterlevelseDokumentasjonId
        +Boolean stemmerPersonkategorier
        +String personkategoriAntallBeskrivelse
        +String tilgangsBeskrivelsePersonopplysningene
        +String lagringsBeskrivelsePersonopplysningene
    }

    class Tilbakemelding {
        +UUID id
        +Integer kravNummer
        +Integer kravVersjon
        +TilbakemeldingType type
        +List~Melding~ meldinger
    }

    EtterlevelseDokumentasjon "1" --> "0..1" PvkDokument : har
    EtterlevelseDokumentasjon "1" --> "0..*" Etterlevelse : dokumenterer
    EtterlevelseDokumentasjon "1" --> "0..1" BehandlingensLivslop : beskriver
    EtterlevelseDokumentasjon "1" --> "0..1" BehandlingensArtOgOmfang : beskriver
    PvkDokument "1" --> "0..*" Risikoscenario : inneholder
    PvkDokument "1" --> "0..*" Tiltak : inneholder
    PvkDokument "1" --> "0..1" PvoTilbakemelding : mottatt fra
    Risikoscenario "0..*" <--> "0..*" Tiltak : tilknyttes
    Risikoscenario "0..*" --> "0..*" Krav : relevant for
    Krav "1" --> "0..*" Etterlevelse : etterlevd i
    Krav "1" --> "0..*" Tilbakemelding : mottar
```

---

## API Endpoint Overview

### REST API

| Endpoint                       | Methods                |
| ------------------------------ | ---------------------- |
| `/etterlevelsedokumentasjon`   | GET, POST, PUT, DELETE |
| `/krav`                        | GET, POST, PUT, DELETE |
| `/etterlevelse`                | GET, POST, PUT, DELETE |
| `/pvkdokument`                 | GET, POST, PUT, DELETE |
| `/risikoscenario`              | GET, POST, PUT, DELETE |
| `/tiltak`                      | GET, POST, PUT, DELETE |
| `/pvotilbakemelding`           | GET, POST, PUT, DELETE |
| `/behandlingens-art-og-omfang` | GET, POST, PUT, DELETE |
| `/behandlingenslivslop`        | GET, POST, PUT, DELETE |
| `/tilbakemelding`              | GET, POST, DELETE      |
| `/team`                        | GET                    |
| `/behandling`                  | GET                    |
| `/codelist`                    | GET, POST, PUT, DELETE |
| `/melding`                     | GET, POST, PUT, DELETE |
| `/audit`                       | GET                    |
| `/userinfo`                    | GET                    |
| `/nom`                         | GET                    |

### GraphQL API (`/graphql`)

| Query                               |
| ----------------------------------- |
| `etterlevelseDokumentasjon(filter)` |
| `krav(filter)` / `kravById`         |
| `etterlevelseById`                  |
| `pvoTilbakemelding(filter)`         |

---

## Sequence Diagrams

### 1. User loads an Etterlevelse documentation page

```mermaid
sequenceDiagram
    actor User
    participant NextJS as Frontend-NextJS
    participant Backend as Backend (Spring Boot)
    participant TeamCat as Teamcat
    participant DB as PostgreSQL

    User->>NextJS: Navigate to /etterlevelsedokumentasjon/:id
    NextJS->>Backend: GraphQL etterlevelseDokumentasjon(filter)
    Backend->>DB: SELECT etterlevelse_dokumentasjon
    DB-->>Backend: EtterlevelseDokumentasjon row
    Backend->>TeamCat: getTeams(teamIds)
    TeamCat-->>Backend: Team data
    Backend->>DB: SELECT etterlevelse WHERE dok_id = ?
    DB-->>Backend: Etterlevelse rows
    Backend-->>NextJS: EtterlevelseDokumentasjonGraphQlResponse
    NextJS-->>User: Render page with krav status, teams, etterlevelser
```

### 2. User submits a PVK document to PVO

```mermaid
sequenceDiagram
    actor User
    participant NextJS as Frontend-NextJS
    participant Backend as Backend (Spring Boot)
    participant DB as PostgreSQL

    User->>NextJS: Click "Send til PVO"
    NextJS->>Backend: PUT /pvkdokument/:id (status=SENDT_TIL_PVO)
    Backend->>DB: UPDATE pvk_dokument SET status
    Backend->>DB: SELECT pvo_tilbakemelding WHERE pvk_dokument_id = ?
    DB-->>Backend: PvoTilbakemelding
    Backend->>DB: UPDATE pvo_tilbakemelding SET status=IKKE_PABEGYNT
    DB-->>Backend: Updated PvoTilbakemelding
    Backend-->>NextJS: PvkDokumentResponse
    NextJS-->>User: Show confirmation, updated status
```

### 3. PVO registers feedback (Tilbakemelding)

```mermaid
sequenceDiagram
    actor PVO
    participant NextJS as Frontend-NextJS
    participant Backend as Backend (Spring Boot)
    participant DB as PostgreSQL

    PVO->>NextJS: Fill in vurdering and click "Ferdigstill"
    NextJS->>Backend: PUT /pvotilbakemelding/:id (status=FERDIG)
    Backend->>DB: UPDATE pvo_tilbakemelding SET status, data
    Backend->>DB: SELECT pvk_dokument WHERE id = ?
    DB-->>Backend: PvkDokument
    alt vilFaPvkIRetur = true
        Backend->>DB: UPDATE pvk_dokument SET status=VURDERT_AV_PVO_TRENGER_MER_ARBEID
    else
        Backend->>DB: UPDATE pvk_dokument SET status=VURDERT_AV_PVO
    end
    Backend-->>NextJS: PvoTilbakemeldingResponse
    NextJS-->>PVO: Show updated status
```

### 4. User creates a Risikoscenario linked to a Krav

```mermaid
sequenceDiagram
    actor User
    participant NextJS as Frontend-NextJS
    participant Backend as Backend (Spring Boot)
    participant DB as PostgreSQL

    User->>NextJS: Add risikoscenario for kravnummer K42
    NextJS->>Backend: POST /risikoscenario/krav/42
    Backend->>Backend: Validate krav is active (KravService)
    Backend->>DB: INSERT risikoscenario
    Backend->>DB: UPDATE risikoscenario_data SET relevanteKravNummer += 42
    DB-->>Backend: Risikoscenario
    Backend-->>NextJS: RisikoscenarioResponse
    NextJS-->>User: Show new risikoscenario in list
```

### 5. Risikoeier approves PVK

```mermaid
sequenceDiagram
    actor Risikoeier
    participant NextJS as Frontend-NextJS
    participant Backend as Backend (Spring Boot)
    participant DB as PostgreSQL

    Risikoeier->>NextJS: Click "Godkjenn"
    NextJS->>Backend: PUT /pvkdokument/:id (status=GODKJENT_AV_RISIKOEIER)
    Backend->>DB: UPDATE pvk_dokument SET status, godkjent_av_risikoeier_dato
    Backend->>DB: SELECT all risikoscenario for pvk_dokument
    Backend->>DB: SELECT all tiltak for pvk_dokument
    Backend-->>NextJS: PvkDokumentResponse (hasPvkDocumentBeenUpdatedAfterApproval=false)
    NextJS-->>Risikoeier: Show approved state
```
