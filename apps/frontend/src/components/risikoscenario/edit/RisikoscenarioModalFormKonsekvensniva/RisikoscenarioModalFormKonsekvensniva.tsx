import { Heading, List, Radio, RadioGroup, ReadMore } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { TextAreaField } from '../../../common/Inputs'
import { FormError } from '../../../common/ModalSchema'

export const RisikoscenarioModalFormKonsekvensniva = () => (
  <>
    <Heading level="3" size="small" className="my-5">
      Risikoscenariets konsekvensnivå
    </Heading>

    <ReadMore header="Hva menes med de ulike konsekvensnivåene?" className="my-5">
      <h2>
        <b>Ubetydelig konsekvens</b>
      </h2>
      <List>
        <List.Item>Forbigående, mindre økonomiske tap for den registrerte</List.Item>
        <List.Item>Midlertidig og begrenset tap av den registrertes omdømme</List.Item>
        <List.Item>
          Den registrertes rett til personvern utfordres i en svært kort periode og uten å involvere
          særlige kategorier/sårbare grupper
        </List.Item>
      </List>
      <h2>
        <b>Lav konsekvens</b>
      </h2>
      <List>
        <List.Item>
          Midlertidige eller mindre alvorlige helsemessige konsekvenser for den registrerte
        </List.Item>
        <List.Item>Forbigående økonomisk tap for den registrerte</List.Item>
        <List.Item>Midlertidig eller begrenset tap av den registrertes omdømme</List.Item>
        <List.Item>
          Den registrertes rett til personvern utfordres i en kort periode eller uten å involvere
          særlige kategorier/sårbare grupper
        </List.Item>
        <List.Item>Den registrertes tillit til NAV utfordres midlertidig</List.Item>
      </List>
      <h2>
        <b>Moderat konsekvens</b>
      </h2>
      <List>
        <List.Item>
          Midlertidige eller noe mer alvorlige helsemessige konsekvenser for den registrerte
        </List.Item>
        <List.Item>Økonomisk tap av noe varighet for den registrerte</List.Item>
        <List.Item>Midlertidige eller noe alvorlige tap av den registrertes omdømme</List.Item>
        <List.Item>
          Den registrertes rett til personvern krenkes i en større periode eller involverer særlige
          kategorier/sårbare grupper
        </List.Item>
        <List.Item>Den registrertes tillit til NAV utfordres</List.Item>
      </List>
      <h2>
        <b>Alvorlig konsekvens</b>
      </h2>
      <List>
        <List.Item>Varig eller alvorlige helsemessige konsekvenser for den registrerte</List.Item>
        <List.Item>Økonomisk tap av betydelig varighet for den registrerte</List.Item>
        <List.Item>Varig eller alvorlig tap av den registrertes omdømme</List.Item>
        <List.Item>
          Den registrertes rett til personvern krenkes alvorlig i en større periode og involverer
          særlige kategorier/sårbare grupper
        </List.Item>
        <List.Item>Den registrerte taper tilleten til NAV</List.Item>
      </List>
      <h2>
        <b>Svært alvorlig</b>
      </h2>
      <List>
        <List.Item>Tap av liv for den registrerte</List.Item>
        <List.Item>Varige og alvorlige helsemessige konsekvenser for den registrerte</List.Item>
        <List.Item>Varig og betydelig økonomisk tap for den registrerte</List.Item>
        <List.Item>Varig og alvorlig tap av den registrertes omdømme</List.Item>
        <List.Item>
          Den registrertes rett til personvern krenkes på en svært alvorlig måte
        </List.Item>
        <List.Item>Den registrerte og samfunnet taper tilliten til NAV</List.Item>
      </List>
    </ReadMore>

    <Field name="konsekvensNivaa">
      {(fieldProps: FieldProps) => (
        <RadioGroup
          legend="Vurdér risikoscenariets konsekvensnivå"
          value={fieldProps.field.value}
          onChange={(value) => {
            fieldProps.form.setFieldValue('konsekvensNivaa', value)
          }}
          error={
            fieldProps.form.errors['konsekvensNivaa'] && <FormError fieldName={'konsekvensNivaa'} />
          }
        >
          <Radio value={1}>Ubetydelig</Radio>
          <Radio value={2}>Lav konsekvens</Radio>
          <Radio value={3}>Moderat konsekvens</Radio>
          <Radio value={4}>Alvorlig konsekvens</Radio>
          <Radio value={5}>Svært alvorlig konsekvens</Radio>
        </RadioGroup>
      )}
    </Field>

    <div className="mt-3">
      <TextAreaField
        rows={3}
        noPlaceholder
        label="Begrunn konsekvensnivået"
        name="konsekvensNivaaBegrunnelse"
      />
    </div>
  </>
)
