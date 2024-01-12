import { InformationSquareIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Label, Tooltip } from '@navikt/ds-react'

const LabelWithToolTip = (props: {
  label?: string
  tooltip?: string
  fontColor?: string
  noMarginBottom?: boolean
}) => {
  return (
    <div className={`flex items-center ${props.noMarginBottom ? undefined : 'mb-1.5'}`}>
      <div className={`${props.tooltip ? 'mr-1.5' : undefined}`}>
        <Label>{props.label}</Label>
      </div>
      {props.tooltip && (
        <Tooltip content={props.tooltip} arrow>
          <Button
            type="button"
            variant="tertiary"
            icon={<InformationSquareIcon title="Tooltip" aria-label="Tooltip" />}
            // icon={<QuestionmarkDiamondIcon title="Tooltip" aria-label="Tooltip"/>}
          />
        </Tooltip>
      )}
    </div>
  )
}

export const LabelWithDescription = (props: {
  label?: string
  description?: string
  fontColor?: string
  noMarginBottom?: boolean
}) => {
  return (
    <div className={`${props.noMarginBottom ? undefined : 'mb-1.5'}`}>
      <div className={`${props.description ? 'mb-0.5' : undefined}`}>
        <Label>{props.label}</Label>
      </div>
      {props.description && (
        <BodyShort className="navds-fieldset__description navds-body-short navds-body-short--medium">
          {props.description}
        </BodyShort>
      )}
    </div>
  )
}
export default LabelWithToolTip
