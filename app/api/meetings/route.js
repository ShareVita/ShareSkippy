import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';

export async function GET(request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch meetings where the user is either requester or recipient
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select(`
        *,
        requester:profiles!meetings_requester_id_fkey (
          id,
          first_name,
          last_name,
          profile_photo_url
        ),
        recipient:profiles!meetings_recipient_id_fkey (
          id,
          first_name,
          last_name,
          profile_photo_url
        ),
        availability:availability!meetings_availability_id_fkey (
          id,
          title,
          post_type
        )
      `)
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('start_datetime', { ascending: true });

    if (error) throw error;

    // Check which meetings the user has already reviewed
    const meetingIds = meetings.map(m => m.id);
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('meeting_id')
      .eq('reviewer_id', user.id)
      .in('meeting_id', meetingIds);

    if (reviewsError) throw reviewsError;

    const reviewedMeetingIds = new Set(reviews.map(r => r.meeting_id));

    // Add review status to each meeting
    const meetingsWithReviewStatus = meetings.map(meeting => ({
      ...meeting,
      has_reviewed: reviewedMeetingIds.has(meeting.id)
    }));

    return NextResponse.json({ meetings: meetingsWithReviewStatus });

  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      recipient_id, 
      availability_id, 
      conversation_id,
      title, 
      description, 
      meeting_place, 
      start_datetime, 
      end_datetime 
    } = await request.json();

    // Validate required fields
    if (!recipient_id || !title || !meeting_place || !start_datetime || !end_datetime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(start_datetime);
    const endDate = new Date(end_datetime);
    
    if (startDate >= endDate) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }
    
    if (startDate < new Date()) {
      return NextResponse.json({ error: 'Meeting cannot be scheduled in the past' }, { status: 400 });
    }

    // Create meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        requester_id: user.id,
        recipient_id,
        availability_id,
        conversation_id,
        title,
        description,
        meeting_place,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        status: 'pending'
      })
      .select(`
        *,
        requester:profiles!meetings_requester_id_fkey (
          id,
          first_name,
          last_name,
          profile_photo_url
        ),
        recipient:profiles!meetings_recipient_id_fkey (
          id,
          first_name,
          last_name,
          profile_photo_url
        )
      `)
      .single();

    if (meetingError) throw meetingError;

    return NextResponse.json({ meeting });

  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
