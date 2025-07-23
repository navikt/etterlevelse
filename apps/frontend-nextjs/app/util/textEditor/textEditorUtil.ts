import { RawDraftContentState, RawDraftInlineStyleRange } from 'draft-js'

const highlightTagRegex: RegExp = /<span style='background-color: rgb(.*?)'>(.*?)<\/span>/g
const underlineTagRegex: RegExp = /<ins>(.*?)<\/ins>/g

export const translateUnderlineAndHighlight = (draftData: RawDraftContentState) => {
  translateUnderlineToDraft(draftData)
  translateHighlightToDraft(draftData)
}

export const translateUnderlineToDraft = (draftData: RawDraftContentState) => {
  draftData.blocks.map((data) => {
    const newStyles: RawDraftInlineStyleRange[] = []
    const match = data.text.matchAll(underlineTagRegex)

    let draftTextWithOuthighlightTags = data.text
      .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
      .replaceAll('</span>', '')
    match.forEach((result, matchIndex) => {
      const newUnderlineStyle = {
        offset: 0,
        length: 0,
        style: '',
      }

      if (matchIndex > 0) {
        draftTextWithOuthighlightTags = draftTextWithOuthighlightTags
          .replace('<ins>', '')
          .replace('</ins>', '')
      }
      newUnderlineStyle.offset = draftTextWithOuthighlightTags.indexOf('<ins')

      result.forEach((value: string, index: number) => {
        if (index === 1) {
          const textWithOuthighlightTags = value
            .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
            .replaceAll('</span>', '')
          newUnderlineStyle.length = textWithOuthighlightTags.length
          newUnderlineStyle.style = 'UNDERLINE'

          newStyles.push(newUnderlineStyle as RawDraftInlineStyleRange)
        }
      })
    })

    data.text = data.text.replaceAll('<ins>', '').replaceAll('</ins>', '')
    const inlineStyleRanges = data.inlineStyleRanges ? data.inlineStyleRanges : []
    data.inlineStyleRanges = [...inlineStyleRanges, ...newStyles]
  })
}

export const translateHighlightToDraft = (draftData: RawDraftContentState) => {
  draftData.blocks.map((data) => {
    const match = data.text.matchAll(highlightTagRegex)
    const newStyles: RawDraftInlineStyleRange[] = []

    let draftTextWithoutUnderlineTags = data.text.replaceAll('<ins>', '').replaceAll('</ins>', '')
    match.forEach((result, matchIndex) => {
      const highlightStyle = {
        offset: 0,
        length: 0,
        style: '',
      }

      if (matchIndex > 0) {
        draftTextWithoutUnderlineTags = draftTextWithoutUnderlineTags
          .replace(/<span style='background-color: rgb(.*?)'>/, '')
          .replace('</span>', '')
      }
      highlightStyle.offset = draftTextWithoutUnderlineTags.indexOf('<span')

      result.forEach((value: string, index: number) => {
        if (index === 1) {
          highlightStyle.style = 'bgcolor-rgb' + value
        }
        if (index === 2) {
          const textWithOutUnderlineTags = value.replaceAll('<ins>', '').replaceAll('</ins>', '')
          highlightStyle.length = textWithOutUnderlineTags.length
        }
      })

      newStyles.push(highlightStyle as RawDraftInlineStyleRange)
    })

    data.text = data.text
      .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
      .replaceAll('</span>', '')

    const inlineStyleRanges = data.inlineStyleRanges ? data.inlineStyleRanges : []

    data.inlineStyleRanges = [...inlineStyleRanges, ...newStyles]
  })
}

export const editorTranslations = {
  // Generic
  'generic.add': 'Legg Til',
  'generic.cancel': 'Avbryt',

  // BlockType
  'components.controls.blocktype.h2': 'H2',
  'components.controls.blocktype.h3': 'H3',
  'components.controls.blocktype.h4': 'H4',
  'components.controls.blocktype.h5': 'H5',
  'components.controls.blocktype.h6': 'H6',
  'components.controls.blocktype.blockquote': 'Blockquote',
  'components.controls.blocktype.code': 'Code',
  'components.controls.blocktype.blocktype': 'Block Type',
  'components.controls.blocktype.normal': 'Normal',

  // History
  'components.controls.history.history': 'History',
  'components.controls.history.undo': 'Undo',
  'components.controls.history.redo': 'Redo',

  //colorPicker
  'components.controls.colorpicker.colorpicker': 'Color Picker',
  'components.controls.colorpicker.text': 'Text',
  'components.controls.colorpicker.background': 'Highlight',

  // Inline
  'components.controls.inline.bold': 'Bold',
  'components.controls.inline.italic': 'Italic',
  'components.controls.inline.underline': 'Underline',
  'components.controls.inline.strikethrough': 'Strikethrough',
  'components.controls.inline.monospace': 'Monospace',

  // Link
  'components.controls.link.linkTitle': 'Link Tittel',
  'components.controls.link.linkTarget': 'Link Url',
  'components.controls.link.linkTargetOption': 'Åpne link i en ny fane',
  'components.controls.link.link': 'Link',
  'components.controls.link.unlink': 'Unlink',

  // List
  'components.controls.list.list': 'List',
  'components.controls.list.unordered': 'Unordered',
  'components.controls.list.ordered': 'Ordered',
  'components.controls.list.indent': 'Indent',
  'components.controls.list.outdent': 'Outdent',

  // Remove
  'components.controls.remove.remove': 'Fjerne',
}
