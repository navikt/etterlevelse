import StatusView from '@/components/common/statusTag/StatusTag'
import { EListName, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { IKrav, TKravQL } from '@/constants/krav/kravConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { kravUrl } from '@/routes/krav/kravRoutes'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { List, Skeleton } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { ListLayout } from '../listLayout/listLayout'

type TProps = {
  kravene?: TKravQL[] | IKrav[]
  loading?: boolean
}

export const KravPanels: FunctionComponent<TProps> = ({ kravene, loading }) => (
  <>
    {loading && <Skeleton variant='rectangle' />}
    {!loading && (
      <List className='mb-2.5 flex flex-col gap-2'>
        {kravene &&
          kravene.map((krav: IKrav | TKravQL) => {
            const lov: TLovCode = codelist.getCode(
              EListName.LOV,
              krav.regelverk[0]?.lov?.code
            ) as TLovCode
            const tema: TTemaCode = codelist.getCode(EListName.TEMA, lov?.data?.tema) as TTemaCode

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
