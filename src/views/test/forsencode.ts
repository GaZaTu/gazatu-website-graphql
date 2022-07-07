const codeword = 'forsen'
const encodeLength = Math.pow(2, codeword.length) - 1
const asciiLength = Math.pow(2, 7) - 1

export const encodeForsenCode = (text: string) => {
  return [...text]
    .map(c => {
      let ascii = c.charCodeAt(0)
      if (ascii <= (encodeLength + 1) || ascii > asciiLength) {
        ascii = asciiLength
      }
      if (c === ' ') {
        ascii = encodeLength + 1
      }

      ascii -= (encodeLength + 1)

      const asciiBits = ascii.toString(2).padStart(codeword.length, '0')

      const w = [...codeword]
        .map((c, i) => {
          return Number(asciiBits[i]) ? c.toUpperCase() : c.toLowerCase()
        })
        .join('')
      return w
    })
    .join(' ')
}

export const decodeForsenCode = (code: string) => {
  return code.split(' ')
    .map(w => {
      const asciiBits = [...w]
        .map((c, i) => {
          return (c === c.toUpperCase()) ? '1' : '0'
        })
        .join('')

      let ascii = parseInt(asciiBits, 2)
      ascii += (encodeLength + 1)

      if (ascii === asciiLength) {
        return '?'
      }

      if (ascii === (encodeLength + 1)) {
        return ' '
      }

      const c = String.fromCharCode(ascii)
      return c
    })
    .join('')
}
