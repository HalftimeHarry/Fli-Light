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
A team can have one sponsor, but in the future a sponsor might sponsor multiple teams.
A tournament is played at one venue and has leaderboards associated with it.
Displaying Information:

Live Tournament Leaderboard: Use the Leaderboards table and the associated tournament_id to show live scores and positions during an ongoing tournament.

Team and Pro Earnings Leaderboard: Query the Teams and Pros tables respectively, ordering by the earnings field to showcase which teams and pros are earning the most throughout the league.
Remember to constantly test your implementation to ensure data integrity, especially when dealing with leaderboards and earnings calculations. Given that this is a nationwide league with potentially a lot of fans and players watching, ensuring accuracy and timely updates will be key to its success.

Assign groups to holes.
Assign a scorer per group to enter scores.
I have Created a user-friendly interface for scorers to enter scores, including multi-step forms.

To Do:
Calculate team scores.
Provide a verification mechanism for entered scores.
Here's a high-level overview of how you can approach this:

Assigning Groups to Holes:

You can continue using the approach mentioned earlier, where you retrieve the hole count and create groups for each hole.
Assigning Scorers: I assume we need to insert a row for the count returned and for example a group is assigned Hole 1.

In your user management system, you can assign the role "Scorer" to users who should have access to enter scores.

This is hardcoded I feel I may simply reassign the email for future tournaments and at the very least we can always make this more dynaminc as the app grows?
User-Friendly Score Entry:

I have Created a user interface for scorers to enter scores. You can use a multi-step form or a single form, depending on your preference and requirements.

I used Svelte to build the interface.
The form should allow scorers enter scores for players. You can use form validation to ensure data integrity.

To Do:
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

## Fantasy Teams

fantasy_teams_json

{
"league_participant_1": {
"owner_id": "6b216fc6-180b-43f3-8308-5f44f011ae8e",
"team_name": "Dustins Team"
},
"league_participant_2": {
"owner_id": "774cb858-9e5e-4c67-acd2-6b9c5ed1838a",
"team_name": "Bills Team"
},
"league_participant_3": {
"owner_id": "213ce4c8-388c-4e90-8c23-9b7fabc72226",
"team_name": "Jills Team"
},
"league_participant_4": {
"owner_id": "264349f8-f2a1-4ad4-9e08-2c3b0052cc04",
"team_name": "Larrys Team"
},
"league_participant_5": {
"owner_id": "3585404a-99da-4a55-93e4-0ab58192a8d3",
"team_name": "Harrys Team"
},
"league_participant_6": {
"owner_id": "cc283dff-b167-457f-a26b-8c3ecba985fe",
"team_name": "Gregs Team"
}
}

## Fantasay Draft Order

draft_order_json

{
"Bills Team": {
"owner_id": "774cb858-9e5e-4c67-acd2-6b9c5ed1838a",
"pro_male_5": {
"name": "Isaac Robinson",
"type": "male",
"pro_id": 2
},
"pro_male_8": {
"name": "Gannon Buhr",
"type": "male",
"pro_id": 8
},
"pro_female_1": {
"name": "Paige Pierce",
"type": "female",
"pro_id": 234
}
},
"Gregs Team": {
"owner_id": "cc283dff-b167-457f-a26b-8c3ecba985fe",
"pro_male_3": {
"name": "Chris Dickerson",
"type": "male",
"pro_id": 12
},
"pro_male_10": {
"name": "Bradley Williams",
"type": "male",
"pro_id": 10
},
"pro_female_1": {
"name": "Holyn Handley",
"type": "female",
"pro_id": 15
}
},
"Jills Team": {
"owner_id": "213ce4c8-388c-4e90-8c23-9b7fabc72226",
"pro_male_1": {
"name": "Eagle McMahon",
"type": "male",
"pro_id": 1
},
"pro_female_1": {
"name": "Kristin Tattar",
"type": "female",
"pro_id": 13
},
"pro_female_12": {
"name": "Jennifer Allen",
"type": "female",
"pro_id": 24
}
},
"Harrys Team": {
"owner_id": "3585404a-99da-4a55-93e4-0ab58192a8d3",
"pro_male_1": {
"name": "Calvin Heimburg",
"type": "male",
"pro_id": 3
},
"pro_male_11": {
"name": "Aaron Gossage",
"type": "male",
"pro_id": 11
},
"pro_female_1": {
"name": "Kat Mertsch",
"type": "female",
"pro_id": 22
},
"pro_female_2": {
"name": "Ohn Scoggins",
"type": "female",
"pro_id": 14
}
},
"Larrys Team": {
"owner_id": "264349f8-f2a1-4ad4-9e08-2c3b0052cc04",
"pro_male_1": {
"name": "Matthew Orum",
"type": "male",
"pro_id": 9
},
"pro_male_4": {
"name": "Simon Lizotte",
"type": "male",
"pro_id": 4
},
"pro_female_1": {
"name": "Hailey King",
"type": "female",
"pro_id": 16
},
"pro_female_9": {
"name": "Ella Hansen",
"type": "female",
"pro_id": 21
}
},
"Dustins Team": {
"owner_id": "6b216fc6-180b-43f3-8308-5f44f011ae8e",
"pro_male_1": {
"name": "Kyle Klein",
"type": "male",
"pro_id": 7
},
"pro_male_6": {
"name": "Ricky Wysocki",
"type": "male",
"pro_id": 6
},
"pro_female_1": {
"name": "Henna Blomroos",
"type": "female",
"pro_id": 18
},
"pro_female_7": {
"name": "Eveliina Salonen",
"type": "female",
"pro_id": 19
}
}
}

# Fantasy Results Sample

fantasy_scores_json
{
"Bills Team": {
"owner_id": "774cb858-9e5e-4c67-acd2-6b9c5ed1838a",
"pro_male_5": {
"name": "Isaac Robinson",
"type": "male",
"pro_id": 2
},
"pro_male_8": {
"name": "Gannon Buhr",
"type": "male",
"pro_id": 8
},
"pro_female_1": {
"name": "Paige Pierce",
"type": "female",
"pro_id": 234
}
},
"Gregs Team": {
"owner_id": "cc283dff-b167-457f-a26b-8c3ecba985fe",
"pro_male_3": {
"name": "Chris Dickerson",
"type": "male",
"pro_id": 12
},
"pro_male_10": {
"name": "Bradley Williams",
"type": "male",
"pro_id": 10
},
"pro_female_1": {
"name": "Holyn Handley",
"type": "female",
"pro_id": 15
}
},
"Jills Team": {
"owner_id": "213ce4c8-388c-4e90-8c23-9b7fabc72226",
"pro_male_1": {
"name": "Eagle McMahon",
"type": "male",
"pro_id": 1
},
"pro_female_1": {
"name": "Kristin Tattar",
"type": "female",
"pro_id": 13
},
"pro_female_12": {
"name": "Jennifer Allen",
"type": "female",
"pro_id": 24
}
},
"Harrys Team": {
"owner_id": "3585404a-99da-4a55-93e4-0ab58192a8d3",
"pro_male_1": {
"name": "Calvin Heimburg",
"type": "male",
"pro_id": 3
},
"pro_male_11": {
"name": "Aaron Gossage",
"type": "male",
"pro_id": 11
},
"pro_female_1": {
"name": "Kat Mertsch",
"type": "female",
"pro_id": 22
},
"pro_female_2": {
"name": "Ohn Scoggins",
"type": "female",
"pro_id": 14
}
},
"Larrys Team": {
"owner_id": "264349f8-f2a1-4ad4-9e08-2c3b0052cc04",
"pro_male_1": {
"name": "Matthew Orum",
"type": "male",
"pro_id": 9
},
"pro_male_4": {
"name": "Simon Lizotte",
"type": "male",
"pro_id": 4
},
"pro_female_1": {
"name": "Hailey King",
"type": "female",
"pro_id": 16
},
"pro_female_9": {
"name": "Ella Hansen",
"type": "female",
"pro_id": 21
}
},
"Dustins Team": {
"owner_id": "6b216fc6-180b-43f3-8308-5f44f011ae8e",
"pro_male_1": {
"name": "Kyle Klein",
"type": "male",
"pro_id": 7
},
"pro_male_6": {
"name": "Ricky Wysocki",
"type": "male",
"pro_id": 6
},
"pro_female_1": {
"name": "Henna Blomroos",
"type": "female",
"pro_id": 18
},
"pro_female_7": {
"name": "Eveliina Salonen",
"type": "female",
"pro_id": 19
}
}
}
