import { RawDraftContentState, RawDraftInlineStyleRange } from 'draft-js'

export const translateUnderlineAndHighlight = (draftData: RawDraftContentState) => {
  translateUnderlineToDraft(draftData)
  translateHighlightToDraft(draftData)
}

const highlightTagRegex: RegExp = /<span style='background-color: rgb(.*?)'>(.*?)<\/span>/g
const underlineTagRegex: RegExp = /<ins>(.*?)<\/ins>/g

const removeUnderlineTagsFromDraftText = (text: string) =>
  text.replaceAll('<ins>', '').replaceAll('</ins>', '')

const removeHighlightTagsFromDraftText = (text: string) =>
  text.replaceAll(/<span style='background-color: rgb(.*?)'>/g, '').replaceAll('</span>', '')

const addHighlight = (result: RegExpExecArray, newStyles: RawDraftInlineStyleRange[]) => {
  const highlightMatches = result[0].matchAll(
    /<span style='background-color: rgb(.*?)'>(.*?)<\/span>/g
  )
  highlightMatches.forEach((highlight) => {
    const highlightStyle = {
      offset: 0,
      length: 0,
      style: '',
    }

    highlight.forEach((value: string, index: number) => {
      if (index === 1) {
        highlightStyle.style = 'bgcolor-rgb' + value
      }
      if (index === 2) {
        highlightStyle.offset = highlight.index
        highlightStyle.length = value.length
      }
    })
    newStyles.push(highlightStyle as RawDraftInlineStyleRange)
  })
}

const addUnderlineAfterHighlight = (
  result: RegExpExecArray,
  newStyles: RawDraftInlineStyleRange[]
) => {
  result.forEach((value: string, index: number) => {
    if (index === 1) {
      const textWithOuthighlightTags = removeHighlightTagsFromDraftText(value)
      newStyles.push({
        offset: result.index,
        length: textWithOuthighlightTags.length,
        style: 'UNDERLINE',
      })
    }
  })
}

const translateUnderlineToDraft = (draftData: RawDraftContentState) => {
  draftData.blocks.map((data) => {
    const newStyles: RawDraftInlineStyleRange[] = []
    const matchesFound = data.text.matchAll(underlineTagRegex)

    matchesFound.forEach((result) => {
      addHighlight(result, newStyles)
      addUnderlineAfterHighlight(result, newStyles)
    })

    data.text = removeUnderlineTagsFromDraftText(data.text)
    data.inlineStyleRanges = [...data.inlineStyleRanges, ...newStyles]
  })
}

const addUnderline = (result: RegExpExecArray, newStyles: RawDraftInlineStyleRange[]) => {
  const underlineMatches = result[0].matchAll(underlineTagRegex)
  underlineMatches.forEach((underline) => {
    underline.forEach((value: string, index: number) => {
      if (index === 1) {
        newStyles.push({
          offset: underline.index,
          length: value.length,
          style: 'UNDERLINE',
        })
      }
    })
  })
}

const addHighlightAfterUnderline = (
  result: RegExpExecArray,
  newStyles: RawDraftInlineStyleRange[]
) => {
  const highlightStyle = {
    offset: 0,
    length: 0,
    style: '',
  }
  console.debug(result)

  result.forEach((value: string, index: number) => {
    if (index === 1) {
      highlightStyle.style = 'bgcolor-rgb' + value
    }
    if (index === 2) {
      const textWithOutUnderlineTags = removeUnderlineTagsFromDraftText(value)
      highlightStyle.offset = result.index
      highlightStyle.length = textWithOutUnderlineTags.length
    }
  })

  newStyles.push(highlightStyle as RawDraftInlineStyleRange)
}

const translateHighlightToDraft = (draftData: RawDraftContentState) => {
  draftData.blocks.map((data) => {
    const newStyles: RawDraftInlineStyleRange[] = []
    const matchesFound = data.text.matchAll(highlightTagRegex)

    matchesFound.forEach((result) => {
      addUnderline(result, newStyles)
      addHighlightAfterUnderline(result, newStyles)
    })

    data.text = removeHighlightTagsFromDraftText(data.text)
    data.inlineStyleRanges = [...data.inlineStyleRanges, ...newStyles]
  })
}
