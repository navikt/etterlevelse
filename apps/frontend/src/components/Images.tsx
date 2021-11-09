import archiveImage from '../resources/img/archive.png'
import archive2Image from '../resources/img/archive2.png'
import hammerImage from '../resources/img/hammer.png'
import keyboardImage from '../resources/img/keyboard.png'
import peopleImage from '../resources/img/people.png'
import scalesImage from '../resources/img/scales.png'
import cameraImage from '../resources/img/camera.png'
import guardianImage from '../resources/img/guardian.png'
import navImage from '../resources/img/nav-logo-red.svg'
import moneyImage from '../resources/img/money.png'
import bookImage from '../resources/img/book.png'

import pencilFill from '../resources/icons/pencil-fill.svg'
import lawBook from '../resources/icons/law-book-shield.svg'
import barChart from '../resources/icons/bar-chart.svg'
import stepper from '../resources/icons/stepper.svg'
import logo from '../resources/icons/logo.svg'
import chevronLeft from '../resources/icons/chevron-left.svg'
import navChevronDownIcon from '../resources/icons/nav-chevron-down.svg'
import plusIcon from '../resources/icons/plus.svg'
import deleteIcon from '../resources/icons/delete.svg'
import editIcon from '../resources/icons/edit.svg'
import editSecondaryIcon from '../resources/icons/edit-secondary.svg'
import searchIcon from '../resources/icons/search-icon.svg'
import questionmarkIcon from '../resources/icons/questionmark.svg'
import questionmarkHoverIcon from '../resources/icons/questionmark-hover.svg'
import questionmarkFocusIcon from '../resources/icons/questionmark-focus.svg'
import pageIcon from '../resources/icons/page.svg'
import mailboxPoppingIcon from '../resources/icons/mailbox-popping.svg'
import sadFolderIcon from '../resources/icons/sad-folder.svg'
import bamseIcon from '../resources/icons/Bamse.svg'
import navChevronRightIcon from '../resources/icons/nav-chevron-right.svg'
import bokEtterlevelseIcon from '../resources/icons/bok-etterlevelse-ikon.svg'
import sokButtonIcon from '../resources/icons/icon_button_search.svg'
import arrowRightIcon from '../resources/icons/arrow-right.svg'
import gavelIcon from '../resources/icons/gavel.svg'

import paperPenIconBg from '../resources/icons/with_bg/arkPennBg.svg'
import gavelIconBg from '../resources/icons/with_bg/gavelBg.svg'
import grafIconBg from '../resources/icons/with_bg/grafBg.svg'
import paragrafIconBg from '../resources/icons/with_bg/paragrafBg.svg'
import ellipse80 from '../resources/icons/ellipse80.svg'

import checkmarkIcon from '../resources/icons/check.svg'
import arkPennIcon from '../resources/icons/ark-penn-ikon.svg'
import grafIcon from '../resources/icons/graf-ikon.svg'
import husIcon from '../resources/icons/hus-ikon.svg'
import paragrafIcon from '../resources/icons/paragraf-ikon.svg'
import crossIcon from '../resources/icons/cross.svg'
import circlePencilIcon from '../resources/icons/circle-pencil-icon.svg'
import filterIcon from '../resources/icons/filterIcon.svg'
import clearSearchIcon from '../resources/icons/clearSearchIcon.svg'
import illustration from '../resources/giammarco-boscaro-zeH-ljawHtg-unsplash.jpg'
import warningAlert from '../resources/icons/warning-alert.svg'
import exitIcon from '../resources/icons/exit-icon.svg'
import handWithLeaf from '../resources/icons/hand-with-leaf.svg'
import checkboxChecked from '../resources/icons/checkbox/checkbox-checked.svg'
import checkboxUnchecked from '../resources/icons/checkbox/checkbox-unchecked.svg'
import checkboxUncheckedHover from '../resources/icons/checkbox/checkbox-unchecked-hover.svg'
import { codelist, ListName, LovCode, TemaCode } from '../services/Codelist'

import React from 'react'
import { theme } from '../util'

export {
  pencilFill,
  lawBook,
  barChart,
  illustration,
  navImage,
  stepper,
  logo,
  chevronLeft,
  plusIcon,
  deleteIcon,
  editIcon,
  editSecondaryIcon,
  ellipse80,
  searchIcon,
  questionmarkIcon,
  questionmarkHoverIcon,
  questionmarkFocusIcon,
  mailboxPoppingIcon,
  sadFolderIcon,
  pageIcon,
  bamseIcon,
  sokButtonIcon,
  bokEtterlevelseIcon,
  navChevronRightIcon,
  navChevronDownIcon,
  arkPennIcon,
  grafIcon,
  husIcon,
  paragrafIcon,
  arrowRightIcon,
  crossIcon,
  checkmarkIcon,
  grafIconBg,
  paperPenIconBg,
  gavelIconBg,
  paragrafIconBg,
  circlePencilIcon,
  gavelIcon,
  filterIcon,
  clearSearchIcon,
  exitIcon,
  warningAlert,
  handWithLeaf,
  checkboxChecked,
  checkboxUnchecked,
  checkboxUncheckedHover,
}

export const temaBilder: { [id: string]: string } = {
  ARCHIVE: archiveImage,
  ARCHIVE2: archive2Image,
  KEYBOARD: keyboardImage,
  PEOPLE: peopleImage,
  BOOK: bookImage,
  SCALES: scalesImage,
  HAMMER: hammerImage,
  MONEY: moneyImage,
  NAV: navImage,
  CAMERA: cameraImage,
  GUARDIAN: guardianImage,
}

const bildeForLov = (code: LovCode) => bildeForTema(code.data?.tema)

const bildeForTema = (code?: string) => {
  const temaCode = codelist.getCode(ListName.TEMA, code)
  const imageCode = temaCode?.data?.image
  return imageCode ? temaBilder[imageCode] || bookImage : bookImage
}

export const LovBilde = (props: { code: LovCode } & BildeProps) => <Bilde {...props} src={bildeForLov(props.code)} alt={`Lov illustrasjon: ${props.code.shortName}`} />

export const TemaBilde = (props: { code: TemaCode } & BildeProps) => <Bilde {...props} src={bildeForTema(props.code.code)} alt={`Tema illustrasjon: ${props.code.shortName}`} />

type BildeProps = {
  width?: string
  height?: string
  ellipse?: boolean
}

const Bilde = (props: { src: string; alt: string } & BildeProps) => (
  <img
    src={props.src}
    width={props.width}
    height={props.height}
    style={{
      objectFit: 'cover',
      borderRadius: props.ellipse ? '15px' : undefined,
      border: props.ellipse ? `2px solid ${theme.colors.mono600}` : undefined,
    }}
    alt={props.alt}
  />
)
