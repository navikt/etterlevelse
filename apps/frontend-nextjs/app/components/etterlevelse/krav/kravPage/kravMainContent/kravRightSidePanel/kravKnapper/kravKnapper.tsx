'use client'

import { deleteKrav } from '@/api/krav/kravApi'
import { EKravStatus, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import {
  kravNyVersjonIdUrl,
  kravRedigeringIdUrl,
  kravlisteQueryUrl,
} from '@/routes/krav/kravRoutes'
import { hasKravExpired } from '@/util/hasKravExpired/hasKravExpired'
import { Button, Spacer } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { FunctionComponent, useContext } from 'react'
import { KravSlettKnapp } from './kravSlettKnapp/kravSlettKnapp'

type TProps = {
  alleKravVersjoner: IKravVersjon[]
  krav: TKravQL
}

export const KravKnapper: FunctionComponent<TProps> = ({ alleKravVersjoner, krav }) => {
  const router: AppRouterInstance = useRouter()
  const { isAdmin, isKraveier } = useContext(UserContext)

  const slettKravButtonShouldOnlyBeVisibleOnUtkast: boolean = krav.status === EKravStatus.UTKAST

  return (
    <div className='mt-8'>
      {krav.id && ((isKraveier() && !hasKravExpired(alleKravVersjoner, krav)) || isAdmin()) && (
        <div>
          <div className='flex flex-1'>
            {(!hasKravExpired(alleKravVersjoner, krav) || isAdmin()) && (
              <Button
                type='button'
                size='small'
                variant='primary'
                onClick={() => {
                  router.push(kravRedigeringIdUrl(krav.id))
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
                  router.push(kravNyVersjonIdUrl(krav.id))
                }}
                variant='secondary'
              >
                Ny versjon av krav
              </Button>
            )}
            <Spacer />
          </div>
          {(slettKravButtonShouldOnlyBeVisibleOnUtkast || isAdmin()) && (
            <div className='mt-2.5 flex'>
              <KravSlettKnapp
                buttonLabel='Slett krav'
                buttonSize='small'
                fun={() => deleteKrav(krav.id)}
                redirect={kravlisteQueryUrl()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
