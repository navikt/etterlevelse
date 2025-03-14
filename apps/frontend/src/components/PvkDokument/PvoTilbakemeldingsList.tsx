import { List, Skeleton } from '@navikt/ds-react'
import moment from 'moment'
import { IPvkDokumentListItem } from '../../constants'
import { ListLayout } from '../ListLayout'
import StatusView from '../common/StatusTag'

interface IProps {
  allPvkDocumentListItem: IPvkDokumentListItem[]
  isLoading: boolean
}

export const PvoTilbakemeldingsList = ({ allPvkDocumentListItem, isLoading }: IProps) => (
  <div>
    {isLoading && <Skeleton variant="rectangle" />}
    {!isLoading && (
      <List className="mb-2.5 flex flex-col gap-2">
        {allPvkDocumentListItem &&
          allPvkDocumentListItem.map((pvkDokument: IPvkDokumentListItem) => (
            <ListLayout
              key={pvkDokument.id}
              id={pvkDokument.id}
              url={`/pvo/pvkdokument/${pvkDokument.id}/tilbakemelding/1`}
              documentNumber={`E${pvkDokument.etterlevelseNummer}`}
              title={pvkDokument.title}
              status={
                <StatusView
                  status={pvkDokument.status === 'AKTIV' ? 'Under arbeid' : pvkDokument.status}
                />
              }
              upperRightField="PVK dokument ble"
              changeStamp={
                pvkDokument.changeStamp.lastModifiedDate !== undefined &&
                pvkDokument.changeStamp.lastModifiedDate !== ''
                  ? `sist endret: ${moment(pvkDokument.changeStamp.lastModifiedDate).format('ll')}`
                  : ''
              }
            />
          ))}
      </List>
    )}
  </div>
)
