export const testAction = () => {
    return {
        type: 'TEST_ACTION',
        payload: 'test_payload'
    }
}

export const increment = (increase) => {
    return {
        type: 'INCREMENT_ACTION',
        payload: increase
    }
}