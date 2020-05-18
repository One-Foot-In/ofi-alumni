require('dotenv').config();

export const makeCall = async (payload, api, method) => {
    const BACKEND = process.env.REACT_APP_BACKEND = "http://localhost:5000"
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
        return({
            error: resolvedRes.error || `Error completing ${api}`,
            status: resolvedRes.status
        });
    }
}