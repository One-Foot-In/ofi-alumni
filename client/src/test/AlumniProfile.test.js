import React from 'react';

import { render, screen } from '@testing-library/react'
import AlumniProfile from '../components/AlumniProfile';


test('Footy points appear in alum profile', () => {
    render(<AlumniProfile details={ {footyPoints: 10,
                                     interests: []} } />);
    expect(screen.getByText('10')).toBeTruthy();
});
