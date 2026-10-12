import { Stepper } from '@navikt/ds-react'
import { useState } from 'react'
import {
  EOverskrifterPersonvernerklaering,
  EPersonvernerklaeringId,
} from '@/constants/omPersonvernerklaering/omPersonvernerklaeringConstants'

const OmStepperPersonvernerklaering = () => {
  const [activeStep, setActiveStep] = useState(0)

  const toAnchor = (id: string) => `#${id}`

  return (
    <div className='sticky top-4 h-full'>
      <div className='max-w-[274px]'>
        <Stepper
          aria-labelledby='stepper-heading'
          activeStep={activeStep}
          onStepChange={setActiveStep}
        >
          <Stepper.Step href={toAnchor(EPersonvernerklaeringId.STEP_ONE)}>
            {EOverskrifterPersonvernerklaering.STEPPER_HEADING}
          </Stepper.Step>
          <Stepper.Step href={toAnchor(EPersonvernerklaeringId.STEP_TWO)}>
            {EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVORDAN}
          </Stepper.Step>
          <Stepper.Step href={toAnchor(EPersonvernerklaeringId.STEP_THREE)}>
            {EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVILKE}
          </Stepper.Step>
          <Stepper.Step href={toAnchor(EPersonvernerklaeringId.STEP_FOUR)}>
            {EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVOR_HENTES}
          </Stepper.Step>
          <Stepper.Step href={toAnchor(EPersonvernerklaeringId.STEP_FIVE)}>
            {EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVOR_LAGRES}
          </Stepper.Step>
          <Stepper.Step href={toAnchor(EPersonvernerklaeringId.STEP_SIX)}>
            {EOverskrifterPersonvernerklaering.INNBLIKK_ETTERLEVELSE}
          </Stepper.Step>
          <Stepper.Step href={toAnchor(EPersonvernerklaeringId.STEP_SEVEN)}>
            {EOverskrifterPersonvernerklaering.SAMTYKKE_MAALING}
          </Stepper.Step>
          <Stepper.Step href={toAnchor(EPersonvernerklaeringId.STEP_EIGHT)}>
            {EOverskrifterPersonvernerklaering.SAMTYKKE_BRUKER}
          </Stepper.Step>
          <Stepper.Step href={toAnchor(EPersonvernerklaeringId.STEP_NINE)}>
            {EOverskrifterPersonvernerklaering.MANGLER}
          </Stepper.Step>
        </Stepper>
      </div>
    </div>
  )
}
export default OmStepperPersonvernerklaering
