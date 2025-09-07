import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';

// POST /api/cron/process-deletions - Automated deletion processing (called by cron job)
export async function POST(request) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (!expectedToken) {
      console.error('CRON_SECRET_TOKEN not configured');
      return NextResponse.json({ error: 'Cron token not configured' }, { status: 500 });
    }
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Get deletion requests that are ready for processing (scheduled date has passed)
    const { data: readyDeletions, error: fetchError } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_deletion_date', new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!readyDeletions || readyDeletions.length === 0) {
      return NextResponse.json({ 
        message: 'No deletion requests ready for processing',
        processedCount: 0,
        timestamp: new Date().toISOString()
      });
    }

    const processedUsers = [];
    const errors = [];

    // Process each deletion request
    for (const deletionRequest of readyDeletions) {
      try {
        console.log(`Processing deletion request for user ${deletionRequest.user_id}`);
        
        // Update status to processing
        await supabase
          .from('account_deletion_requests')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', deletionRequest.id);

        // Get user's email before deletion for tracking
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', deletionRequest.user_id)
          .single();

        // Record the email as deleted to prevent recreation
        if (userProfile?.email) {
          await supabase
            .from('deleted_emails')
            .insert({
              email: userProfile.email.toLowerCase().trim(),
              original_user_id: deletionRequest.user_id,
              deletion_reason: deletionRequest.reason
            })
            .onConflict('email')
            .ignoreDuplicates(); // Don't error if email already exists
        }

        // Delete user profile and related data
        // Note: This will cascade delete due to ON DELETE CASCADE constraints
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', deletionRequest.user_id);

        if (profileError) {
          console.error(`Error deleting profile for user ${deletionRequest.user_id}:`, profileError);
          errors.push({
            userId: deletionRequest.user_id,
            error: profileError.message
          });
          continue;
        }

        // Delete the auth user (this requires admin privileges)
        const { error: authError } = await supabase.auth.admin.deleteUser(
          deletionRequest.user_id
        );

        if (authError) {
          console.error(`Error deleting auth user ${deletionRequest.user_id}:`, authError);
          errors.push({
            userId: deletionRequest.user_id,
            error: authError.message
          });
          continue;
        }

        // Mark deletion request as completed
        await supabase
          .from('account_deletion_requests')
          .update({ 
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', deletionRequest.id);

        processedUsers.push(deletionRequest.user_id);
        console.log(`Successfully processed deletion for user ${deletionRequest.user_id}`);

      } catch (error) {
        console.error(`Error processing deletion for user ${deletionRequest.user_id}:`, error);
        errors.push({
          userId: deletionRequest.user_id,
          error: error.message
        });
      }
    }

    const result = {
      message: `Processed ${processedUsers.length} deletion requests`,
      processedCount: processedUsers.length,
      processedUsers,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log('Deletion processing completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error processing deletions:', error);
    return NextResponse.json({ 
      error: 'Failed to process deletion requests',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET /api/cron/process-deletions - Check status (for monitoring)
export async function GET() {
  try {
    const supabase = createClient();
    
    // Get count of pending deletion requests
    const { count: pendingCount, error: pendingError } = await supabase
      .from('account_deletion_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) {
      throw pendingError;
    }

    // Get count of requests ready for processing
    const { count: readyCount, error: readyError } = await supabase
      .from('account_deletion_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('scheduled_deletion_date', new Date().toISOString());

    if (readyError) {
      throw readyError;
    }

    return NextResponse.json({
      status: 'healthy',
      pendingDeletions: pendingCount || 0,
      readyForProcessing: readyCount || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking deletion status:', error);
    return NextResponse.json({ 
      error: 'Failed to check deletion status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

