import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';

// GET /api/account/deletion-request/debug - Debug deletion request issues
export async function GET() {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all deletion requests for this user
    const { data: allRequests, error: allError } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (allError) {
      return NextResponse.json({ 
        error: 'Failed to fetch deletion requests',
        details: allError 
      }, { status: 500 });
    }

    // Get pending requests specifically
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (pendingError) {
      return NextResponse.json({ 
        error: 'Failed to fetch pending requests',
        details: pendingError 
      }, { status: 500 });
    }

    // Check database constraints
    const { data: constraints } = await supabase
      .rpc('get_table_constraints', { table_name: 'account_deletion_requests' })
      .catch(() => ({ data: null, error: 'RPC not available' }));

    return NextResponse.json({
      user_id: user.id,
      all_requests: allRequests,
      pending_requests: pendingRequests,
      pending_count: pendingRequests?.length || 0,
      can_cancel: pendingRequests?.length > 0,
      constraints: constraints,
      debug_info: {
        timestamp: new Date().toISOString(),
        user_authenticated: true
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// POST /api/account/deletion-request/debug - Test cancellation with detailed logging
export async function POST() {
  const startTime = Date.now();
  
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[DEBUG] Starting cancellation test for user: ${user.id}`);

    // Step 1: Check current state
    const { data: beforeState, error: beforeError } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (beforeError) {
      return NextResponse.json({ 
        error: 'Failed to check before state',
        details: beforeError 
      }, { status: 500 });
    }

    console.log(`[DEBUG] Before state:`, beforeState);

    if (!beforeState || beforeState.length === 0) {
      return NextResponse.json({ 
        error: 'No pending deletion request found',
        before_state: beforeState
      }, { status: 404 });
    }

    // Step 2: Attempt the update
    const { data: updatedRequest, error: updateError } = await supabase
      .from('account_deletion_requests')
      .update({ 
        status: 'cancelled',
        processed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .select()
      .single();

    console.log(`[DEBUG] Update result:`, { updatedRequest, updateError });

    if (updateError) {
      return NextResponse.json({ 
        error: 'Update failed',
        details: {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        },
        before_state: beforeState
      }, { status: 500 });
    }

    // Step 3: Verify the change
    const { data: afterState } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Cancellation test completed',
      before_state: beforeState,
      updated_request: updatedRequest,
      after_state: afterState,
      duration: duration
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[DEBUG] Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error.message,
      stack: error.stack,
      duration: duration
    }, { status: 500 });
  }
}
