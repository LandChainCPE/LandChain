import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('App Component', () => {
    it('renders the app correctly', () => {
        render(<App />);
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    it('contains a button', () => {
        render(<App />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});