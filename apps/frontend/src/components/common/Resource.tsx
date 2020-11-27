import React, {useEffect, useState} from 'react'
import {getResourceById} from '../../api/TeamApi'

export const ResourceName = ({id}: {id: string}) => {
  const [name, setName] = useState(id)

  useEffect(() => {
    getResourceById(id).then(r => setName(r.fullName))
  }, [id])

  return <>{name}</>
}
