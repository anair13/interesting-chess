# Database Setup Instructions

## 1. Set up your environment files

### For the React app (client/.env.local):
Create `client/.env.local` with React-specific variables:

```bash
REACT_APP_SUPABASE_URL=https://jmxkyjsfpuvdxolfoqkf.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGt5anNmcHV2ZHhvbGZvcWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MTc3MDMsImV4cCI6MjA3NDA5MzcwM30.KwqUO_4n15w-kgcm5PSl27fPYj8kc5-MzQgCigIBvj4
```

### For the API routes (.env.local):
Create `.env.local` in the root directory for API routes:

```bash
SUPABASE_URL=https://jmxkyjsfpuvdxolfoqkf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGt5anNmcHV2ZHhvbGZvcWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxNzcwMywiZXhwIjoyMDc0MDkzNzAzfQ.JsVxALk4xXTNXtl9I6yKgg9_p3Ufg02NEZFqrDA3Ouw
```

## 2. Set up the database schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `jmxkyjsfpuvdxolfoqkf`
3. Go to the SQL Editor
4. Copy and paste the contents of `database/schema.sql`
5. Run the SQL script

## 3. Enable Real-time

1. In your Supabase dashboard, go to Database > Replication
2. Make sure the following tables are enabled for real-time:
   - `games`
   - `players` 
   - `moves`

## 4. Test the setup

1. Create the `.env.local` file as described above
2. Run `npm run dev` from the client directory
3. Try creating a new game
4. Open the game link in another browser/tab to test multiplayer

## 5. Deploy to Vercel

1. Add all the environment variables to your Vercel project settings
2. Deploy the updated code
3. Test the production deployment

The new architecture uses:
- ✅ Supabase for persistent database storage
- ✅ Real-time subscriptions for live updates
- ✅ Vercel API routes for serverless functions
- ✅ No more Socket.IO or in-memory state issues!
