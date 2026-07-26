import { render, screen } from '@testing-library/react';
import App from './App';

test('renders FreeMatch AI header', () => {
  render(<App />);
  const headerElements = screen.getAllByText(/FreeMatch AI/i);
  expect(headerElements.length).toBeGreaterThan(0);
});
