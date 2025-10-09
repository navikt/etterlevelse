import { List, ReadMore } from '@navikt/ds-react'

export const RisikoscenarioKonsekvensnivaaReadMore = () => (
  <ReadMore header='Hva menes med de ulike konsekvensnivåene?' className='my-5'>
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
      <List.Item>Den registrertes tillit til Nav utfordres midlertidig</List.Item>
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
      <List.Item>Den registrertes tillit til Nav utfordres</List.Item>
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
      <List.Item>Den registrerte taper tilleten til Nav</List.Item>
    </List>
    <h2>
      <b>Svært alvorlig</b>
    </h2>
    <List>
      <List.Item>Tap av liv for den registrerte</List.Item>
      <List.Item>Varige og alvorlige helsemessige konsekvenser for den registrerte</List.Item>
      <List.Item>Varig og betydelig økonomisk tap for den registrerte</List.Item>
      <List.Item>Varig og alvorlig tap av den registrertes omdømme</List.Item>
      <List.Item>Den registrertes rett til personvern krenkes på en svært alvorlig måte</List.Item>
      <List.Item>Den registrerte og samfunnet taper tilliten til Nav</List.Item>
    </List>
  </ReadMore>
)

export default RisikoscenarioKonsekvensnivaaReadMore
