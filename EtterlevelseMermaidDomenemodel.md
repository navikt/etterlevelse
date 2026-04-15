# Etterlevelse – UML Architecture & Domain Model

**Date created:** 26 March 2026
**Last updated:** 15 April 2026

---

## Table of Contents

1. [How to view Mermaid diagrams in VS Code](#how-to-view-mermaid-diagrams-in-vs-code)
2. [System Architecture](#system-architecture)
3. [System Architecture Overview](#system-architecture-overview)
4. [Domain Model (Class Diagram)](#domain-model-class-diagram)
5. [API Endpoint Overview](#api-endpoint-overview)
6. [EtterlevelseDokumentasjon Status State Machine](#etterlevelsedokumentasjon-status-state-machine)
7. [PVK/PVO Status State Machine](#pvkpvo-status-state-machine)
8. [Action Menu Button State Machines](#action-menu-button-state-machines)
9. [Sequence Diagrams](#sequence-diagrams)

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
            S_KPL["KravPriorityListService"]
        end

        subgraph Integrations["External Integrations"]
            INT_TC["TeamcatTeamClient"]
            INT_RC["TeamcatResourceClient"]
            INT_B["BehandlingService"]
            INT_S["SlackClient"]
            INT_NOM["NOM API"]
            INT_A["ArdoqClient"]
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

## System Architecture Overview

| Layer                    | Technology                                        | Role                                                                      |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------- |
| **Frontend**             | Next.js 14 (App Router), TypeScript, Tailwind CSS | UI — pages, forms, navigation                                             |
| **API Client**           | axios (REST), Apollo Client (GraphQL)             | Communicates with backend                                                 |
| **Backend**              | Spring Boot 3, Java, Spring GraphQL               | REST + GraphQL API, business logic                                        |
| **Auth**                 | NAV SSO / cookie-based                            | Authenticates users via `withCredentials`                                 |
| **Database**             | PostgreSQL                                        | Stores all domain data as rows + JSONB                                    |
| **Teamcat**              | External NAV service                              | Resolves team and resource (person) data                                  |
| **Behandlingskatalogen** | External NAV service                              | Resolves `Behandling` and `DpBehandling`                                  |
| **NOM**                  | External NAV service                              | Resolves organisational units (avdelinger)                                |
| **Slack**                | External Slack API                                | Resolves Slack channels and users for varslingsadresser                   |
| **Ardoq**                | External Ardoq API                                | Resolves system metadata (`ardoqSystemIds`) for EtterlevelseDokumentasjon |

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
        +List~String~ ardoqSystemIds
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

    class KravPriorityList {
        +UUID id
        +String temaId
        +List~Integer~ priorityList
    }

    class EtterlevelseMetadata {
        +UUID id
        +UUID etterlevelseDokumentasjonId
        +Integer kravNummer
        +Integer kravVersjon
        +List~String~ tildeltMed
        +String notater
    }

    class DocumentRelation {
        +UUID id
        +UUID fromDocument
        +UUID toDocument
        +ERelationType RelationType
    }

    EtterlevelseDokumentasjon "1" --> "0..1" PvkDokument : har
    EtterlevelseDokumentasjon "1" --> "0..*" Etterlevelse : dokumenterer
    EtterlevelseDokumentasjon "1" --> "0..1" BehandlingensLivslop : beskriver
    EtterlevelseDokumentasjon "1" --> "0..1" BehandlingensArtOgOmfang : beskriver
    EtterlevelseDokumentasjon "1" --> "0..*" EtterlevelseMetadata : har metadata for
    EtterlevelseDokumentasjon "0..*" --> "0..*" DocumentRelation : relatert via
    PvkDokument "1" --> "0..*" Risikoscenario : inneholder
    PvkDokument "1" --> "0..*" Tiltak : inneholder
    PvkDokument "1" --> "0..1" PvoTilbakemelding : mottatt fra
    Risikoscenario "0..*" <--> "0..*" Tiltak : tilknyttes
    Risikoscenario "0..*" --> "0..*" Krav : relevant for
    Krav "1" --> "0..*" Etterlevelse : etterlevd i
    Krav "1" --> "0..*" Tilbakemelding : mottar
    Krav "0..*" --> "0..1" KravPriorityList : prioritert i
```

---

## API Endpoint Overview

### REST API

| Endpoint                                   | Methods                |
| ------------------------------------------ | ---------------------- |
| `/etterlevelsedokumentasjon`               | GET, POST, PUT, DELETE |
| `/krav`                                    | GET, POST, PUT, DELETE |
| `/etterlevelse`                            | GET, POST, PUT, DELETE |
| `/pvkdokument`                             | GET, POST, PUT, DELETE |
| `/risikoscenario`                          | GET, POST, PUT, DELETE |
| `/tiltak`                                  | GET, POST, PUT, DELETE |
| `/pvotilbakemelding`                       | GET, POST, PUT, DELETE |
| `/behandlingens-art-og-omfang`             | GET, POST, PUT, DELETE |
| `/behandlingenslivslop`                    | GET, POST, PUT, DELETE |
| `/tilbakemelding`                          | GET, POST, DELETE      |
| `/team`                                    | GET                    |
| `/behandling`                              | GET                    |
| `/codelist`                                | GET, POST, PUT, DELETE |
| `/melding`                                 | GET, POST, PUT, DELETE |
| `/audit`                                   | GET                    |
| `/audit/search/{searchTerm}/table/{table}` | GET                    |
| `/userinfo`                                | GET                    |
| `/nom`                                     | GET                    |

### GraphQL API (`/graphql`)

| Query                               |
| ----------------------------------- |
| `etterlevelseDokumentasjon(filter)` |
| `krav(filter)` / `kravById`         |
| `etterlevelseById`                  |
| `pvoTilbakemelding(filter)`         |

---

## EtterlevelseDokumentasjon Status State Machine

```mermaid
stateDiagram-v2
    [*] --> UNDER_ARBEID : Dokument opprettet
    UNDER_ARBEID --> SENDT_TIL_GODKJENNING_TIL_RISIKOEIER : Etterleverer sender til risikoeier
    SENDT_TIL_GODKJENNING_TIL_RISIKOEIER --> GODKJENT_AV_RISIKOEIER : Risikoeier godkjenner
    SENDT_TIL_GODKJENNING_TIL_RISIKOEIER --> UNDER_ARBEID : Risikoeier avviser
    GODKJENT_AV_RISIKOEIER --> UNDER_ARBEID : Ny versjon opprettes
    GODKJENT_AV_RISIKOEIER --> [*]
```

---

## PVK/PVO Status State Machine

### PvkDokument statuses

```mermaid
stateDiagram-v2
    [*] --> UNDERARBEID : PVK opprettet
    UNDERARBEID --> SENDT_TIL_PVO : Bruker sender til PVO
    SENDT_TIL_PVO --> PVO_UNDERARBEID : PVO begynner arbeid
    PVO_UNDERARBEID --> VURDERT_AV_PVO : PVO ferdigstiller (uten retur)
    PVO_UNDERARBEID --> VURDERT_AV_PVO_TRENGER_MER_ARBEID : PVO ferdigstiller (med retur)
    VURDERT_AV_PVO --> GODKJENT_AV_RISIKOEIER : Risikoeier godkjenner
    VURDERT_AV_PVO_TRENGER_MER_ARBEID --> UNDERARBEID : Bruker tar tilbake og redigerer
    VURDERT_AV_PVO_TRENGER_MER_ARBEID --> SENDT_TIL_PVO_FOR_REVURDERING : Bruker sender til revurdering
    SENDT_TIL_PVO_FOR_REVURDERING --> PVO_UNDERARBEID : PVO begynner revurdering
```

### PvoTilbakemelding statuses

```mermaid
stateDiagram-v2
    [*] --> IKKE_PABEGYNT : PVK sendt til PVO
    IKKE_PABEGYNT --> UNDERARBEID : PVO begynner
    UNDERARBEID --> SNART_FERDIG : PVO markerer nesten ferdig
    SNART_FERDIG --> TIL_KONTROL : Sendt til kontroll
    TIL_KONTROL --> FERDIG : Godkjent
    FERDIG --> TRENGER_REVURDERING : PVK sendt til revurdering
    TRENGER_REVURDERING --> UNDERARBEID : PVO begynner igjen
    FERDIG --> [*]
```

---

## Action Menu Button State Machines

The documentation page (`/dokumentasjon/:id`) renders up to three action menu buttons when conditions are met:

- **Etterlevelse** – shown when `user.isAdmin() || hasCurrentUserAccess`
- **Personvernkonsekvensvurdering (PVK)** – shown when `behandlerPersonopplysninger = true`
- **Gjenbruk** – shown when `forGjenbruk && (user.isAdmin() || hasCurrentUserAccess) && !morDokumentRelasjon` (previously dev-only, now available in all environments)

All buttons adapt their menu items based on the current user's **role** and the document's **status / tilstand**.

---

### Etterlevelse-knapp

Role is determined by `getRolle(etterlevelseDokumentasjon)`:

- `Admin` – user is system admin
- `EtterleverOgRisikoeier` – user has access AND is listed as risikoeier
- `Risikoeier` / `Personvernombud` – user is risikoeier or PVO (read-mostly)
- `Etterlever` – user has access (default)

#### State transitions

```mermaid
stateDiagram-v2
    [*] --> UNDER_ARBEID

    UNDER_ARBEID --> SENDT_TIL_GODKJENNING_TIL_RISIKOEIER : Etterlever / EtterleverOgRisikoeier / Admin
    SENDT_TIL_GODKJENNING_TIL_RISIKOEIER --> GODKJENT_AV_RISIKOEIER : Risikoeier / EtterleverOgRisikoeier / Admin
    GODKJENT_AV_RISIKOEIER --> UNDER_ARBEID : Etterlever / EtterleverOgRisikoeier / Admin
    GODKJENT_AV_RISIKOEIER --> [*]
```

#### Menyelementer per rolle og status

| Etterlevelse-status                  | Rolle                          | Menyelementer                                                                                                |
| ------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| UNDER_ARBEID                         | Etterlever                     | Rediger dokumentegenskaper · Eksporter til Word · **Få etterlevelsen godkjent av risikoeier**                |
| UNDER_ARBEID                         | Risikoeier / Personvernombud   | Eksporter til Word                                                                                           |
| UNDER_ARBEID                         | EtterleverOgRisikoeier / Admin | Rediger dokumentegenskaper · Eksporter til Word · **Få etterlevelsen godkjent av risikoeier**                |
| SENDT_TIL_GODKJENNING_TIL_RISIKOEIER | Etterlever                     | Les innsending til risikoeier · Rediger dokumentegenskaper · Eksporter til Word                              |
| SENDT_TIL_GODKJENNING_TIL_RISIKOEIER | Risikoeier / Personvernombud   | **Godkjenn etterlevelsen** · Eksporter til Word                                                              |
| SENDT_TIL_GODKJENNING_TIL_RISIKOEIER | EtterleverOgRisikoeier / Admin | Les innsending til risikoeier · Rediger dokumentegenskaper · **Godkjenn etterlevelsen** · Eksporter til Word |
| GODKJENT_AV_RISIKOEIER               | Etterlever                     | Rediger dokumentegenskaper · **Lås opp og oppdater dokumentasjon** · Eksporter til Word                      |
| GODKJENT_AV_RISIKOEIER               | Risikoeier / Personvernombud   | Eksporter til Word                                                                                           |
| GODKJENT_AV_RISIKOEIER               | EtterleverOgRisikoeier / Admin | Rediger dokumentegenskaper · **Lås opp og oppdater dokumentasjon** · Eksporter til Word                      |

---

### PVK-knapp (PVK Tilstand)

The PVK button renders based on `EPVKTilstandStatus`, computed by `getPvkTilstand(pvkDokument, pvoTilbakemelding)`.

Role priority: `Admin` > `Personvernombud` > `EtterleverOgRisikoeier` > `Risikoeier` > `Etterlever` > `Les`

#### Tilstand flow

```mermaid
stateDiagram-v2
    T1 : T1 – Behov for PVK ikke vurdert
    T2 : T2 – Skal ikke gjøre PVK
    T3 : T3 – Skal gjøre PVK, ikke påbegynt
    T4 : T4 – PVK under arbeid (første gang)
    T5 : T5 – PVK sendt til PVO
    T6 : T6 – PVO har gitt tilbakemelding
    T7 : T7 – Etterlever har sendt tilbake til PVO
    T8 : T8 – Sendt til risikoeier
    T9 : T9 – Godkjent av risikoeier
    T10 : T10 – Etterlever har begynt nye endringer

    [*] --> T1
    T1 --> T2 : Etterlever - Skal ikke gjore PVK
    T1 --> T3 : Etterlever - Skal gjore PVK
    T2 --> T1 : Etterlever - Revurder behov for PVK
    T2 --> T3 : Etterlever - Revurder, skal gjore PVK
    T3 --> T4 : Etterlever - Pabegynn PVK
    T4 --> T5 : Etterlever - Fullfør og send til PVO
    T5 --> T6 : PVO - Gir tilbakemelding
    T6 --> T7 : Etterlever - Sender tilbake til PVO
    T7 --> T8 : Etterlever/PVO - Sender til risikoeier
    T8 --> T9 : Risikoeier/Admin - Godkjenn PVK
    T9 --> T10 : Etterlever - Begynner nye endringer
    T10 --> T9 : Risikoeier - Godkjenn PVK ny versjon
    T9 --> [*]
```

#### Primær knapp per rolle og tilstand

Bold = action-triggering button. Italic = read-only navigation only.

| Tilstand                           | Etterlever                 | Personvernombud        | Risikoeier               | EtterleverOgRisikoeier     | Admin                      |
| ---------------------------------- | -------------------------- | ---------------------- | ------------------------ | -------------------------- | -------------------------- |
| T1 – Behov ikke vurdert            | **Vurder behov for PVK**   | _navigasjon_           | _navigasjon_             | **Vurder behov for PVK**   | **Vurder behov for PVK**   |
| T2 – Skal ikke gjøre PVK           | **Revurder behov for PVK** | _navigasjon_           | _navigasjon_             | **Revurder behov for PVK** | **Revurder behov for PVK** |
| T3 – Skal gjøre PVK, ikke påbegynt | **Påbegynn PVK**           | _navigasjon_           | _navigasjon_             | **Påbegynn PVK**           | **Påbegynn PVK**           |
| T4 – PVK under arbeid              | **Fullfør PVK**            | _Les PVK_              | _Les PVK_                | **Fullfør PVK**            | **Fullfør PVK**            |
| T5 – PVK sendt til PVO             | _Les PVK_                  | **Vurder PVK**         | _Les PVK_                | _Les PVK_                  | **Vurder PVK**             |
| T6 – PVO har gitt tilbakemelding   | _Les PVOs tilbakemelding_  | _Les PVK_              | _Les PVK_                | _Les PVOs tilbakemelding_  | _Les PVOs tilbakemelding_  |
| T7 – Sendt tilbake til PVO         | _Les PVK_                  | **Vurder PVK**         | _Les PVK_                | _Les PVK_                  | **Vurder PVK**             |
| T8 – Sendt til risikoeier          | _Les PVK_                  | _Les PVK_              | **Godkjenn PVK**         | **Godkjenn PVK**           | **Godkjenn PVK**           |
| T9 – Godkjent av risikoeier        | **Les og oppdater PVK**    | _Les PVK_              | _Les PVK_                | _Les og oppdater PVK_      | _Les og oppdater PVK_      |
| T10 – Ny versjon under arbeid      | **Fullfør PVK**            | **Vurder PVK (ny v.)** | **Godkjenn PVK (ny v.)** | **Fullfør PVK**            | **Fullfør PVK**            |

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
