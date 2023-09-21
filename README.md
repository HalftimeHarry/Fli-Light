# Fli-Light
I am a scalled down version of Fli Golf

Database Design:

Pros Table:

pro_id, name, gender, image, team_id (foreign key), earnings, points
Sponsors Table:

sponsor_id, name, image
Teams Table:

team_id, name, image, sponsor_id (foreign key), earnings, points
Venues Table:

venue_id, name, location, image
Tournaments Table:

tournament_id, name, date, venue_id (foreign key), winner_pro_id (foreign key), winner_team_id (foreign key)
Leaderboards (Live Tournaments):

leaderboard_id, tournament_id (foreign key), pro_id (foreign key), team_id (foreign key), score, position
Note: The earnings and points fields in both the Pros and Teams tables will be used to track cumulative earnings and points.

Real-time Updates:

Supabase supports real-time functionality. You can utilize this feature to make sure that when the leaderboard data changes (scores, positions), it updates instantly for the users viewing the app.
API Endpoints:

You'll be able to use Supabase's auto-generated API for common CRUD operations. For custom logic, you may want to utilize serverless functions.
Implementation:

Utilize Supabase's client libraries to interact with the backend.
Use PostgreSQL's rich querying capability for things like:
Retrieving the top teams or pros based on earnings or points.
Aggregating scores for real-time leaderboards during a tournament.
Store images using Supabase Storage and reference the URLs in your tables.
Utilize Supabase's Auth module to ensure your backend operations are secure.
Relationships:

A pro belongs to one team, and a team may have multiple pros.
A team can have one sponsor, but a sponsor might sponsor multiple teams.
A tournament is played at one venue and has leaderboards associated with it.
Displaying Information:

Live Tournament Leaderboard: Use the Leaderboards table and the associated tournament_id to show live scores and positions during an ongoing tournament.
Team and Pro Earnings Leaderboard: Query the Teams and Pros tables respectively, ordering by the earnings field to showcase which teams and pros are earning the most throughout the league.
Remember to constantly test your implementation to ensure data integrity, especially when dealing with leaderboards and earnings calculations. Given that this is a nationwide league with potentially a lot of fans and players watching, ensuring accuracy and timely updates will be key to its success.
