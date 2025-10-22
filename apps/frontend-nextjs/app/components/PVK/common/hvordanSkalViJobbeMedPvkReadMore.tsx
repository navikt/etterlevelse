import { BodyShort, List, ReadMore } from '@navikt/ds-react'

export const HvordanSkalViJobbeMedPvkReadMore = () => (
  <ReadMore className='mb-5 max-w-[766px]' header='Hvordan skal vi jobbe med PVK?'>
    <BodyShort>
      I PVK-en skal dere beskrive deres behandling av personopplysninger, og gjøre en risikoanalyse.
      Prosessen inkluderer:
    </BodyShort>
    <List as='ol'>
      <List.Item>
        Dere beskriver behandlingen slik at det er enklere å identifisere risikoer.
      </List.Item>
      <List.Item>
        Dere gjør risikoanalyse, setter tiltak og vurderer så tiltakenes effekt.
      </List.Item>
      <List.Item>Dere sender inn PVK til vurdering av Personvernombudet (PVO).</List.Item>
      <List.Item>
        Personvernombudet vurderer PVK og sender så sine tilbakemeldinger. Idet de gjør dette,
        arkiveres PVK inkludert PVOs tilbakemelding automatisk i Public360.
      </List.Item>
      <List.Item>
        Dere gjør eventuelle endringer, og sender til risikoeier for beslutning om risikonivået er
        akseptabelt.
      </List.Item>
      <List.Item>
        Risikoeieren godkjenner restrisikoen. Idet risikoeier gjør det, arkiveres den endelige,
        godkjente PVK-en i Public360.
      </List.Item>
      <List.Item>
        Hvis dere senere endrer hvordan dere behandler personopplysninger, skal dere vurdere
        risikobildet på nytt. Ved endring i risikobildet, burde en oppdatert PVK sendes inn til PVO
        til en ny vurdering.
      </List.Item>
    </List>
  </ReadMore>
)

export default HvordanSkalViJobbeMedPvkReadMore
