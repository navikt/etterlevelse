import { IKrav } from '@/constants/krav/kravConstants'
import { List } from '@navikt/ds-react'
import { FieldArrayRenderProps } from 'formik'
import { FunctionComponent } from 'react'
import { KravPriorityPanel } from '../kravPriorityPanel/kravPriorityPanel'

type TProps = {
  fieldArrayRenderProps: FieldArrayRenderProps
}
export const KravPriorityPanels: FunctionComponent<TProps> = ({ fieldArrayRenderProps }) => {
  const kravListe = fieldArrayRenderProps.form.values.krav as IKrav[]

  return (
    <List>
      {kravListe.map((krav: IKrav, index: number) => (
        <List.Item icon={<div />} key={`${krav.navn}_${krav.kravNummer}`}>
          <KravPriorityPanel
            krav={krav}
            index={index}
            arrayLength={kravListe.length}
            fieldArrayRenderProps={fieldArrayRenderProps}
          />
        </List.Item>
      ))}
    </List>
  )
}
