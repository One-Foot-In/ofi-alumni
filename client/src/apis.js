require('dotenv').config();

export const makeCall = async (payload, api, method) => {
    const BACKEND = process.env.REACT_APP_BACKEND || "http://localhost:5000"
    method = method.toUpperCase()
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Cache-Control', 'no-cache');
    let requestHeader = {
        method: method,
        credentials: 'include',
        headers: headers
    }
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        requestHeader = Object.assign({}, requestHeader, {body: JSON.stringify(payload)})
    }
    const response = await fetch(`${BACKEND}${api}`, requestHeader)
    let resolvedRes = await response;
    if (resolvedRes.status === 200) {
        const resJson = await resolvedRes.json()
        return resJson;
    } else {
        const resJson = await resolvedRes.json()
        return({
            error: resJson.error || `Error completing ${api}`,
            status: resJson.status
        });
    }
}

export const makeCallWithImage = async (payload, api, method) => {
    const BACKEND = process.env.REACT_APP_BACKEND || "http://localhost:5000"
    method = method.toUpperCase()
    var headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Cache-Control', 'no-cache');
    let requestPayload = {
        method: method,
        credentials: 'include',
        headers: headers
    }
    let data = new FormData();
    for (let key of Object.keys(payload)) {
        data.append(key, payload[key]);
    }
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        requestPayload = Object.assign({}, requestPayload, {body: data})
    }
    const response = await fetch(`${BACKEND}${api}`, requestPayload)
    let resolvedRes = await response;
    if (resolvedRes.status === 200) {
        const resJson = await resolvedRes.json()
        return resJson;
    } else {
        const resJson = await resolvedRes.json()
        return({
            error: resJson.error || `Error completing ${api}`,
            status: resJson.status
        });
    }
}