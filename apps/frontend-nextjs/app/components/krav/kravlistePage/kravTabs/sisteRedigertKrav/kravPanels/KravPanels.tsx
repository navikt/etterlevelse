'use client'

import StatusView from '@/components/common/statusTag/StatusTag'
import { EListName, TLovCode, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { IKrav, TKravQL } from '@/constants/krav/kravConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { kravUrl } from '@/routes/krav/kravRoutes'
import { List, Skeleton } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useContext } from 'react'
import { ListLayout } from '../listLayout/listLayout'

type TProps = {
  kravene?: TKravQL[] | IKrav[]
  loading?: boolean
}

export const KravPanels: FunctionComponent<TProps> = ({ kravene, loading }) => {
  const codelist = useContext(CodelistContext)
  return (
    <>
      {loading && <Skeleton variant='rectangle' />}
      {!loading && (
        <List className='mb-2.5 flex flex-col gap-2'>
          {kravene &&
            kravene.map((krav: IKrav | TKravQL) => {
              const lov: TLovCode = codelist.utils.getCode(
                EListName.LOV,
                krav.regelverk[0]?.lov?.code
              ) as TLovCode
              const tema: TTemaCode = codelist.utils.getCode(
                EListName.TEMA,
                lov?.data?.tema
              ) as TTemaCode

              return (
                <ListLayout
                  key={krav.id}
                  id={krav.id}
                  url={`${kravUrl}/${krav.kravNummer}/${krav.kravVersjon}`}
                  documentNumber={`K${krav.kravNummer}.${krav.kravVersjon}`}
                  title={krav.navn}
                  status={<StatusView status={krav.status} />}
                  upperRightField={tema && tema.shortName ? tema.shortName : ''}
                  changeStamp={
                    krav.changeStamp.lastModifiedDate !== undefined &&
                    krav.changeStamp.lastModifiedDate !== ''
                      ? `Sist endret: ${moment(krav.changeStamp.lastModifiedDate).format('LL')}`
                      : ''
                  }
                />
              )
            })}
        </List>
      )}
    </>
  )
}
