interface ResultMap {
  readAsText: string
  readAsArrayBuffer: ArrayBuffer
  readAsBinaryString: string
  readAsDataURL: string
}

interface ReadFileOpts<How extends keyof ResultMap> {
  how: How
  encoding?: string
}

function readFile<How extends keyof ResultMap = 'readAsText'>(file: File, { how, encoding }: ReadFileOpts<How> = { how: 'readAsText' as any }) {
  return new Promise<ResultMap[How]>((resolve, reject) => {
    const fr = new FileReader()

    fr.onload = () => resolve(fr.result as any)
    fr.onerror = err => reject(err)

    fr[how](file, encoding)
  })
}

export default readFile
