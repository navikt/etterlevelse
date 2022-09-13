import axios from 'axios'
import { emptyPage, EtterlevelseArkiv, Or, PageResponse } from '../constants'
import { env } from '../util/env'
import { useEffect, useState } from 'react'
import { useDebouncedState } from '../util/hooks'


export const getAllArkivering = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getArkiveringPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allEtterlevelseArkiv: EtterlevelseArkiv[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allEtterlevelseArkiv = [...allEtterlevelseArkiv, ...(await getArkiveringPage(currentPage, PAGE_SIZE)).content]
    }
    return allEtterlevelseArkiv
  }
}

export const getArkiveringPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<EtterlevelseArkiv>>(`${env.backendBaseUrl}/etterlevelsearkiv?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}