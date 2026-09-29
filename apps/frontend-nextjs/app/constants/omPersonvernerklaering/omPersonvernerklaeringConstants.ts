export enum EOverskrifterPersonvernerklaering {
  STEPPER_HEADING = 'Personvernerklæring for Støtte til etterlevelse',
  BEHANDLING_PERSONOPPLYSNINGER_HVORDAN = 'Hvordan behandler vi ansattes personopplysninger?',
  BEHANDLING_PERSONOPPLYSNINGER_HVILKE = 'Hvilke personopplysninger behandler vi?',
  BEHANDLING_PERSONOPPLYSNINGER_HVOR_HENTES = 'Hvor henter vi dine personopplysninger?',
  BEHANDLING_PERSONOPPLYSNINGER_HVOR_LAGRES = 'Hvor behandler og lagrer vi personopplysningene?',
  INNBLIKK_ETTERLEVELSE = 'Innblikk i Støtte til etterlevelse',
  SAMTYKKE_MAALING = 'Samtykke om måling',
  SAMTYKKE_BRUKER = 'Samtykke til Innblikk',
  MANGLER = 'Feil, mangler og tilbakemeldinger',
}

export enum EPersonvernerklaeringId {
  STEP_ONE = 'stepper-heading',
  STEP_TWO = 'behandling-personopplysninger-hvordan',
  STEP_THREE = 'behandling-personopplysninger-hvilke',
  STEP_FOUR = 'behandling-personopplysninger-hvor-hentes',
  STEP_FIVE = 'behandling-personopplysninger-hvor-lagres',
  STEP_SIX = 'innblikk-etterlevelse',
  STEP_SEVEN = 'samtykke-maaling',
  STEP_EIGHT = 'samtykke-bruker',
  STEP_NINE = 'mangler',
}

export type TStepperPersonvernerklaering = {
  id: EPersonvernerklaeringId
  step: EOverskrifterPersonvernerklaering
}

export const stepperPersonvernerklaering: TStepperPersonvernerklaering[] = [
  {
    id: EPersonvernerklaeringId.STEP_ONE,
    step: EOverskrifterPersonvernerklaering.STEPPER_HEADING,
  },
  {
    id: EPersonvernerklaeringId.STEP_TWO,
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVORDAN,
  },
  {
    id: EPersonvernerklaeringId.STEP_THREE,
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVILKE,
  },
  {
    id: EPersonvernerklaeringId.STEP_FOUR,
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVOR_HENTES,
  },
  {
    id: EPersonvernerklaeringId.STEP_FIVE,
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVOR_LAGRES,
  },
  {
    id: EPersonvernerklaeringId.STEP_SIX,
    step: EOverskrifterPersonvernerklaering.INNBLIKK_ETTERLEVELSE,
  },
  {
    id: EPersonvernerklaeringId.STEP_SEVEN,
    step: EOverskrifterPersonvernerklaering.SAMTYKKE_MAALING,
  },
  {
    id: EPersonvernerklaeringId.STEP_EIGHT,
    step: EOverskrifterPersonvernerklaering.SAMTYKKE_BRUKER,
  },
  { id: EPersonvernerklaeringId.STEP_NINE, step: EOverskrifterPersonvernerklaering.MANGLER },
]
