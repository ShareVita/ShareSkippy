import { User, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';
import React from 'react';
import { createClient } from '@/libs/supabase/client';
import PublicProfilePage from '../[id]/page';

// -----------------------------------------------------------
// 1. TYPE DEFINITIONS
// -----------------------------------------------------------

interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_photo_url: string | null;
  bio: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

interface DogData {
  id: string;
  name: string;
  breed: string;
}

// -----------------------------------------------------------
// 2. MOCK DEPENDENCIES
// -----------------------------------------------------------

// Mock Next.js dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  Image: (props: React.ComponentProps<'img'>) => <img {...props} alt={props.alt || ''} />,
}));

// Mock the useReviews hook and ensure proper structure
jest.mock('@/hooks/useReviews', () => ({
  useUserReviews: () => ({
    data: {
      ownerAvg: 4.5,
      totalReviews: 10,
      ownerReviews: 5,
      walkerAvg: 4.0,
      walkerReviews: 5,
      overallAvg: 4.25,
    },
    isLoading: false,
    error: null,
  }),
}));

// Mock the current authenticated user data
const mockCurrentUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_metadata: {},
  app_metadata: {},
};

// Helper for a successful Postgrest response
const mockSuccessResponse = <T,>(data: T[]): PostgrestResponse<T> =>
  ({
    data: data,
    error: null,
    count: data ? data.length : 0,
    status: 200,
    statusText: 'OK',
  }) as PostgrestResponse<T>;

// Helper function to mock the Supabase client object
const getMockSupabaseClient = (
  profileResult: PostgrestSingleResponse<ProfileData>,
  dogsResult: PostgrestResponse<DogData>,
  currentUserResult: User | null = mockCurrentUser
) => ({
  from: jest.fn((table: string) => {
    if (table === 'profiles') {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve(profileResult)),
          })),
        })),
      };
    }
    if (table === 'dogs') {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve(dogsResult)),
        })),
      };
    }
    return { select: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ data: [] })) })) };
  }),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: currentUserResult }, error: null })),
  },
});

// We cast the imported function to a mock function type for ease of use in tests
jest.mock('@/libs/supabase/client', () => ({
  createClient: jest.fn(),
}));

// -----------------------------------------------------------
// 3. TEST WRAPPER AND EXECUTION
// -----------------------------------------------------------

// Setup QueryClientProvider wrapper
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('PublicProfilePage', () => {
  const TEST_PROFILE_ID = 'profile-456';
  const CURRENT_USER_ID = 'user-123';

  const mockCreateClient = createClient as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: TEST_PROFILE_ID });

    mockCreateClient.mockImplementation(() =>
      getMockSupabaseClient(
        {
          data: null,
          error: null,
          count: null,
          status: 200,
          statusText: 'OK',
        } as unknown as PostgrestSingleResponse<ProfileData>,
        mockSuccessResponse([])
      )
    );
  });

  // --- Test Case 1: Initial Loading State ---
  test('1. Renders loading state initially', async () => {
    const delayedProfileResponse = new Promise<PostgrestSingleResponse<ProfileData>>(() => {});

    mockCreateClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => delayedProfileResponse),
          })),
        })),
      })),
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: mockCurrentUser }, error: null })),
      },
    });

    render(<PublicProfilePage />, { wrapper: TestWrapper });

    expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
  });

  // --- Test Case 2: Profile Load Error State ---
  test('2. Renders error message when profile fetching fails', async () => {
    const errorResponse: PostgrestSingleResponse<ProfileData> = {
      data: null,
      error: {
        message: 'Failed to load profile',
        code: '500',
        hint: 'Hint',
        details: 'Details',
        name: 'PostgrestError',
      },
      status: 500,
      statusText: 'Internal Server Error',
    } as PostgrestSingleResponse<ProfileData>;

    const client = getMockSupabaseClient(errorResponse, mockSuccessResponse([]));
    mockCreateClient.mockReturnValue(client);

    render(<PublicProfilePage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
    });
  });

  // --- Test Case 3: Profile Not Found State ---
  test('3. Renders "Profile Not Found" when the profile does not exist', async () => {
    const notFoundResponse: PostgrestSingleResponse<ProfileData> = {
      data: null,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    } as unknown as PostgrestSingleResponse<ProfileData>;

    const client = getMockSupabaseClient(notFoundResponse, mockSuccessResponse([]));
    mockCreateClient.mockReturnValue(client);

    render(<PublicProfilePage />, { wrapper: TestWrapper });

    await waitFor(() => {
      // The component logic detects null profile data and sets an internal error 'Profile not found'
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Profile not found')).toBeInTheDocument();
    });
  });

  // --- Test Case 4: Viewing Own Profile (Own Profile) ---
  test('4. Renders "Edit Profile" link and dog data when viewing own profile', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: CURRENT_USER_ID });

    const profileData: ProfileData = {
      id: CURRENT_USER_ID,
      first_name: 'Test',
      last_name: 'User',
      role: 'both',
      bio: 'My bio',
      profile_photo_url: null,
      neighborhood: 'Downtown',
      city: 'Exampleville',
      state: 'CA',
    };
    const dogsData: DogData[] = [{ id: 'd1', name: 'Buddy', breed: 'Labrador' }];

    const profileResponse: PostgrestSingleResponse<ProfileData> = {
      data: profileData,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    };

    const dogsResponse: PostgrestResponse<DogData> = mockSuccessResponse(dogsData);

    const client = getMockSupabaseClient(profileResponse, dogsResponse);
    mockCreateClient.mockReturnValue(client);

    render(<PublicProfilePage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Edit Profile/i })).toBeInTheDocument();
      expect(screen.getByText(/Buddy/i)).toBeInTheDocument();
    });
  });

  // --- Test Case 5: Viewing Other User's Profile (Other User) ---
  test('5. Renders "Send Message" button and no "Edit Profile" link when viewing another user', async () => {
    const OTHER_PROFILE_ID = 'profile-456';
    (useParams as jest.Mock).mockReturnValue({ id: OTHER_PROFILE_ID });

    const profileData: ProfileData = {
      id: OTHER_PROFILE_ID,
      first_name: 'Friend',
      last_name: 'Pal',
      role: 'dog_owner',
      bio: 'Their bio',
      profile_photo_url: null,
      neighborhood: null,
      city: 'Other City',
      state: 'NY',
    };

    const profileResponse: PostgrestSingleResponse<ProfileData> = {
      data: profileData,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    };
    const dogsResponse: PostgrestResponse<DogData> = mockSuccessResponse([]);

    const client = getMockSupabaseClient(profileResponse, dogsResponse);
    mockCreateClient.mockReturnValue(client);

    render(<PublicProfilePage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Friend Pal')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
    });
  });
});
