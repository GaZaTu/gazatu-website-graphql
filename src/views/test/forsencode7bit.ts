const codeword = 'forsen'
const codewordSize = codeword.length + 1
const codewordLimit = Math.pow(2, codewordSize)

const spaceUpper = '\xa0'
const spaceLower = '\x20'

const spaceAltUpper = '!'
const spaceAltLower = '?'

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
            return ' '
          }
        } finally {
          prevCharWasInvalid = false
        }
      }

      const asciiBitString = ascii.toString(2).padStart(codewordSize, '0')

      const encodedChar = [...codeword, spaceLower]
        .map((cc, i) => {
          const upper = !!Number(asciiBitString[i])

          if (i === (codewordSize - 1)) {
            return upper ? spaceUpper : spaceLower
          } else {
            return upper ? cc.toUpperCase() : cc.toLowerCase()
          }
        })
        .join('')

      return encodedChar
    })
    .join('')

  if (code.endsWith(spaceUpper)) {
    code = code.trimRight() + spaceAltUpper
  } else {
    code = code.trimRight() + spaceAltLower
  }

  return code
}

export const decodeForsenCode7Bit = (code: string) => {
  code = code.trim()

  const codeInLowercase = code.toLowerCase()

  let text = ''

  let i = 0
  let b = 0

  for (; (i = codeInLowercase.indexOf(codeword, i)) !== -1;) {
    text += code.slice(b, i)
    b = i

    const encodedChar = code.slice(i, i + codewordSize)
    if (
      (!encodedChar.endsWith(spaceUpper) && !encodedChar.endsWith(spaceAltUpper)) &&
      (!encodedChar.endsWith(spaceLower) && !encodedChar.endsWith(spaceAltLower))
    ) {
      i += encodedChar.length
      continue
    }

    const asciiBitString = [...encodedChar]
      .map((bc, i) => {
        let upper = false

        if (i === (codewordSize - 1)) {
          upper = (encodedChar.endsWith(spaceUpper) || encodedChar.endsWith(spaceAltUpper))
        } else {
          upper = (bc.toUpperCase() === bc)
        }

        return upper ? '1' : '0'
      })
      .join('')

    const ascii = parseInt(asciiBitString, 2)

    const decodedChar = String.fromCharCode(ascii)

    text += decodedChar

    i += encodedChar.length
    b = i
  }

  text += code.slice(b)

  return text
}

const encoded = encodeForsenCode7Bit('Hello 😎 World! 123')
console.log(encoded)

const decoded = decodeForsenCode7Bit(encoded)
console.log(decoded)
