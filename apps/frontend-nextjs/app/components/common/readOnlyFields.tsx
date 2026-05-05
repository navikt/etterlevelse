import { BodyShort, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  label: string
  description: string
  className?: string
}

export const ReadOnlyField: FunctionComponent<TProps> = ({ label, description, className }) => {
  const displayInline: boolean = description.length <= 26
  const displayBlock: boolean = description.length >= 27

  return (
    <div className={className}>
      {displayInline && (
        <div>
          <Label key='description_label'>{label}</Label>
          <BodyShort className={`var(--a-font-line-height-large)`} key='description_text'>
            {description}
          </BodyShort>
        </div>
      )}
      {displayBlock && (
        <div>
          <Label>{label}</Label>
          <BodyShort className={`var(--a-font-line-height-large)`}>{description}</BodyShort>
        </div>
      )}
    </div>
  )
}

interface IPropsReadOnlyFieldBool extends TProps {
  description: string
  descriptionFalse?: string
  isFalse?: boolean
}

export const ReadOnlyFieldBool: FunctionComponent<IPropsReadOnlyFieldBool> = ({
  label,
  description,
  className,
  isFalse,
  descriptionFalse,
}) => (
  <div className={className}>
    <Label>{label}</Label>
    <BodyShort>
      {isFalse && descriptionFalse}
      {!isFalse && description}
    </BodyShort>
  </div>
)

interface IPropsReadOnlyFieldDescriptionOptional extends TProps {
  isVisible: boolean
}

export const ReadOnlyFieldDescriptionOptional: FunctionComponent<
  IPropsReadOnlyFieldDescriptionOptional
> = ({ label, description, className, isVisible }) => (
  <div className={className}>
    <Label>{label}</Label>
    {isVisible && <BodyShort>{description}</BodyShort>}
  </div>
)

export default ReadOnlyField
