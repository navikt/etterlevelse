'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { FunctionComponent, useContext } from 'react'
import { CommonActionMenuGjenbruk } from './commonGjenbruk/commonGjenbruk'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
}

const GjenbrukButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}) => {
  const user = useContext(UserContext)
  const isAdmin = user.isAdmin()
  const isPersonvernombud = user.isPersonvernombud()
  const hasAccess = etterlevelseDokumentasjon.hasCurrentUserAccess

  if (isPersonvernombud && !isAdmin) {
    return null
  }

  if (!isAdmin && !hasAccess) {
    return null
  }

  const canManage = isAdmin || hasAccess

  return (
    <CommonActionMenuGjenbruk
      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
      setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
      canManage={canManage}
    />
  )
}

export default GjenbrukButton
