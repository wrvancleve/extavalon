const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const postgres = require('../models/database');


  
  
  

/* GET home page. */
router.get('/', authenticate, function(req, res) {
  const playerTeamStatsQuery = `
    select
      players.player_id,
      players.first_name,
      players.last_name,
      COUNT(*) filter (where extavalon.is_resistance_role(game_players.role) and games.winning_team = 'Resistance') as ResistanceWins,
      COUNT(*) filter (where extavalon.is_resistance_role(game_players.role) and games.winning_team != 'Resistance') as ResistanceLosses,
      COUNT(*) filter (where extavalon.is_spy_role(game_players.role) and games.winning_team = 'Spies') as SpyWins,
      COUNT(*) filter (where extavalon.is_spy_role(game_players.role) and games.winning_team != 'Spies') as SpyLosses,
      COUNT(*) filter (where game_players.role = 'Jester' and games.winning_team = 'Jester') as JesterWins,
      COUNT(*) filter (where game_players.role = 'Jester' and games.winning_team != 'Jester') as JesterLosses
    from extavalon.players players
      inner join extavalon.game_players game_players on (players.player_id = game_players.player_id)
      inner join extavalon.games games on (games.game_id = game_players.game_id)
    group by players.player_id
    order by players.player_id;
  `;
  postgres.query(playerTeamStatsQuery, (err, result) => {
    let playerTeamStats = null;
    if (err) {
        console.log(err.stack)
    } else {
      playerTeamStats = result.rows;
    }

    res.render('stats', {
      title: 'Stats',
      playerTeamStats: playerTeamStats
    });
  });
});

module.exports = router;
