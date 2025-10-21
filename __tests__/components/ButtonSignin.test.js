/**
 * Example test file for ButtonSignin component
 *
 * This shows beginners how to write basic React component tests.
 * Tests check that components render correctly and respond to user interactions.
 */

import { render, screen } from '@testing-library/react';
import ButtonSignin from '@/components/ButtonSignin';

// Mock the Supabase client since ButtonSignin uses it
jest.mock('@/libs/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithOAuth: jest.fn(),
    },
  })),
}));

describe('ButtonSignin Component', () => {
  it('renders without crashing', () => {
    // This is the most basic test - just checking the component can render
    render(<ButtonSignin />);

    // You could add more specific checks here
    // For example: expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Add more tests here as needed:
  // - Test that clicking the button triggers the correct action
  // - Test that the component shows the correct text
  // - Test that it handles loading states properly
  // etc.
});
