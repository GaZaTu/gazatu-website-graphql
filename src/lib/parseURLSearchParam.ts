const parseURLSearchParams = (queryString = '') => {
  const object = {} as { [key: string]: string | number | boolean | undefined }
  const query = new URLSearchParams(queryString)

  for (const [key, valueAsString] of query.entries()) {
    const value = (() => {
      if (valueAsString === 'true') {
        return true
      } else if (valueAsString === 'false') {
        return false
      } else if (!isNaN(Number(valueAsString))) {
        return Number(valueAsString)
      } else {
        return valueAsString
      }
    })()

    object[key] = value
  }

  return object
}

export default parseURLSearchParams
