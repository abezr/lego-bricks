import React from 'react';
import { render, screen } from '@testing-library/react';
import WallVisualizer from "./WallVisualizer";

test('renders learn react link', () => {
  render(<WallVisualizer/>);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
