// Save this as LEADERBOARD_DEBUG_CONSOLE.js in browser console
// This will help trace exactly where the sync is failing

(async function leaderboardDebug() {
  console.log('🔍 === LEADERBOARD DEBUG START ===');
  
  // Check auth
  console.log('📍 Checking authentication...');
  try {
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('No user logged in');
    console.log('✅ Auth OK:', user.id);
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
  } catch (e) {
    console.error('❌ Auth Failed:', e.message);
    return;
  }

  // Try to read leaderboard
  console.log('\n📍 Checking read access...');
  try {
    const { data, error } = await window.supabase
      .from('leaderboard_scores')
      .select('*')
      .limit(5);
    if (error) throw error;
    console.log('✅ Read OK. Sample records:', data);
  } catch (e) {
    console.error('❌ Read Failed:', e.message);
  }

  // Try to write test data
  console.log('\n📍 Testing write access...');
  const user = (await window.supabase.auth.getUser()).data.user;
  const testPayload = {
    user_id: user.id,
    username: 'test_sync_' + Date.now(),
    total_score: 111,
    ctf_solved_count: 7,
    phish_solved_count: 8,
    code_solved_count: 9,
    quiz_correct: 10
  };

  try {
    console.log('   Attempting UPSERT with payload:', testPayload);
    const { data, error } = await window.supabase
      .from('leaderboard_scores')
      .upsert(testPayload, { onConflict: 'user_id' });
    if (error) {
      throw new Error(`UPSERT failed: ${error.message}`);
    }
    console.log('✅ UPSERT succeeded:', data);
  } catch (e) {
    console.error('⚠️  UPSERT failed, trying UPDATE...');
    try {
      const { data, error } = await window.supabase
        .from('leaderboard_scores')
        .update(testPayload)
        .eq('user_id', user.id);
      if (error) throw error;
      console.log('✅ UPDATE succeeded:', data);
    } catch (e2) {
      console.error('⚠️  UPDATE failed, trying INSERT...');
      try {
        const { data, error } = await window.supabase
          .from('leaderboard_scores')
          .insert(testPayload);
        if (error) throw error;
        console.log('✅ INSERT succeeded:', data);
      } catch (e3) {
        console.error('❌ All write operations failed:');
        console.error('   UPSERT error:', e2.message);
        console.error('   INSERT error:', e3.message);
      }
    }
  }

  // Try to read your data back
  console.log('\n📍 Reading data back...');
  try {
    const { data, error } = await window.supabase
      .from('leaderboard_scores')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (error) throw error;
    console.log('✅ Your record in database:', data);
  } catch (e) {
    console.error('❌ Could not read your record:', e.message);
  }

  console.log('\n🔍 === DEBUG COMPLETE ===');
})();

// Instructions:
// 1. Go to Leaderboard page
// 2. Open DevTools (F12)
// 3. Go to Console tab
// 4. Paste the entire script above (all of it)
// 5. Press Enter
// 6. Wait for "DEBUG COMPLETE"
// 7. Screenshot the entire console output
// 8. Share the screenshot showing all ✅ or ❌ results
