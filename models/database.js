const { Pool } = require('pg');

const postgresPool = new Pool({
    connectionString: process.env.POSTGRES_URL
});

function getPlayerId(firstName, lastName, callback) {
    const query = `select get_player_id('${firstName}', '${lastName}') as player_id;`;
    postgresPool.query(query, (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result.rows[0].player_id);
        }
    });
}

function getGameLog(playerId, callback) {
    const gameLogQuery = `select * from get_games(${playerId})`;
    postgresPool.query(gameLogQuery, (err, result) => {
      if (err) {
          callback(null);
      } else {
          callback(result.rows);
      }
    });
}

function performTableQuery(query, callback) {
    const queryConfig = {
        text: query,
        rowMode: 'array'
    }
    postgresPool.query(queryConfig, (err, result) => {
        if (err) {
            callback(null);
        } else {
            callback(result.rows);
        }
    });
}

function getTeamStats(callback) {
    const teamStatsQuery = `
        with team_wins as (
            select winning_team as team,
                count(*) as wins
            from games
            group by winning_team
        ),
        games as (
            select count(*) as total
            from games
        ),
        team_totals as (
            select team,
                wins,
                games.total - wins as losses
            from team_wins, games
        )
        select
            team,
            wins,
            losses,
            case when wins + losses = 0 then 0.00
            else round((100.0 * wins) / (wins + losses), 2) end as WinRate
        from team_totals
        where team != 'Jester';
    `;
    performTableQuery(teamStatsQuery, callback);
}

function getRoleStats(callback) {
    const roleStatsQuery = `
        with game_results as (
            select games.game_id, games.winning_team, max(game_missions.mission_id) as last_mission
            from games inner join game_missions on (games.game_id = game_missions.game_id)
            group by games.game_id
        ),
        role_stats as (
            select
                game_players.role,
                case 
                    when game_players.role = 'Jester' then
                        COUNT(*) filter (where game_players.role = 'Jester' and game_results.winning_team = 'Jester')
                    when game_players.role = 'Puck' then
                        COUNT(*) filter (where game_players.role = 'Puck' and game_results.winning_team = 'Resistance' and game_results.last_mission = 5)
                    when is_resistance_team(game_players.role) then 
                        COUNT(*) filter (where is_resistance_team(game_players.role) and game_results.winning_team = 'Resistance')
                    else
                        COUNT(*) filter (where is_spy_team(game_players.role) and game_results.winning_team = 'Spies')
                end as Wins,
                case
                    when game_players.role = 'Jester' then
                        COUNT(*) filter (where game_players.role = 'Jester' and game_results.winning_team != 'Jester')
                    when game_players.role = 'Puck' then
                        COUNT(*) filter (where game_players.role = 'Puck' and (game_results.winning_team != 'Resistance' or game_results.last_mission != 5))
                    when is_resistance_team(game_players.role) then 
                        COUNT(*) filter (where is_resistance_team(game_players.role) and game_results.winning_team != 'Resistance')
                    else
                        COUNT(*) filter (where is_spy_team(game_players.role) and game_results.winning_team != 'Spies')
                end as Losses
            from game_players inner join game_results on (game_results.game_id = game_players.game_id)
            group by game_players.role
        )
        select *,
            case when Wins + Losses = 0 then 0.00
            else round((100.0 * Wins) / (Wins + Losses), 2) end as WinRate
        from role_stats
    `;
    performTableQuery(roleStatsQuery, callback);
}

function getRoleAssassinationStats(callback) {
    const roleAssassinationsStatsQuery = `
        with role_assassinations as (
            select assassinations.target_role,
                COUNT(*) filter (where assassinations.successful = true) as success,
                COUNT(*) filter (where assassinations.successful = false) as fail
            from (
                    select game_assassinations.target_one_role as target_role, successful
                    from game_assassinations
                    union all
                    select game_assassinations.target_two_role as target_role, successful
                    from game_assassinations
                ) assassinations
            where assassinations.target_role is not null
            group by assassinations.target_role
            order by assassinations.target_role
        )
        select *,
            case when success + fail = 0 then 0.00
            else round((100.0 * success) / (success + fail), 2) end as SuccessfulRate
        from role_assassinations;
    `;
    performTableQuery(roleAssassinationsStatsQuery, callback);
}

function getTeamPlayerStats(team, callback) {
    let teamPlayerStatsQuery = "";
    if (team === "Spies") {
        teamPlayerStatsQuery = `
            with game_results as (
                select games.game_id, games.winning_team, max(game_missions.mission_id) as last_mission
                from games inner join game_missions on (games.game_id = game_missions.game_id)
                group by games.game_id
            ), player_game_results as (
                select *
                from game_results inner join game_players on (game_results.game_id = game_players.game_id)
            ), player_spy_results as (
                select players.first_name, players.last_name,
                    COUNT(*) filter (where player_game_results.winning_team = 'Spies') as Wins,
                    COUNT(*) filter (where player_game_results.winning_team != 'Spies') as Losses
                from player_game_results
                    inner join players on (players.player_id = player_game_results.player_id)
                where is_spy_team(player_game_results.role)
                group by players.first_name, players.last_name
            )
            select first_name || ' ' || last_name as name,
                Wins, Losses,
                case when Wins + Losses = 0 then 0.00
                else round((100.0 * Wins) / (Wins + Losses), 2) end as WinRate
            from player_spy_results;
        `;
    } else {
        teamPlayerStatsQuery = `
            with game_results as (
                select games.game_id, games.winning_team, max(game_missions.mission_id) as last_mission
                from games inner join game_missions on (games.game_id = game_missions.game_id)
                group by games.game_id
            ), player_game_results as (
                select *
                from game_results inner join game_players on (game_results.game_id = game_players.game_id)
            ), player_resistance_results as (
                select players.first_name, players.last_name,
                    COUNT(*) filter (where player_game_results.winning_team = 'Resistance') as Wins,
                    COUNT(*) filter (where player_game_results.winning_team != 'Resistance') as Losses
                from player_game_results
                    inner join players on (players.player_id = player_game_results.player_id)
                where is_resistance_team(player_game_results.role)
                group by players.first_name, players.last_name
            )
            select first_name || ' ' || last_name as name,
                Wins, Losses,
                case when Wins + Losses = 0 then 0.00
                else round((100.0 * Wins) / (Wins + Losses), 2) end as WinRate
            from player_resistance_results;
        `;
    }
    performTableQuery(teamPlayerStatsQuery, callback);
}

function getRolePlayerStats(role, callback) {
    const rolePlayerStatsQuery = `
        with game_results as (
            select games.game_id, games.winning_team, max(game_missions.mission_id) as last_mission
            from games inner join game_missions on (games.game_id = game_missions.game_id)
            group by games.game_id
        ), player_game_results as (
            select *
            from game_results inner join game_players on (game_results.game_id = game_players.game_id)
        ), player_role_results as (
            select players.first_name, players.last_name,
                case 
                    when player_game_results.role = 'Jester' then
                        COUNT(*) filter (where player_game_results.winning_team = 'Jester')
                    when player_game_results.role = 'Puck' then
                        COUNT(*) filter (where player_game_results.winning_team = 'Resistance' and player_game_results.last_mission = 5)
                    when is_resistance_team(player_game_results.role) then 
                        COUNT(*) filter (where player_game_results.winning_team = 'Resistance')
                    else
                        COUNT(*) filter (where player_game_results.winning_team = 'Spies')
                end as Wins,
                case
                    when player_game_results.role = 'Jester' then
                        COUNT(*) filter (where player_game_results.winning_team != 'Jester')
                    when player_game_results.role = 'Puck' then
                        COUNT(*) filter (where player_game_results.winning_team != 'Resistance' or player_game_results.last_mission != 5)
                    when is_resistance_team(player_game_results.role) then 
                        COUNT(*) filter (where player_game_results.winning_team != 'Resistance')
                    else
                        COUNT(*) filter (where player_game_results.winning_team != 'Spies')
                end as Losses
            from player_game_results
                inner join players on (players.player_id = player_game_results.player_id)
            where player_game_results.role = '${role}'
            group by player_game_results.role, players.first_name, players.last_name
        )
        select first_name || ' ' || last_name as name,
            Wins, Losses,
            case when Wins + Losses = 0 then 0.00
            else round((100.0 * Wins) / (Wins + Losses), 2) end as WinRate
        from player_role_results;
    `;
    performTableQuery(rolePlayerStatsQuery, callback);
}

function getPlayerAssassinationStats(callback) {
    const playerAssassinationStatsQuery = `
        with player_assassinations as (
            select players.first_name, players.last_name,
                COUNT(*) filter (where game_assassinations.successful = true) as successes,
                COUNT(*) filter (where game_assassinations.successful = false) as fails
            from game_assassinations join players on (game_assassinations.assassin_player_id = players.player_id)
            group by players.first_name, players.last_name
        )
        select first_name || ' ' || last_name as name,
            successes, fails,
            case when successes + fails = 0 then 0.00
            else round((100.0 * successes) / (successes + fails), 2) end as SuccessRate
        from player_assassinations;
    `;
    performTableQuery(playerAssassinationStatsQuery, callback);
}

function getPlayerAssassinatedStats(callback) {
    const playerAssassinatedStatsQuery = `
        with player_assassinated as (
            select players.first_name,
                players.last_name,
                COUNT(*) filter (where assassinations.successful = true) as successful,
                COUNT(*) filter (where assassinations.successful = false) as unsuccessful
            from (
                    select target_one_player_id as target_player_id, successful
                    from game_assassinations
                    union all
                    select target_two_player_id as target_player_id, successful
                    from game_assassinations
                ) assassinations join players on (assassinations.target_player_id = players.player_id)
            where assassinations.target_player_id is not null
            group by players.first_name, players.last_name
        )
        select first_name || ' ' || last_name as name,
            successful, unsuccessful,
            case when successful + unsuccessful = 0 then 0.00
            else round((100.0 * successful) / (successful + unsuccessful), 2) end as SuccessRate
        from player_assassinated;
    `;
    performTableQuery(playerAssassinatedStatsQuery, callback);
}

async function createGame(gameStartTime, gameResult) {
    const createGameQuery = `
      select create_game('${gameStartTime.toISOString()}',
                         '${new Date(Date.now()).toISOString()}',
                         ${gameResult.missions[0] ? `'${gameResult.missions[0]}'` : 'null'},
                         ${gameResult.missions[1] ? `'${gameResult.missions[1]}'` : 'null'},
                         ${gameResult.missions[2] ? `'${gameResult.missions[2]}'` : 'null'},
                         ${gameResult.missions[3] ? `'${gameResult.missions[3]}'` : 'null'},
                         ${gameResult.missions[4] ? `'${gameResult.missions[4]}'` : 'null'},
                         '${gameResult.winner}') as game_id;
    `;
    const createGameQueryResult = await postgresPool.query(createGameQuery);
    return createGameQueryResult.rows[0].game_id;
}

async function insertSingleAssassination(gameId, assassinId, targetPlayerId, targetPlayerRole, successful) {
    const insertAssassinationQuery = `
        insert into game_assassinations(game_id, assassin_player_id, target_one_player_id, target_one_role, successful)
        values (${gameId}, ${assassinId}, ${targetPlayerId}, '${targetPlayerRole}', ${successful});
    `;
    await postgresPool.query(insertAssassinationQuery);
}

async function insertPairedAssassination(gameId, assassinId, targetOnePlayerId, targetOneRole, targetTwoPlayerId, targetTwoRole, successful) {
    const insertAssassinationQuery = `
        insert into game_assassinations(game_id, assassin_player_id, target_one_player_id, target_one_role, target_two_player_id, target_two_role, successful)
        values (${gameId}, ${assassinId}, ${targetOnePlayerId}, '${targetOneRole}', ${targetTwoPlayerId}, '${targetTwoRole}', ${successful});
    `;
    await postgresPool.query(insertAssassinationQuery);
}

async function insertGamePlayer(gameId, playerId, role) {
    const insertGamePlayerQuery = `
        insert into game_players(game_id, player_id, role)
            values(${gameId}, ${playerId}, '${role}');
    `;
    await postgresPool.query(insertGamePlayerQuery);
}

module.exports = {
    getPlayerId,
    getGameLog,
    getTeamStats,
    getRoleStats,
    getRoleAssassinationStats,
    getTeamPlayerStats,
    getRolePlayerStats,
    getPlayerAssassinationStats,
    getPlayerAssassinatedStats,
    createGame,
    insertSingleAssassination,
    insertPairedAssassination,
    insertGamePlayer
}