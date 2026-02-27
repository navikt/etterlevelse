import { ComponentProps, FunctionComponent } from 'react'
import { CommonVariantOneGjenbruk } from '../commonGjenbruk/commonGjenbruk'

const AdminRolleGjenbruk: FunctionComponent<ComponentProps<typeof CommonVariantOneGjenbruk>> = (
  props
) => <CommonVariantOneGjenbruk {...props} />

export default AdminRolleGjenbruk
