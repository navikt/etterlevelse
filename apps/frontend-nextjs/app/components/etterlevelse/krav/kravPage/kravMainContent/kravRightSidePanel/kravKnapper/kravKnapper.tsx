import { deleteKrav } from '@/api/krav/kravApi'
import { EKravStatus, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { kravNyVersjonIdUrl, kravRedigeringIdUrl } from '@/routes/krav/kravRoutes'
import { kravlisteUrl } from '@/routes/krav/kraveier/kraveierRoutes'
import { user } from '@/services/user/userService'
import { hasKravExpired } from '@/util/hasKravExpired/hasKravExpired'
import { Button, Spacer } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { FunctionComponent } from 'react'
import { KravSlettKnapp } from './kravSlettKnapp/kravSlettKnapp'

type TProps = {
  alleKravVersjoner: IKravVersjon[]
  krav: TKravQL
}

export const KravKnapper: FunctionComponent<TProps> = ({ alleKravVersjoner, krav }) => {
  const router: AppRouterInstance = useRouter()

  const slettKravButtonShouldOnlyBeVisibleOnUtkast: boolean = krav.status === EKravStatus.UTKAST

  return (
    <div className='mt-8'>
      {krav.kravId &&
        ((user.isKraveier() && !hasKravExpired(alleKravVersjoner, krav)) || user.isAdmin()) && (
          <div>
            <div className='flex flex-1'>
              {(!hasKravExpired(alleKravVersjoner, krav) || user.isAdmin()) && (
                <Button
                  type='button'
                  size='small'
                  variant='primary'
                  onClick={() => {
                    router.push(kravRedigeringIdUrl(krav.kravId))
                  }}
                >
                  Redigér krav
                </Button>
              )}

              {krav.status === EKravStatus.AKTIV && (
                <Button
                  type='button'
                  className='ml-4'
                  size='small'
                  onClick={() => {
                    router.push(kravNyVersjonIdUrl(krav.kravId))
                  }}
                  variant='secondary'
                >
                  Ny versjon av krav
                </Button>
              )}
              <Spacer />
            </div>
            {(slettKravButtonShouldOnlyBeVisibleOnUtkast || user.isAdmin()) && (
              <div className='mt-2.5 flex'>
                <KravSlettKnapp
                  buttonLabel='Slett krav'
                  buttonSize='small'
                  fun={() => deleteKrav(krav.kravId)}
                  redirect={kravlisteUrl()}
                />
              </div>
            )}
          </div>
        )}
    </div>
  )
}
