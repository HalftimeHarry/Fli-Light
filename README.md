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

Assign groups to holes.
Assign scorers to enter scores.
Create a user-friendly interface for scorers to enter scores, including multi-step forms.
Calculate team scores.
Provide a verification mechanism for entered scores.
Here's a high-level overview of how you can approach this:

Assigning Groups to Holes:

You can continue using the approach mentioned earlier, where you retrieve the hole count and create groups for each hole.
Assigning Scorers:I assume we need to insert a row for the count returned and for example a proup is assigned Hole 1 {and we are not referencing this to the hole in the database I assume it's not important but I may be wrong we may want to reference the hole in the database?}

In your user management system, you can assign the role "Scorer" to users who should have access to enter scores.
We can hardcode this to start I feel I may simply reassign the email for future tournaments and at the very least we can always make this more dynaminc as the app grows?
User-Friendly Score Entry:

Create a user interface for scorers to enter scores. You can use a multi-step form or a single form, depending on your preference and requirements.
Use a frontend framework like Svelte or any other of your choice to build the interface.
The form should allow scorers to select the group, hole, and enter scores for players. You can use form validation to ensure data integrity.
Calculating Team Scores:

After scorers submit scores, you can calculate team scores based on the individual player scores and the group they are assigned to.
Store the calculated team scores in your database.
Verification Mechanism:

Implement a verification mechanism to ensure the accuracy of entered scores.
You can add a verification step in the user interface where users with appropriate permissions can review and confirm the entered scores.
This verification step can be a separate page or section where scorers or other authorized users can review and make corrections if necessary.
Once all the scores are verified, you can mark the scores as final.