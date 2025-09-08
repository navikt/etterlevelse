import { BodyLong, BodyShort, Label, LinkPanel, List, Spacer } from '@navikt/ds-react'
import { FunctionComponent, JSX } from 'react'

type TProps = {
  id: string
  url: string
  documentNumber: string
  title: string
  status: JSX.Element
  upperRightField: string
  changeStamp: string
}

export const ListLayout: FunctionComponent<TProps> = ({
  id,
  url,
  documentNumber,
  title,
  status,
  upperRightField,
  changeStamp,
}) => (
  <List.Item icon={<div />} className='mb-0' key={id}>
    <LinkPanel href={url}>
      <LinkPanel.Title className='flex items-center'>
        <div className='max-w-xl'>
          <BodyShort size='small'>{documentNumber}</BodyShort>
          <BodyLong>
            <Label>{title}</Label>
          </BodyLong>
        </div>
        <Spacer />
        <div className='mr-5'>{status}</div>
        <div className='w-44'>
          <BodyShort size='small' className='break-words'>
            {upperRightField}
          </BodyShort>
          <BodyShort size='small'>{changeStamp}</BodyShort>
        </div>
      </LinkPanel.Title>
    </LinkPanel>
  </List.Item>
)
