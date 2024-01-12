import archiveImage from '../resources/img/archive.png'
import archive2Image from '../resources/img/archive2.png'
import bookImage from '../resources/img/book.png'
import cameraImage from '../resources/img/camera.png'
import guardianImage from '../resources/img/guardian.png'
import hammerImage from '../resources/img/hammer.png'
import keyboardImage from '../resources/img/keyboard.png'
import moneyImage from '../resources/img/money.png'
import navImage from '../resources/img/nav-logo-red.svg'
import peopleImage from '../resources/img/people.png'
import scalesImage from '../resources/img/scales.png'

import arrowRightIcon from '../resources/icons/arrow-right.svg'
import bamseIcon from '../resources/icons/Bamse.svg'
import barChart from '../resources/icons/bar-chart.svg'
import bokEtterlevelseIcon from '../resources/icons/bok-etterlevelse-ikon.svg'
import chevronLeft from '../resources/icons/chevron-left.svg'
import deleteIconGreen600 from '../resources/icons/delete-green600.svg'
import deleteIcon from '../resources/icons/delete.svg'
import editSecondaryIcon from '../resources/icons/edit-secondary.svg'
import editIcon from '../resources/icons/edit.svg'
import gavelIcon from '../resources/icons/gavel.svg'
import sokButtonIcon from '../resources/icons/icon_button_search.svg'
import lawBook from '../resources/icons/law-book-shield.svg'
import logo from '../resources/icons/logo.svg'
import mailboxPoppingIcon from '../resources/icons/mailbox-popping.svg'
import navChevronDownIcon from '../resources/icons/nav-chevron-down.svg'
import navChevronRightIcon from '../resources/icons/nav-chevron-right.svg'
import pageIcon from '../resources/icons/page.svg'
import pencilFill from '../resources/icons/pencil-fill.svg'
import plusIcon from '../resources/icons/plus.svg'
import questionmarkFocusIcon from '../resources/icons/questionmark-focus.svg'
import questionmarkHoverIcon from '../resources/icons/questionmark-hover.svg'
import questionmarkIcon from '../resources/icons/questionmark.svg'
import sadFolderIcon from '../resources/icons/sad-folder.svg'
import searchIcon from '../resources/icons/search-icon.svg'
import stepper from '../resources/icons/stepper.svg'

import ellipse80 from '../resources/icons/ellipse80.svg'
import paperPenIconBg from '../resources/icons/with_bg/arkPennBg.svg'
import gavelIconBg from '../resources/icons/with_bg/gavelBg.svg'
import grafIconBg from '../resources/icons/with_bg/grafBg.svg'
import paragrafIconBg from '../resources/icons/with_bg/paragrafBg.svg'

import illustration from '../resources/giammarco-boscaro-zeH-ljawHtg-unsplash.jpg'
import angleIcon from '../resources/icons/angleIcon.svg'
import arkCheckIcon from '../resources/icons/ark-check-ikon.svg'
import arkPennIcon from '../resources/icons/ark-penn-ikon.svg'
import avatarPlaceholder from '../resources/icons/avatar-placeholder.svg'
import checkmarkIcon from '../resources/icons/check.svg'
import checkboxChecked from '../resources/icons/checkbox/checkbox-checked.svg'
import checkboxUncheckedHover from '../resources/icons/checkbox/checkbox-unchecked-hover.svg'
import checkboxUnchecked from '../resources/icons/checkbox/checkbox-unchecked.svg'
import circlePencilIcon from '../resources/icons/circle-pencil-icon.svg'
import clearSearchIcon from '../resources/icons/clearSearchIcon.svg'
import crossIcon from '../resources/icons/cross.svg'
import etterlevelseLogoWhiteIcon from '../resources/icons/etterlevelse-logo-white.svg'
import exitIcon from '../resources/icons/exit-icon.svg'
import externalLinkIcon from '../resources/icons/externalLinkIcon.svg'
import eyeSlash from '../resources/icons/eye-slash.svg'
import filterIcon from '../resources/icons/filterIcon.svg'
import grafIcon from '../resources/icons/graf-ikon.svg'
import grafIconBgSmall from '../resources/icons/grafIconBg-small.svg'
import handWithLeaf from '../resources/icons/hand-with-leaf.svg'
import husIcon from '../resources/icons/hus-ikon.svg'
import informationIcon from '../resources/icons/information-icon.svg'
import notesWithContentIcon from '../resources/icons/notes-with-content.svg'
import notesIcon from '../resources/icons/notes.svg'
import outlineInfoIcon from '../resources/icons/outline-info-icon.svg'
import page2Icon from '../resources/icons/page2.svg'
import paperPenIconBgSmall from '../resources/icons/paperPenIconBg-small.svg'
import paragrafIcon from '../resources/icons/paragraf-ikon.svg'
import paragrafIconBgSmall from '../resources/icons/paragrafIconBg-small.svg'
import saveArchiveIcon from '../resources/icons/save-archive-icon.svg'
import warningAlert from '../resources/icons/warning-alert.svg'
import { codelist, EListName, TLovCode, TTemaCode } from '../services/Codelist'

import { theme } from '../util'

export {
  angleIcon,
  arkCheckIcon,
  arkPennIcon,
  arrowRightIcon,
  avatarPlaceholder,
  bamseIcon,
  barChart,
  bokEtterlevelseIcon,
  checkboxChecked,
  checkboxUnchecked,
  checkboxUncheckedHover,
  checkmarkIcon,
  chevronLeft,
  circlePencilIcon,
  clearSearchIcon,
  crossIcon,
  deleteIcon,
  deleteIconGreen600,
  editIcon,
  editSecondaryIcon,
  ellipse80,
  etterlevelseLogoWhiteIcon,
  exitIcon,
  externalLinkIcon,
  eyeSlash,
  filterIcon,
  gavelIcon,
  gavelIconBg,
  grafIcon,
  grafIconBg,
  grafIconBgSmall,
  handWithLeaf,
  husIcon,
  illustration,
  informationIcon,
  lawBook,
  logo,
  mailboxPoppingIcon,
  navChevronDownIcon,
  navChevronRightIcon,
  navImage,
  notesIcon,
  notesWithContentIcon,
  outlineInfoIcon,
  page2Icon,
  pageIcon,
  paperPenIconBg,
  paperPenIconBgSmall,
  paragrafIcon,
  paragrafIconBg,
  paragrafIconBgSmall,
  pencilFill,
  plusIcon,
  questionmarkFocusIcon,
  questionmarkHoverIcon,
  questionmarkIcon,
  sadFolderIcon,
  saveArchiveIcon,
  searchIcon,
  sokButtonIcon,
  stepper,
  warningAlert,
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

const bildeForLov = (code: TLovCode) => bildeForTema(code.data?.tema)

const bildeForTema = (code?: string) => {
  const temaCode = codelist.getCode(EListName.TEMA, code)
  const imageCode = temaCode?.data?.image
  return imageCode ? temaBilder[imageCode] || bookImage : bookImage
}

export const LovBilde = (props: { code: TLovCode } & TBildeProps) => (
  <Bilde
    {...props}
    src={bildeForLov(props.code)}
    alt={`Lov illustrasjon: ${props.code.shortName}`}
  />
)

export const TemaBilde = (props: { code: TTemaCode } & TBildeProps) => (
  <Bilde
    {...props}
    src={bildeForTema(props.code.code)}
    alt={`Tema illustrasjon: ${props.code.shortName}`}
  />
)

type TBildeProps = {
  width?: string
  height?: string
  ellipse?: boolean
}

const Bilde = (props: { src: string; alt: string } & TBildeProps) => (
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
