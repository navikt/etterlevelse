import { IArdoqSystem } from '@/constants/ardoqSystem/ardoqSystemConstants'
import { ardoqSystemLink } from '@/util/config/config'
import { Label, Link, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

interface IProps {
  ardoqSystemData: IArdoqSystem[]
  link?: boolean
  big?: boolean
}

interface IArdoqSystemNameProp {
  ardoqSystem: IArdoqSystem
  link?: boolean
  big?: boolean
}

export const ArdoqSystemName: FunctionComponent<IArdoqSystemNameProp> = ({
  ardoqSystem,
  link,
  big,
}) => {
  return link ? (
    <Link
      className={big ? '' : 'text-medium'}
      rel='noopener noreferrer'
      target={'_blank'}
      href={ardoqSystemLink(ardoqSystem.ardoqUrlId)}
    >
      {ardoqSystem.navn} (åpner i en ny fane)
    </Link>
  ) : (
    <>{ardoqSystem.navn}</>
  )
}

export const ArdoqSystemerView: FunctionComponent<IProps> = ({ ardoqSystemData, link, big }) => (
  <div className='flex gap-2 items-start'>
    <div className='min-w-16'>
      <Label size='medium'>System:</Label>
    </div>
    <div>
      <List>
        {ardoqSystemData.map((system, index) => (
          <List.Item key={`system_${index}`}>
            <ArdoqSystemName ardoqSystem={system} link={link} big={big} />
          </List.Item>
        ))}
      </List>
    </div>
  </div>
)

export default ArdoqSystemerView
