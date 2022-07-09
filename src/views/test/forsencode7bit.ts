const codeword = 'forsen'
const codewordBitSize = codeword.length + 1
const codewordLimit = Math.pow(2, codewordBitSize)

const decodingMapForO = {
  'Ö': '00',
  'ö': '01',
  'O': '10',
  'o': '11',
} as Record<string, string>

const encodingMapForO = Object.fromEntries(
  Object.entries(decodingMapForO)
    .map(([k, v]) => [v, k])
) as Record<string, string>

export const encodeForsenCode7Bit = (text: string, lenient = true) => {
  text = text.trim()

  let prevCharWasInvalid = false

  let code = [...text]
    .map((decodedChar, i) => {
      let ascii = decodedChar.charCodeAt(0)
      if (ascii >= codewordLimit) {
        if (lenient) {
          prevCharWasInvalid = true
          return decodedChar
        } else {
          return ''
        }
      }

      if (lenient) {
        if (decodedChar === ' ' && prevCharWasInvalid) {
          prevCharWasInvalid = false
          return ''
        }
      }

      const asciiBitString = ascii.toString(2).padStart(codewordBitSize, '0')

      let bit = 0
      const encodedChar = [...codeword]
        .map((cc, i) => {
          if (codeword[i] === 'o') {
            const state = asciiBitString.slice(bit++, ++bit)
            return encodingMapForO[state]
          }

          const upper = !!Number(asciiBitString[bit++])
          return upper ? cc.toUpperCase() : cc.toLowerCase()
        })
        .join('')

      try {
        if (i > 0 && !prevCharWasInvalid) {
          return ` ${encodedChar}`
        } else {
          return encodedChar
        }
      } finally {
        prevCharWasInvalid = false
      }
    })
    .join('')

  return code
}

export const decodeForsenCode7Bit = (code: string) => {
  code = code.trim()

  const searchableCode = code
    .toLowerCase()
    .replaceAll('ö', 'o')

  let text = ''

  let i = 0
  let b = 0

  for (; (i = searchableCode.indexOf(codeword, i)) !== -1;) {
    text += code.slice(b, i)
    b = i

    const encodedChar = code.slice(i, i + codeword.length)

    const asciiBitString = [...encodedChar]
      .map((bc, i) => {
        if (codeword[i] === 'o') {
          return decodingMapForO[bc]
        }

        const upper = (bc.toUpperCase() === bc)
        return upper ? '1' : '0'
      })
      .join('')

    const ascii = parseInt(asciiBitString, 2)

    const decodedChar = String.fromCharCode(ascii)

    text += decodedChar

    i += encodedChar.length
    b = i

    if (searchableCode[b] === ' ') {
      b += 1
    }
  }

  if (searchableCode[b - 1] === ' ') {
    b -= 1
  }

  text += code.slice(b)

  return text
}
