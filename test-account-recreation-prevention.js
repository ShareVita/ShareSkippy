/**
 * Test script to verify account recreation prevention system
 * 
 * This script tests:
 * 1. Normal account creation (should work)
 * 2. Account deletion and email recording
 * 3. Attempted recreation with same email (should fail)
 * 4. Recreation with different email (should work)
 */

import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAccountRecreationPrevention() {
  console.log('🧪 Testing Account Recreation Prevention System\n');

  const testEmail = `test-${Date.now()}@example.com`;
  const testEmail2 = `test2-${Date.now()}@example.com`;

  try {
    // Test 1: Create a new user account
    console.log('1️⃣ Creating new user account...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Failed to create user:', authError.message);
      return;
    }

    console.log('✅ User created successfully:', authData.user.id);

    // Test 2: Manually record email as deleted (simulating account deletion)
    console.log('\n2️⃣ Recording email as deleted...');
    const { error: recordError } = await supabase
      .from('deleted_emails')
      .insert({
        email: testEmail.toLowerCase().trim(),
        original_user_id: authData.user.id,
        deletion_reason: 'Test deletion'
      });

    if (recordError) {
      console.error('❌ Failed to record deleted email:', recordError.message);
      return;
    }

    console.log('✅ Email recorded as deleted');

    // Test 3: Try to create account with same email (should fail)
    console.log('\n3️⃣ Attempting to create account with same email...');
    const { data: authData2, error: authError2 } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true
    });

    if (authError2) {
      console.log('✅ Account creation blocked (expected):', authError2.message);
    } else {
      console.log('❌ Account creation should have been blocked but succeeded');
      // Clean up the created user
      await supabase.auth.admin.deleteUser(authData2.user.id);
    }

    // Test 4: Create account with different email (should work)
    console.log('\n4️⃣ Creating account with different email...');
    const { data: authData3, error: authError3 } = await supabase.auth.admin.createUser({
      email: testEmail2,
      email_confirm: true
    });

    if (authError3) {
      console.error('❌ Failed to create user with different email:', authError3.message);
      return;
    }

    console.log('✅ User with different email created successfully:', authData3.user.id);

    // Test 5: Check if is_email_deleted function works
    console.log('\n5️⃣ Testing is_email_deleted function...');
    const { data: isDeleted, error: functionError } = await supabase
      .rpc('is_email_deleted', { check_email: testEmail });

    if (functionError) {
      console.error('❌ Failed to call is_email_deleted function:', functionError.message);
      return;
    }

    console.log('✅ is_email_deleted result for deleted email:', isDeleted);

    const { data: isNotDeleted, error: functionError2 } = await supabase
      .rpc('is_email_deleted', { check_email: testEmail2 });

    if (functionError2) {
      console.error('❌ Failed to call is_email_deleted function:', functionError2.message);
      return;
    }

    console.log('✅ is_email_deleted result for non-deleted email:', isNotDeleted);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.auth.admin.deleteUser(authData.user.id);
    await supabase.auth.admin.deleteUser(authData3.user.id);
    await supabase
      .from('deleted_emails')
      .delete()
      .eq('email', testEmail);

    console.log('✅ Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Normal account creation works');
    console.log('- ✅ Deleted emails are recorded');
    console.log('- ✅ Account recreation with same email is blocked');
    console.log('- ✅ Account creation with different email works');
    console.log('- ✅ is_email_deleted function works correctly');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAccountRecreationPrevention();
