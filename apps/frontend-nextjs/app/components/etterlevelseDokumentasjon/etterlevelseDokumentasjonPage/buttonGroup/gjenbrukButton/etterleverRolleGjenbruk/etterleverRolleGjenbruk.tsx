import { ComponentProps, FunctionComponent } from 'react'
import { CommonVariantOneGjenbruk } from '../commonGjenbruk/commonGjenbruk'

const EtterleverRolleGjenbruk: FunctionComponent<
  ComponentProps<typeof CommonVariantOneGjenbruk>
> = (props) => <CommonVariantOneGjenbruk {...props} />

export default EtterleverRolleGjenbruk
