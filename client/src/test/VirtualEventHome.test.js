import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import VirtualEventHome from '../components/VirtualEventHome';

const handlers = [
    rest.post('http://localhost:5000/events/create', (req, res, ctx) => {
        // These asserts only apply to the one test we have now that hits the endpoint..
        // Can be put into that test specifically if/when we are expecting different input
        expect(req.body.title).toEqual('Hype train')
        expect(req.body.description).toEqual('Be there or be square')
        expect(req.body.link).toEqual('www.zoom.com')
        expect(req.body.years).toEqual([2000]);
        return res(
            ctx.status(200),
            ctx.json({})
        )
    })
]

const server = setupServer(...handlers);

// Establish API mocking before all tests.
beforeAll(() => server.listen())
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())
// Clean up after the tests are finished.
afterAll(() => server.close())

test('Form fields can be filled out and submitted', async() => {
    render(<VirtualEventHome />)
    fireEvent.change(screen.getByPlaceholderText('Event Name'),
                     { target: { value: 'Hype train'}}
    );
    fireEvent.change(screen.getByPlaceholderText('Description'),
                     { target: { value: 'Be there or be square'}}
    );
    fireEvent.change(screen.getByPlaceholderText('Link for the event'),
                     { target: { value: 'www.zoom.com'}}
    );
    fireEvent.click(screen.getByText('Grad years'));
    fireEvent.click(screen.getByText('2000'));

    fireEvent.click(screen.getByRole('button'));
    await screen.findByText('Thanks!')


})

