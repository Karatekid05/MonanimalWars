// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MonanimalWars {
    // Constants
    uint256 public constant INITIAL_TEAM_HP = 10000;
    uint256 public constant DAMAGE_PER_ATTACK = 1;

    // Structs
    struct Player {
        string username;
        uint256 teamId;
        uint256 totalDamageDealt;
        Attack[] lastAttacks;
    }

    struct Team {
        string name;
        uint256 currentHP;
        uint256 totalDamageReceived;
        bool isActive;
        address lastAttacker;
        uint256 memberCount;
    }

    struct Attack {
        uint256 timestamp;
        uint256 targetTeamId;
    }

    // State variables
    mapping(address => Player) public players;
    mapping(uint256 => Team) public teams;
    uint256 public totalTeams;

    // Events
    event PlayerRegistered(address player, string username);
    event TeamJoined(address player, uint256 teamId);
    event TeamAttacked(address attacker, uint256 targetTeamId, uint256 newHP);
    event TeamDefeated(uint256 teamId);

    constructor() {
        // Initialize teams
        _createTeam("Moyaki");
        _createTeam("Molandak");
        _createTeam("Chog");
        _createTeam("Salmonad");
        _createTeam("Mouch");
        _createTeam("Mopo");
    }

    function _createTeam(string memory name) private {
        totalTeams++;
        teams[totalTeams] = Team({
            name: name,
            currentHP: INITIAL_TEAM_HP,
            totalDamageReceived: 0,
            isActive: true,
            lastAttacker: address(0),
            memberCount: 0
        });
    }

    function registerPlayer(string memory username) external {
        require(bytes(players[msg.sender].username).length == 0, "Player already registered");
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 32, "Username too long");
        players[msg.sender].username = username;
        emit PlayerRegistered(msg.sender, username);
    }

    function joinTeam(uint256 teamId) external {
        require(teamId > 0 && teamId <= totalTeams, "Invalid team ID");
        require(teams[teamId].isActive, "Team is defeated");

        // Remove player from current team if they're switching
        if (players[msg.sender].teamId != 0) {
            teams[players[msg.sender].teamId].memberCount--;
        }

        players[msg.sender].teamId = teamId;
        teams[teamId].memberCount++;
        emit TeamJoined(msg.sender, teamId);
    }

    function attack(uint256 targetTeamId) external {
        require(bytes(players[msg.sender].username).length > 0, "Player not registered");
        require(players[msg.sender].teamId != 0, "Must join a team first");
        require(players[msg.sender].teamId != targetTeamId, "Cannot attack own team");
        require(teams[targetTeamId].isActive, "Target team is already defeated");

        teams[targetTeamId].currentHP -= DAMAGE_PER_ATTACK;
        teams[targetTeamId].totalDamageReceived += DAMAGE_PER_ATTACK;
        teams[targetTeamId].lastAttacker = msg.sender;
        players[msg.sender].totalDamageDealt += DAMAGE_PER_ATTACK;

        // Record attack in player's history
        if (players[msg.sender].lastAttacks.length >= 5) {
            // Remove oldest attack
            for (uint256 i = 0; i < 4; i++) {
                players[msg.sender].lastAttacks[i] = players[msg.sender].lastAttacks[i + 1];
            }
            players[msg.sender].lastAttacks.pop();
        }
        players[msg.sender].lastAttacks.push(Attack(block.timestamp, targetTeamId));

        if (teams[targetTeamId].currentHP == 0) {
            teams[targetTeamId].isActive = false;
            emit TeamDefeated(targetTeamId);
        }

        emit TeamAttacked(msg.sender, targetTeamId, teams[targetTeamId].currentHP);
    }

    // View functions
    function getTeamStats(uint256 teamId)
        external
        view
        returns (
            string memory name,
            uint256 currentHP,
            uint256 totalDamageReceived,
            bool isActive,
            address lastAttacker,
            uint256 memberCount
        )
    {
        Team storage team = teams[teamId];
        return (team.name, team.currentHP, team.totalDamageReceived, team.isActive, team.lastAttacker, team.memberCount);
    }

    function getPlayerStats(address playerAddress)
        external
        view
        returns (string memory username, uint256 teamId, uint256 totalDamageDealt, Attack[] memory lastAttacks)
    {
        Player storage player = players[playerAddress];
        return (player.username, player.teamId, player.totalDamageDealt, player.lastAttacks);
    }
}
