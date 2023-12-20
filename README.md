# Fli-Light

I am a scalled down version of Fli Golf

Database Design:

## Pros Table:

pro_id, name, gender, image, team_id (foreign key), earnings, points

## Sponsors Table:

sponsor_id, name, image

## Teams Table:

team_id, name, image, sponsor_id (foreign key), earnings, points
Venues Table:

venue_id, name, location, image

## Tournaments Table:

tournament_id, name, date, venue_id (foreign key), winner_pro_id (foreign key), winner_team_id (foreign key)
Leaderboards (Live Tournaments):

## Leaderbord

leaderboard_id, tournament_id (foreign key), pro_id (foreign key), team_id (foreign key), score, position
Note: The earnings and points fields in both the Pros and Teams tables will be used to track cumulative earnings and points.

# How to Setup a Tournament using "Svelte UI" and "Supabase"

## Step 1: Manually Input Data

- Add a row in the "Tournaments" table.
- Add a row in the "Venues" table.

## Step 2: Import Holes Data using CSV

Utilize a CSV file to populate the holes. Below is the sample structure of the CSV file:

hole_id,hole_number,hole_name,par,distance,venue_id,hole_type
32,3,,3,386,4,
33,4,,4,708,4,
34,5,,3,325,4,

## Step 3: Import Pairings Data using CSV

Use a CSV file to input pairings data. For this example, we have used Chat GPT to randomly generate pairings. Here is a sample CSV:

pairings_id,tour_ref,team_a,team_b,pairing_name
7,3,11,2,
8,3,5,1,
9,3,3,10,
10,3,12,6,
11,3,8,7,
12,3,9,4,

## Step 4: Import Groups Data using CSV

Utilize a CSV file to input groups data. In this instance, Chat GPT was used to set group names based on the pairings. Below is a sample CSV:

## Real-time Updates and scoring system:

Supabase supports real-time functionality. You can utilize this feature to make sure that when the leaderboard data changes (scores, positions), it updates instantly for the users viewing the app.
API Endpoints:

You'll be able to use Supabase's auto-generated API for common CRUD operations. For custom logic, you may want to utilize serverless functions.
Implementation:

group_id,tee_time,group_pairing_ref,group_name
7,13:00:00,7,Group 1 Chain Breakers vs. Birdie Storm - Live Music Disc Golf Invitational (2025)
8,13:00:00,8,Group 2 Midas Touch vs. Ace Makers - Live Music Disc Golf Invitational (2025)
9,13:00:00,9,Group 3 Chain Seekers vs. Disc Dynasty - Live Music Disc Golf Invitational (2025)
10,13:00:00,10,Group 4 Hyzer Heros vs. Flight Squad - Live Music Disc Golf Invitational (2025)
11,13:00:00,11,Group 5 Glide Masters vs. Disc Jesters - Live Music Disc Golf Invitational (2025)
12,13:00:00,12,Group 6 Fairway Bombers vs. Huk-a-Mania - Live Music Disc Golf Invitational (2025)

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

## Real-time Set-up Scorers:

Very important to HARDCODE only the uuid in the EnterScoreForm.svelte simply do this 6 times run a differant uuid but it needs to be
assigned or referenced to the row in the scores table. This system if done correctly we shlould end up with a result and historical data with only 1 row per group on average 6 groups per round.

## Fantasay Notes

fantasy_scores_json
{
"fantasy_team_1": {
"score": 0,
"team_info": {
"owner_id": "uuid_1",
"team_name": "Sample Name 1"
},
"draft_rounds": [],
"fantasy_pros": {
"pro_male_1": 0,
"pro_male_2": 0,
"pro_male_4": 0,
"pro_male_12": 6,
"pro_female_1": 0,
"pro_female_2": 0
},
"reserve_pros": {
"reserve_pro_male": 0,
"reserve_pro_female": 0
}
},
"fantasy_team_2": {
"score": 0,
"team_info": {
"owner_id": "uuid_2",
"team_name": "Sample Name 2"
},
"draft_rounds": [],
"fantasy_pros": {
"pro_male_1": 0,
"pro_male_2": 0,
"pro_male_4": 0,
"pro_male_6": 0,
"pro_female_1": 0,
"pro_female_2": 0
},
"reserve_pros": {
"reserve_pro_male": 0,
"reserve_pro_female": 0
}
},
"fantasy_team_3": {
"score": 0,
"team_info": {
"owner_id": "uuid_3",
"team_name": "Sample Name 3"
},
"draft_rounds": [],
"fantasy_pros": {
"pro_male_1": 0,
"pro_male_2": 0,
"pro_male_7": 0,
"pro_female_1": 0,
"pro_female_2": 0
},
"reserve_pros": {
"reserve_pro_male": 0,
"reserve_pro_female": 0
}
},
"fantasy_team_4": {
"score": 0,
"team_info": {
"owner_id": "uuid_4",
"team_name": "Sample Name 4"
},
"draft_rounds": [],
"fantasy_pros": {
"pro_male_1": 0,
"pro_male_2": 0,
"pro_male_7": 0,
"pro_female_1": 0,
"pro_female_2": 0
},
"reserve_pros": {
"reserve_pro_male": 0,
"reserve_pro_female": 0
}
},
"fantasy_team_5": {
"score": 0,
"team_info": {
"owner_id": "uuid_5",
"team_name": "Sample Name 5"
},
"draft_rounds": [],
"fantasy_pros": {
"pro_male_1": 0,
"pro_male_2": 0,
"pro_female_1": 0,
"pro_female_2": 0
},
"reserve_pros": {
"reserve_pro_male": 0,
"reserve_pro_female": 0
}
},
"fantasy_team_6": {
"score": 0,
"team_info": {
"owner_id": "uuid_6",
"team_name": "Sample Name 6"
},
"draft_rounds": [],
"fantasy_pros": {
"pro_male_1": 0,
"pro_male_2": 0,
"pro_female_1": 0,
"pro_female_2": 0
},
"reserve_pros": {
"reserve_pro_male": 0,
"reserve_pro_female": 0
}
}
}

## Fantasy Teams

{
"league_participant_1": {
"owner_id": "774cb858-9e5e-4c67-acd2-6b9c5ed1838a",
"team_name": "Sample Name"
},
"league_participant_2": {
"owner_id": "6b216fc6-180b-43f3-8308-5f44f011ae8e",
"team_name": "New team"
},
"league_participant_3": {
"owner_id": "213ce4c8-388c-4e90-8c23-9b7fabc72226",
"team_name": "Jills team"
},
"league_participant_4": {
"owner_id": "264349f8-f2a1-4ad4-9e08-2c3b0052cc04",
"team_name": "Larrys team"
},
"league_participant_5": {
"owner_id": "3585404a-99da-4a55-93e4-0ab58192a8d3",
"team_name": "Harrys team"
},
"league_participant_6": {
"owner_id": "cc283dff-b167-457f-a26b-8c3ecba985fe",
"team_name": "greg team"
}
}

results_json

{
"round_results": {
"round_1": {
"fantasy_team_1": {
"rank": 1,
"score": 45
},
"fantasy_team_2": {
"rank": 2,
"score": 50
},
"fantasy_team_3": {
"rank": 3,
"score": 55
},
"fantasy_team_4": {
"rank": 4,
"score": 60
},
"fantasy_team_5": {
"rank": 5,
"score": 65
},
"fantasy_team_6": {
"rank": 6,
"score": 70
}
}
},
"final_standings": {
"fantasy_team_1": {
"total_score": 130,
"overall_rank": 1
},
"fantasy_team_2": {
"total_score": 135,
"overall_rank": 2
},
"fantasy_team_3": {
"total_score": 140,
"overall_rank": 3
},
"fantasy_team_4": {
"total_score": 145,
"overall_rank": 4
},
"fantasy_team_5": {
"total_score": 150,
"overall_rank": 5
},
"fantasy_team_6": {
"total_score": 155,
"overall_rank": 6
}
}
}

results_json

{
"round_results": {
"round_1": {
"fantasy_team_1": {
"rank": 1,
"score": 45
},
"fantasy_team_2": {
"rank": 2,
"score": 50
},
"fantasy_team_3": {
"rank": 3,
"score": 55
},
"fantasy_team_4": {
"rank": 4,
"score": 60
},
"fantasy_team_5": {
"rank": 5,
"score": 65
},
"fantasy_team_6": {
"rank": 6,
"score": 70
}
}
},
"final_standings": {
"fantasy_team_1": {
"total_score": 130,
"overall_rank": 1
},
"fantasy_team_2": {
"total_score": 135,
"overall_rank": 2
},
"fantasy_team_3": {
"total_score": 140,
"overall_rank": 3
},
"fantasy_team_4": {
"total_score": 145,
"overall_rank": 4
},
"fantasy_team_5": {
"total_score": 150,
"overall_rank": 5
},
"fantasy_team_6": {
"total_score": 155,
"overall_rank": 6
}
}
}

prizes_json

{
"gear_prizes": {
"first_place": {
"item": "Exclusive FLI GOLF Bag",
"value": 200
}
},
"special_prizes": {
"best_player": {
"item": "Personalized Trophy",
"value": 150
},
"hole_in_one": {
"item": "Player signed apparel",
"value": 100
}
},
"digital_gift_card": {
"first_place_casino_prize": 200
}
}

rules_json

{
"draft_rules": {
"rounds": 4,
"draft_type": "snake",
"team_selection": {
"last_two_rounds": "reserve players",
"first_two_rounds": "top teams"
}
},
"season_rules": {
"season_duration": "1 year",
"league_entry_fee": 300,
"number_of_tournaments": 6
},
"scoring_rules": {
"bogey_penalty": 2,
"under_par_bonus": -0.5,
"points_per_throw": 1,
"double_bogey_penalty": 4
},
"tournament_rules": {
"winner_criteria": "lowest_total_score",
"matchups_per_tournament": 3,
"replacement_player_policy": "regular_scoring_rules_apply"
},
"prize_distribution": {
"first_place_percentage": 100
}
}

teams_json

{
"fantasy_team_1": {
"roster": {
"top_teams": [
"Team A",
"Team B"
],
"reserve_teams": [
"Team C",
"Team D"
]
},
"owner_id": "owner_uuid_1",
"team_name": "Disc Dominators"
},
"fantasy_team_2": {
"roster": {
"top_teams": [
"Team E",
"Team F"
],
"reserve_teams": [
"Team G",
"Team H"
]
},
"owner_id": "owner_uuid_2",
"team_name": "Chain Chasers"
},
"fantasy_team_3": {
"roster": {
"top_teams": [
"Team I",
"Team J"
],
"reserve_teams": [
"Team K",
"Team L"
]
},
"owner_id": "owner_uuid_3",
"team_name": "Hyzer Heroes"
}
}
