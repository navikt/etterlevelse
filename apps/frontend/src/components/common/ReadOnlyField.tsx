import { BodyShort, Label } from '@navikt/ds-react'

interface IProps {
  label: string
  description: string
  className?: string
}

export const ReadOnlyField = ({ label, description, className }: IProps) => {
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

interface IPropsReadOnlyFieldBool extends IProps {
  description: string
  descriptionFalse?: string
  isFalse?: boolean
}

export const ReadOnlyFieldBool = ({
  label,
  description,
  className,
  isFalse,
  descriptionFalse,
}: IPropsReadOnlyFieldBool) => (
  <div className={className}>
    <Label>{label}</Label>
    <BodyShort>
      {isFalse && descriptionFalse}
      {!isFalse && description}
    </BodyShort>
  </div>
)

interface IPropsReadOnlyFieldDescriptionOptional extends IProps {
  isVisible: boolean
}

export const ReadOnlyFieldDescriptionOptional = ({
  label,
  description,
  className,
  isVisible,
}: IPropsReadOnlyFieldDescriptionOptional) => (
  <div className={className}>
    <Label>{label}</Label>
    {isVisible && <BodyShort>{description}</BodyShort>}
  </div>
)

export default ReadOnlyField
