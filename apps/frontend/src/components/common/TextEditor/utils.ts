import { RawDraftContentState, RawDraftInlineStyleRange } from 'draft-js'

export const translateUnderlineAndHighlight = (draftData: RawDraftContentState) => {
  translateUnderlineToDraft(draftData)
  translateHighlightToDraft(draftData)
}

const highlightTagRegex: RegExp = /<span style='background-color: rgb(.*?)'>(.*?)<\/span>/g
const underlineTagRegex: RegExp = /<ins>(.*?)<\/ins>/g

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

      const highlightMatches = result[0].matchAll(highlightTagRegex)

      let textWithoutUnderlineTag = data.text.replaceAll('<ins>', '').replaceAll('</ins>', '')
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
        }
        highlightStyle.offset = textWithoutUnderlineTag.indexOf('<span')

        highlight.map((value: string, index: number) => {
          if (index === 1) {
            highlightStyle.style = 'bgcolor-rgb' + value
          }
          if (index === 2) {
            highlightStyle.length = value.length
          }
        })
        newStyles.push(highlightStyle as RawDraftInlineStyleRange)
      })

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
      const underlineMatches = result[0].matchAll(underlineTagRegex)
      let textWithOuthighlightTags = data.text
        .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
        .replaceAll('</span>', '')

      underlineMatches.forEach((underline, matchIndex) => {
        const newUnderlineStyle = {
          offset: 0,
          length: 0,
          style: '',
        }

        if (matchIndex > 0) {
          textWithOuthighlightTags = textWithOuthighlightTags
            .replace('<ins>', '')
            .replace('</ins>', '')
        }
        newUnderlineStyle.offset = textWithOuthighlightTags.indexOf('<ins')

        underline.forEach((_value, index: number) => {
          if (index === 1) {
            newUnderlineStyle.length = textWithOuthighlightTags.length
            newUnderlineStyle.style = 'UNDERLINE'

            newStyles.push(newUnderlineStyle as RawDraftInlineStyleRange)
          }
        })
      })

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
