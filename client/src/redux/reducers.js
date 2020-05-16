import { combineReducers } from 'redux';

const testReducer = (state = {}, action) => {
    switch (action.type) {
        case 'TEST_ACTION':
            return {
                test: action.payload
            }
        default:
            return state
    }
}
const incrementReducer = (state = {}, action) => {
    switch (action.type) {
        case 'INCREMENT_ACTION':
            return {
                count: (state.count ? state.count : 0) + action.payload
            }
            default:
                return state
        }
}

export default combineReducers({
    testState: testReducer,
    countState: incrementReducer
});