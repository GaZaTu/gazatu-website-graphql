const codeword = 'forsen'
const codewordBitSize = codeword.length + 1
const codewordLimit = Math.pow(2, codewordBitSize)

export const encodeForsenCode7Bit = (text: string, lenient = true) => {
  text = text.trim()

  let prevCharWasInvalid = false

  let code = [...text]
    .map(decodedChar => {
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
        try {
          if (decodedChar === ' ' && prevCharWasInvalid) {
            return ''
          }
        } finally {
          prevCharWasInvalid = false
        }
      }

      const asciiBitString = ascii.toString(2).padStart(codewordBitSize, '0')

      let bit = 0
      const encodedChar = [...codeword]
        .map((cc, i) => {
          if (codeword[i] === 'o') {
            const state = asciiBitString.slice(bit++, ++bit)
            switch (state) {
              case '00': return 'Ö'
              case '01': return 'ö'
              case '10': return 'O'
              case '11': return 'o'
              default: throw new Error()
            }
          }

          const upper = !!Number(asciiBitString[bit++])
          return upper ? cc.toUpperCase() : cc.toLowerCase()
        })
        .join('')

      return encodedChar
    })
    .filter(c => !!c)
    .join(' ')

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
          switch (bc) {
            case 'Ö': return '00'
            case 'ö': return '01'
            case 'O': return '10'
            case 'o': return '11'
            default: throw new Error()
          }
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
