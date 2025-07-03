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

const removeTagsFromDraftText = (text: string) => {
  let newText = text
  newText = removeUnderlineTagsFromDraftText(newText)
  newText = removeHighlightTagsFromDraftText(newText)
  return newText
}

const addHighlight = (
  result: RegExpExecArray,
  plainText: string,
  newStyles: RawDraftInlineStyleRange[],
  draftText: string
) => {
  const highlightMatches = result[0].matchAll(highlightTagRegex)

  let textWithoutUnderlineTag = removeUnderlineTagsFromDraftText(draftText)
  highlightMatches.forEach((highlight, matchIndex) => {
    const highlightStyle = {
      offset: 0,
      length: 0,
      style: '',
    }

    if (matchIndex > 0) {
      textWithoutUnderlineTag = textWithoutUnderlineTag
        .replace(/<span style='background-color: rgb(.*?)'>/, '')
        .replace('</span>', '')
      highlightStyle.offset = textWithoutUnderlineTag.indexOf('<span')
    }

    highlight.map((value: string, index: number) => {
      if (index === 1) {
        highlightStyle.style = 'bgcolor-rgb' + value
      }
      if (index === 2) {
        highlightStyle.length = value.length
        if (matchIndex === 0) {
          highlightStyle.offset = plainText.indexOf(value)
        }
      }
    })
    newStyles.push(highlightStyle as RawDraftInlineStyleRange)
  })
}

const addUnderline = (
  result: RegExpExecArray,
  plainText: string,
  newStyles: RawDraftInlineStyleRange[],
  draftText: string
) => {
  const underlineMatches = result[0].matchAll(underlineTagRegex)
  let textWithOuthighlightTags = removeHighlightTagsFromDraftText(draftText)
  underlineMatches.forEach((underline, matchIndex) => {
    const newUnderlineStyle = {
      offset: 0,
      length: 0,
      style: '',
    }

    if (matchIndex > 0) {
      textWithOuthighlightTags = textWithOuthighlightTags.replace('<ins>', '').replace('</ins>', '')
      newUnderlineStyle.offset = textWithOuthighlightTags.indexOf('<ins')
    }

    underline.forEach((value: string, index: number) => {
      if (index === 1) {
        if (matchIndex === 0) {
          newUnderlineStyle.offset = plainText.indexOf(value)
        }
        newUnderlineStyle.length = textWithOuthighlightTags.length
        newUnderlineStyle.style = 'UNDERLINE'

        newStyles.push(newUnderlineStyle as RawDraftInlineStyleRange)
      }
    })
  })
}

export const translateUnderlineToDraft = (draftData: RawDraftContentState) => {
  draftData.blocks.map((data) => {
    const plainText = removeTagsFromDraftText(data.text)
    const newStyles: RawDraftInlineStyleRange[] = []
    const match = data.text.matchAll(underlineTagRegex)
    let draftTextWithOuthighlightTags = removeHighlightTagsFromDraftText(data.text)
    match.forEach((result, matchIndex) => {
      addHighlight(result, plainText, newStyles, data.text)

      const newUnderlineStyle = {
        offset: 0,
        length: 0,
        style: '',
      }

      if (matchIndex > 0) {
        draftTextWithOuthighlightTags = draftTextWithOuthighlightTags
          .replace('<ins>', '')
          .replace('</ins>', '')
        newUnderlineStyle.offset = draftTextWithOuthighlightTags.indexOf('<ins')
      }

      result.forEach((value: string, index: number) => {
        if (index === 1) {
          const textWithOuthighlightTags = removeHighlightTagsFromDraftText(value)

          if (matchIndex === 0) {
            newUnderlineStyle.offset = plainText.indexOf(textWithOuthighlightTags)
          }
          newUnderlineStyle.length = textWithOuthighlightTags.length
          newUnderlineStyle.style = 'UNDERLINE'

          newStyles.push(newUnderlineStyle as RawDraftInlineStyleRange)
        }
      })
    })

    data.text = removeUnderlineTagsFromDraftText(data.text)
    const inlineStyleRanges = data.inlineStyleRanges ? data.inlineStyleRanges : []
    data.inlineStyleRanges = [...inlineStyleRanges, ...newStyles]
  })
}

export const translateHighlightToDraft = (draftData: RawDraftContentState) => {
  draftData.blocks.map((data) => {
    const plainText = removeTagsFromDraftText(data.text)
    const match = data.text.matchAll(highlightTagRegex)
    const newStyles: RawDraftInlineStyleRange[] = []

    let draftTextWithoutUnderlineTags = removeUnderlineTagsFromDraftText(data.text)
    match.forEach((result, matchIndex) => {
      addUnderline(result, plainText, newStyles, data.text)

      const highlightStyle = {
        offset: 0,
        length: 0,
        style: '',
      }

      if (matchIndex > 0) {
        draftTextWithoutUnderlineTags = draftTextWithoutUnderlineTags
          .replace(/<span style='background-color: rgb(.*?)'>/, '')
          .replace('</span>', '')
        highlightStyle.offset = draftTextWithoutUnderlineTags.indexOf('<span')
      }

      result.forEach((value: string, index: number) => {
        if (index === 1) {
          highlightStyle.style = 'bgcolor-rgb' + value
        }
        if (index === 2) {
          const textWithOutUnderlineTags = removeUnderlineTagsFromDraftText(value)
          if (matchIndex === 0) {
            highlightStyle.offset = plainText.indexOf(textWithOutUnderlineTags)
          }
          highlightStyle.length = textWithOutUnderlineTags.length
        }
      })

      newStyles.push(highlightStyle as RawDraftInlineStyleRange)
    })

    data.text = removeHighlightTagsFromDraftText(data.text)

    const inlineStyleRanges = data.inlineStyleRanges ? data.inlineStyleRanges : []

    data.inlineStyleRanges = [...inlineStyleRanges, ...newStyles]
  })
}
