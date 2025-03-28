import { List, Skeleton } from '@navikt/ds-react'
import moment from 'moment'
import { EPVO, IPvkDokumentListItem } from '../../constants'
import PvoStatusView from '../PvoTilbakemelding/common/PvoStatusView'
import { ListLayout } from '../common/ListLayout'

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
              url={`/pvkdokument/${pvkDokument.id}${EPVO.tilbakemelding}/1`}
              documentNumber={`E${pvkDokument.etterlevelseNummer}`}
              title={pvkDokument.title}
              status={<PvoStatusView status={pvkDokument.status} />}
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
