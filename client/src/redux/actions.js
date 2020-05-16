export const testAction = () => dispatch => {
    dispatch({
        type: 'TEST_ACTION',
        payload: 'test_payload'
    })
}