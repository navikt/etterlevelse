import StatusView from '@/components/common/statusTag/StatusTag'
import { IKrav } from '@/constants/krav/kravConstants'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { BodyLong, BodyShort, Label, LinkPanel, List, Spacer } from '@navikt/ds-react'
import moment from 'moment'

export const getKravTemaRowsWithLabel = (kravListe: IKrav[], tema: string) => (
  <>
    {kravListe.map((krav: IKrav, index: number) => (
      <List.Item icon={<div />} key={`${krav.navn}_${krav.kravNummer}_${tema}_${index}`}>
        <LinkPanel href={kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon)}>
          <LinkPanel.Title className='flex items-center'>
            <div className='max-w-xl'>
              <BodyShort size='small'>
                K{krav.kravNummer}.{krav.kravVersjon}
              </BodyShort>
              <BodyLong>
                <Label>{krav.navn}</Label>
              </BodyLong>
            </div>
            <Spacer />
            <div className='mr-5'>
              <StatusView status={krav.status} />
            </div>
            <div className='w-44'>
              <BodyShort size='small'>
                {krav.changeStamp.lastModifiedDate !== undefined &&
                krav.changeStamp.lastModifiedDate !== ''
                  ? `Sist endret: ${moment(krav.changeStamp.lastModifiedDate).format('LL')}`
                  : ''}
              </BodyShort>
            </div>
          </LinkPanel.Title>
        </LinkPanel>
      </List.Item>
    ))}
  </>
)
