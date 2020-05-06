export const makeCall = async (payload, api, method) => {
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
    const response = await fetch(api, requestHeader)
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