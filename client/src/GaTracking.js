import ReactGA from 'react-ga'

const GA_MEASURMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID

export const initGA = () => {           
    ReactGA.initialize(GA_MEASURMENT_ID); 
}

/**
 * Event - Add custom tracking event.
 * @param {string} category 
 * @param {string} action 
 * @param {string} label 
 */
export const Event = (category, action, label) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label
    });
};