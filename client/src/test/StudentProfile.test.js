import React from 'react';

import { render, screen } from '@testing-library/react'
import StudentProfile from '../components/StudentProfile';


test('Footy points appear in alum profile', () => {
    render(<StudentProfile details={ {footyPoints: 10,
                                     interests: []} } />);
    expect(screen.getByText('10')).toBeTruthy();
});
