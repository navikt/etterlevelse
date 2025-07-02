import { RawDraftContentState, RawDraftInlineStyleRange } from 'draft-js'

export const translateUnderlineWithHighlightToDraft = (draftData: RawDraftContentState) => {
  return translateMixedUnderlineHighlightStyleToDraft(
    draftData,
    /<ins><span style='background-color: rgb(.*?)'>(.*?)<.*><.*>/g,
    /<ins><span style='background-color: rgb(.*?)'>/g,
    '</span></ins>'
  )
}

export const translateHighlightWithUnderlineToDraft = (draftData: RawDraftContentState) => {
  return translateMixedUnderlineHighlightStyleToDraft(
    draftData,
    /<span style='background-color: rgb(.*?)'><ins>(.*?)<.*><.*>/g,
    /<span style='background-color: rgb(.*?)'><ins>/g,
    '</ins></span>'
  )
}

const translateMixedUnderlineHighlightStyleToDraft = (
  draftData: RawDraftContentState,
  regex: RegExp,
  startTagToRemove: RegExp,
  endTagsToRemove: string
) => {
  draftData.blocks.map((data) => {
    const plainText = data.text.replaceAll(startTagToRemove, '').replaceAll(endTagsToRemove, '')
    const newStyles: RawDraftInlineStyleRange[] = []
    const match = data.text.matchAll(regex)
    match.forEach((result) => {
      const newStyle = {
        offset: 0,
        length: 0,
        style: '',
      }
      const newUnderlineStyle = {
        offset: 0,
        length: 0,
        style: 'UNDERLINE',
      }
      result.forEach((value: string, index: number) => {
        if (index === 1) {
          newStyle.style = 'bgcolor-rgb' + value
        }
        if (index === 2) {
          newStyle.offset = plainText.indexOf(value)
          newUnderlineStyle.offset = plainText.indexOf(value)
          newStyle.length = value.length
          newUnderlineStyle.length = value.length
        }
      })
      newStyles.push(newUnderlineStyle as RawDraftInlineStyleRange)
      newStyles.push(newStyle as RawDraftInlineStyleRange)
    })
    data.text = plainText
    data.inlineStyleRanges = [...data.inlineStyleRanges, ...newStyles]
  })
}

export const translateUnderlineToDraft = (draftData: RawDraftContentState, cleanText?: string) => {
  draftData.blocks.map((data) => {
    const plainText = cleanText
      ? cleanText
      : data.text.replaceAll('<ins>', '').replaceAll('</ins>', '')
    const underlineStyles: RawDraftInlineStyleRange[] = []
    const match = data.text.matchAll(/<ins>(.*?)<\/ins>/g)
    match.forEach((result) => {
      console.debug(result)
      result.forEach((value: string, index: number) => {
        if (index === 1) {
          underlineStyles.push({
            offset: plainText.indexOf(value),
            length: value.length,
            style: 'UNDERLINE',
          })
        }
      })
    })
    data.text = plainText
    data.inlineStyleRanges = [...data.inlineStyleRanges, ...underlineStyles]
  })
}

export const translateHighlightToDraft = (draftData: RawDraftContentState, cleanText?: string) => {
  draftData.blocks.map((data) => {
    const plainText = cleanText
      ? cleanText
      : data.text
          .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
          .replaceAll('</span>', '')
    const highlightStyles: RawDraftInlineStyleRange[] = []
    const match = data.text.matchAll(/<span style='background-color: rgb(.*?)'>(.*?)<\/span>/g)
    match.forEach((result) => {
      const newStyle = {
        offset: 0,
        length: 0,
        style: '',
      }
      result.forEach((value: string, index: number) => {
        if (index === 1) {
          newStyle.style = 'bgcolor-rgb' + value
        }
        if (index === 2) {
          newStyle.offset = plainText.indexOf(value)
          newStyle.length = value.length
        }
      })
      console.debug(newStyle)
      highlightStyles.push(newStyle as RawDraftInlineStyleRange)
    })
    data.text = plainText
    data.inlineStyleRanges = [...data.inlineStyleRanges, ...highlightStyles]
  })
}
