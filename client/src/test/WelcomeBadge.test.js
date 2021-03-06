import React from 'react';

import { render, screen } from '@testing-library/react'
import WelcomeBadge from '../components/WelcomeBadge';

test('Greeting works for non-ambassadors', () => {
    render(<WelcomeBadge role='ALUMNI'
                         name='Billybob'
                         country='Afghanistan'
                         footyPoints={10} />);
    screen.getByText('Welcome Billybob (Alumnus)');
});

test('Greeting works for ambassadors', () => {
    render(<WelcomeBadge role='COUNTRY_AMBASSADOR'
                         name='Jonnyboy'
                         country='Albania'
                         footyPoints={10} />);
    screen.getByText('Welcome Ambassador Jonnyboy');
});

