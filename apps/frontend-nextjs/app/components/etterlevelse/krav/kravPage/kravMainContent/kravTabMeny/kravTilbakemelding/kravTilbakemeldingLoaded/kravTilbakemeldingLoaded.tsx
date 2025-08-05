import { InfoBlock } from '@/components/common/infoBlock/infoBlock'
import { mailboxPoppingIcon } from '@/components/others/images/images'
import { IKrav } from '@/constants/krav/kravConstants'
import { ITilbakemelding } from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { ettlevColors } from '@/util/theme/theme'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { KravTilbakemeldingLoadedAccordion } from './kravTilbakemeldingLoadedAccordion/kravTilbakemeldingLoadedAccordion'

type TProps = {
  tilbakemeldinger: ITilbakemelding[]
  krav: IKrav
  loading: boolean
  focusNr: string | undefined
  setFocusNr: Dispatch<SetStateAction<string | undefined>>
  replace: (tilbakemelding: ITilbakemelding) => void
  remove: (tilbakemelding: ITilbakemelding) => void
}

export const KravTilbakemeldingLoaded: FunctionComponent<TProps> = ({
  tilbakemeldinger,
  krav,
  loading,
  focusNr,
  setFocusNr,
  replace,
  remove,
}) => (
  <>
    {!!tilbakemeldinger.length && (
      <KravTilbakemeldingLoadedAccordion
        tilbakemeldinger={tilbakemeldinger}
        krav={krav}
        loading={loading}
        focusNr={focusNr}
        setFocusNr={setFocusNr}
        replace={replace}
        remove={remove}
      />
    )}

    {!tilbakemeldinger.length && (
      <InfoBlock
        icon={mailboxPoppingIcon}
        alt='Åpen mailboks icon'
        text='Det har ikke kommet inn noen tilbakemeldinger'
        color={ettlevColors.red50}
      />
    )}
  </>
)
