import React from 'react';

import { render, screen } from '@testing-library/react'
import Navbar from '../components/Navbar';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';


const defaultNavItems = [
    {
        id: 'home',
        name: 'Home',
        navLink: '/',
        icon: 'home'
    },
    {
        id: 'profile',
        name: 'Profile',
        navLink: '/profile',
        icon: 'user'
    },
    {
        id: 'alumniDirectory',
        name: 'Alumni Directory',
        navLink: '/alumniDirectory',
        icon: 'address book'
    },
    {
        id: 'mentorship',
        name: 'Mentorship',
        navLink: '/mentorship',
        icon: 'handshake',
    }
  ]

  const userDetails = {
      '_id': 'real_id',
      'timezone': '-1200'
  }

test("Navbar renders all nav items", () => {
    render(<MemoryRouter initialEntries={['/']}>
                <Navbar navItems={ defaultNavItems }
                        role="ALUMNI"
                        userDetails={ userDetails }/>
           </MemoryRouter>);
    screen.getByText('Home');
    screen.getByText('Profile');
    screen.getByText('Alumni Directory');
    screen.getByText('Mentorship');
});

test("Home page is highlighted when routed to '/'", () => {
    render(<MemoryRouter initialEntries={['/']}>
                <Navbar navItems={ defaultNavItems }
                        role="ALUMNI"
                        userDetails={ userDetails }/>
           </MemoryRouter>);
    expect(screen.getByText('Home').closest('a')).toHaveClass('active');
    expect(screen.getByText('Profile').closest('a')).not.toHaveClass('active');
});

test('Profile is highlighted when routed to "/profile"', () => {
    render(<MemoryRouter initialEntries={['/profile']}>
                <Navbar navItems={ defaultNavItems }
                        role="ALUMNI"
                        userDetails={ userDetails }/>
           </MemoryRouter>);
    expect(screen.getByText('Profile').closest('a')).toHaveClass('active');
    expect(screen.getByText('Home').closest('a')).not.toHaveClass('active');
});

test('Bubble Icon renders when notifications for a tab are non-zero', () => {
    const navItems = [{
        id: 'home',
        name: 'Home',
        navLink: '/',
        icon: 'home',
        notificationBubbleCounter: 2
    }]
    render(<MemoryRouter initialEntries={['/profile']}>
                <Navbar navItems={ navItems }
                        role="ALUMNI"
                        userDetails={ userDetails }/>
           </MemoryRouter>);
    screen.getByText('2');
})

test('Bubble Icon doesnt renders when notifications for a tab are zero', () => {
    const navItems = [{
        id: 'home',
        name: 'Home',
        navLink: '/',
        icon: 'home',
        notificationBubbleCounter: 0
    }]
    render(<MemoryRouter initialEntries={['/profile']}>
                <Navbar navItems={ navItems }
                        role="ALUMNI"
                        userDetails={ userDetails }/>
           </MemoryRouter>);
    expect(screen.queryByRole('0')).not.toBeInTheDocument()

});
