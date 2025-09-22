// Simple test script to verify API routes work
// Run with: node test-api.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure you have created .env.local with your Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('games')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('💡 Make sure you have run the database schema from database/schema.sql');
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
    
  } catch (err) {
    console.error('❌ Database test failed:', err.message);
    return false;
  }
}

async function testGameCreation() {
  console.log('🎮 Testing game creation...');
  
  try {
    const { data: game, error } = await supabase
      .from('games')
      .insert({
        host_color: 'white',
        guest_color: 'black',
        current_turn: 'white',
        initial_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        description: 'Test game',
        game_state: 'waiting'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Game creation failed:', error.message);
      return null;
    }
    
    console.log('✅ Game created successfully:', game.id);
    return game;
    
  } catch (err) {
    console.error('❌ Game creation test failed:', err.message);
    return null;
  }
}

async function testPlayerJoin(gameId) {
  console.log('👤 Testing player join...');
  
  try {
    const { error } = await supabase
      .from('players')
      .insert({
        game_id: gameId,
        color: 'white',
        is_host: true,
        session_id: 'test-session-123'
      });

    if (error) {
      console.error('❌ Player join failed:', error.message);
      return false;
    }
    
    console.log('✅ Player joined successfully');
    return true;
    
  } catch (err) {
    console.error('❌ Player join test failed:', err.message);
    return false;
  }
}

async function cleanup(gameId) {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Delete players first (foreign key constraint)
    await supabase
      .from('players')
      .delete()
      .eq('game_id', gameId);
    
    // Delete game
    await supabase
      .from('games')
      .delete()
      .eq('id', gameId);
    
    console.log('✅ Cleanup completed');
    
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  // Test database connection
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Tests failed - database connection issue');
    return;
  }
  
  // Test game creation
  const game = await testGameCreation();
  if (!game) {
    console.log('\n❌ Tests failed - game creation issue');
    return;
  }
  
  // Test player join
  const joinOk = await testPlayerJoin(game.id);
  if (!joinOk) {
    console.log('\n❌ Tests failed - player join issue');
    await cleanup(game.id);
    return;
  }
  
  // Cleanup
  await cleanup(game.id);
  
  console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
  console.log('💡 Next steps:');
  console.log('   1. Run: npm run dev (from client directory)');
  console.log('   2. Test the app at http://localhost:3000');
  console.log('   3. Deploy to Vercel when ready');
}

runTests().catch(console.error);
