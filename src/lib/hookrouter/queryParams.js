import React from 'react';

const queryParamListeners = [];
let queryParamObject = {};

export const setQueryParams = (inObj, replace = false) => {
	if(!(inObj instanceof Object)){
		throw new Error('Object required');
	}
	if(replace){
		queryParamObject = inObj;
	} else {
		Object.assign(queryParamObject, inObj);
	}
  const now = Date.now();
	queryParamListeners.forEach(cb => cb(now));
	if (true) {
		const qs = '?' + objectToQueryString(queryParamObject);
    if (qs === window.location.search) {
			return;
		}
    window.history.replaceState(null, null, window.location.pathname + (qs !== '?' ? qs : ''));
	}
};

export const getQueryParams = () => Object.assign({}, queryParamObject);

/**
 * This takes an URL query string and converts it into a javascript object.
 * @param {string} inStr
 * @return {object}
 */
export const queryStringToObject = (inStr) => {
	const p = new URLSearchParams(inStr);
	let result = {};
	for (let param of p) {
		result[param[0]] = param[1];
	}
	return result;
};

/**
 * This takes a javascript object and turns it into a URL query string.
 * @param {object} inObj
 * @return {string}
 */
export const objectToQueryString = (inObj) => {
	const qs = new URLSearchParams();
	Object.entries(inObj).forEach(([key, value]) => value !== undefined ? qs.append(key, value) : null);
	return qs.toString();
};

if(true){
  queryParamObject = queryStringToObject(window.location.search.substr(1));
  for (const key of Object.keys(queryParamObject)) {
    if (queryParamObject[key] === 'null') {
      queryParamObject[key] = null
    } else if (queryParamObject[key] === 'undefined') {
      queryParamObject[key] = undefined
    } else if (queryParamObject[key] === 'true') {
      queryParamObject[key] = true
    } else if (queryParamObject[key] === 'false') {
      queryParamObject[key] = false
    } else if (!isNaN(Number(queryParamObject[key]))) {
      queryParamObject[key] = Number(queryParamObject[key])
    } else {
      queryParamObject[key] = decodeURIComponent(queryParamObject[key])
    }
  }
}

/**
 * This hook returns the currently set query parameters as object and offers a setter function
 * to set a new query string.
 *
 * All components that are hooked to the query parameters will get updated if they change.
 * Query params can also be updated along with the path, by calling `navigate(url, queryParams)`.
 *
 * @returns {array} [queryParamObject, setQueryParams]
 */
export const useQueryParams = () => {
  const setUpdate = React.useState(0)[1];

	React.useEffect(() => {
		queryParamListeners.push(setUpdate);

		return () => {
			const index = queryParamListeners.indexOf(setUpdate);
			if (index === -1) {
				return;
			}
			queryParamListeners.splice(index, 1);
		};
  }, [setUpdate]);

	return [queryParamObject, setQueryParams];
};
