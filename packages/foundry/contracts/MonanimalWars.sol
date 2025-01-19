// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

// Add NFT contract interface
interface IMonavaraNFT {
    function mint(address player) external returns (uint256);
    function hasMinted(address player) external view returns (bool);
}

contract MonanimalWars is Ownable(msg.sender) {
    // Estrutura que define uma equipa
    struct Team {
        string name;
        uint8 id;
        uint16 hp;
        address[] players;
    }

    // Estrutura que define um jogador
    struct Player {
        string username;
        uint8 teamId; // ID da equipa (0 = sem equipa, 1-5 = índice do time + 1)
        bool isRegistered;
        uint256 totalDamageDealt; // Track total damage dealt by player
    }

    // Estrutura para o leaderboard
    struct LeaderboardEntry {
        address playerAddress;
        string username;
        uint256 damageDealt;
    }

    // Constantes
    uint16 public constant MAX_HP = 10000;
    uint16 public constant MIN_HEAL = 10;
    uint16 public constant MAX_HEAL = 100;
    uint16 public constant MIN_ATTACK = 50;
    uint16 public constant MAX_ATTACK = 200;

    // Mappings para armazenar dados
    mapping(address => Player) public players;
    mapping(string => bool) public usernameExists;
    mapping(string => uint8) private teamNameToId;
    mapping(uint8 => Team) public teams;

    // Array para o leaderboard
    LeaderboardEntry[] public leaderboard;

    // Eventos para logging
    event PlayerRegistered(address player, string username);
    event TeamAssigned(address player, string team);
    event TeamAttacked(
        string attackingTeam,
        string attackedTeam,
        uint16 damage,
        uint16 newHp
    );
    event TeamHealed(string team, uint16 healAmount, uint16 newHp);
    event TeamDefeated(string team);
    event PlayerReassigned(address player, string oldTeam, string newTeam);

    // Array com os nomes das equipas disponíveis
    string[] private teamNames = [
        "Moyaki",
        "Mopo",
        "Chog",
        "Salmonad",
        "Mouch"
    ];

    // Add NFT-related state variables
    address public monavaraNFT;
    mapping(address => uint256) public playerAttackCount;
    mapping(address => bool) public isEligibleForNFT;

    event EligibleForNFT(address player);
    event NFTMinted(address player, uint256 tokenId);

    constructor() {
        // Inicializa as equipas
        for (uint8 i = 0; i < teamNames.length; i++) {
            uint8 teamId = i + 1;
            teams[teamId].name = teamNames[i];
            teams[teamId].id = teamId;
            teams[teamId].hp = MAX_HP;
            teamNameToId[teamNames[i]] = teamId;
        }
    }

    // Function to generate random number with more entropy
    function _random(
        uint256 seed,
        uint16 min,
        uint16 max
    ) private view returns (uint16) {
        bytes32 randomHash = keccak256(
            abi.encodePacked(
                block.timestamp,
                block.difficulty,
                seed,
                block.number,
                msg.sender,
                address(this).balance,
                gasleft()
            )
        );

        return uint16(min + (uint256(randomHash) % (max - min + 1)));
    }

    // Função para registrar um novo jogador
    function registerPlayer(string calldata _username) external {
        require(!players[msg.sender].isRegistered, "Player already registered");
        require(!usernameExists[_username], "Username already taken");
        require(bytes(_username).length > 0, "Username cannot be empty");

        players[msg.sender].username = _username;
        players[msg.sender].isRegistered = true;
        players[msg.sender].teamId = 0;
        players[msg.sender].totalDamageDealt = 0;
        usernameExists[_username] = true;

        emit PlayerRegistered(msg.sender, _username);
    }

    // Função para associar uma equipa ao jogador
    function assignTeam(string calldata _team) external {
        require(players[msg.sender].isRegistered, "Player not registered");
        require(players[msg.sender].teamId == 0, "Team already assigned");

        uint8 teamId = teamNameToId[_team];
        require(teamId > 0, "Invalid team");

        players[msg.sender].teamId = teamId;
        teams[teamId].players.push(msg.sender);
        emit TeamAssigned(msg.sender, _team);
    }

    // Add function to set NFT contract address
    function setMonavaraNFT(address _monavaraNFT) external onlyOwner {
        monavaraNFT = _monavaraNFT;
    }

    // Add function to check eligibility
    function checkNFTEligibility(address player) private {
        if (
            !isEligibleForNFT[player] &&
            !IMonavaraNFT(monavaraNFT).hasMinted(player)
        ) {
            if (
                playerAttackCount[player] >= 10 ||
                players[player].totalDamageDealt >= 1000
            ) {
                isEligibleForNFT[player] = true;
                emit EligibleForNFT(player);
            }
        }
    }

    // Add minting function
    function mintMonavaraNFT() external {
        require(isEligibleForNFT[msg.sender], "Not eligible for NFT");
        require(monavaraNFT != address(0), "NFT contract not set");
        require(
            !IMonavaraNFT(monavaraNFT).hasMinted(msg.sender),
            "Already minted NFT"
        );

        uint256 tokenId = IMonavaraNFT(monavaraNFT).mint(msg.sender);
        emit NFTMinted(msg.sender, tokenId);
    }

    // Função para atacar uma equipa
    function attackTeam(string calldata _targetTeam) external {
        require(players[msg.sender].isRegistered, "Player not registered");
        require(players[msg.sender].teamId > 0, "Must be in a team to attack");

        uint8 targetTeamId = teamNameToId[_targetTeam];
        require(targetTeamId > 0, "Invalid target team");
        require(
            targetTeamId != players[msg.sender].teamId,
            "Cannot attack own team"
        );
        require(teams[targetTeamId].hp > 0, "Team already defeated");

        uint16 damage = _random(
            uint256(uint160(msg.sender)),
            MIN_ATTACK,
            MAX_ATTACK
        );
        uint16 newHp = teams[targetTeamId].hp > damage
            ? teams[targetTeamId].hp - damage
            : 0;
        teams[targetTeamId].hp = newHp;

        players[msg.sender].totalDamageDealt += damage;
        playerAttackCount[msg.sender]++;
        _updateLeaderboard(msg.sender);

        // Check NFT eligibility after attack
        if (monavaraNFT != address(0)) {
            checkNFTEligibility(msg.sender);
        }

        emit TeamAttacked(
            teams[players[msg.sender].teamId].name,
            _targetTeam,
            damage,
            newHp
        );

        // If team is defeated, reassign its players
        if (newHp == 0) {
            emit TeamDefeated(_targetTeam);
            _reassignTeamPlayers(targetTeamId);
        }
    }

    // Função para curar a própria equipa
    function healTeam() external {
        require(players[msg.sender].isRegistered, "Player not registered");
        uint8 teamId = players[msg.sender].teamId;
        require(teamId > 0, "Must be in a team to heal");
        require(teams[teamId].hp > 0, "Cannot heal defeated team");
        require(teams[teamId].hp < MAX_HP, "Team already at max HP");

        uint16 healAmount = _random(
            uint256(uint160(msg.sender)),
            MIN_HEAL,
            MAX_HEAL
        );
        uint16 currentHp = teams[teamId].hp;
        uint16 newHp = currentHp + healAmount > MAX_HP
            ? MAX_HP
            : currentHp + healAmount;
        healAmount = newHp - currentHp;

        teams[teamId].hp = newHp;
        emit TeamHealed(teams[teamId].name, healAmount, newHp);
    }

    // Função para atualizar o leaderboard
    function _updateLeaderboard(address player) private {
        // Find if player is already in leaderboard
        for (uint i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].playerAddress == player) {
                leaderboard[i].damageDealt = players[player].totalDamageDealt;
                _sortLeaderboard();
                return;
            }
        }

        // Add new player to leaderboard if there's room or they have more damage than the last place
        if (leaderboard.length < 10) {
            leaderboard.push(
                LeaderboardEntry({
                    playerAddress: player,
                    username: players[player].username,
                    damageDealt: players[player].totalDamageDealt
                })
            );
        } else if (
            players[player].totalDamageDealt >
            leaderboard[leaderboard.length - 1].damageDealt
        ) {
            leaderboard[leaderboard.length - 1] = LeaderboardEntry({
                playerAddress: player,
                username: players[player].username,
                damageDealt: players[player].totalDamageDealt
            });
        }
        _sortLeaderboard();
    }

    // Função para ordenar o leaderboard
    function _sortLeaderboard() private {
        uint n = leaderboard.length;
        for (uint i = 0; i < n - 1; i++) {
            for (uint j = 0; j < n - i - 1; j++) {
                if (
                    leaderboard[j].damageDealt < leaderboard[j + 1].damageDealt
                ) {
                    LeaderboardEntry memory temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                }
            }
        }
    }

    // Funções de visualização
    function getPlayer(address _player) external view returns (Player memory) {
        return players[_player];
    }

    function getTeamName(
        address _player
    ) external view returns (string memory) {
        uint8 teamId = players[_player].teamId;
        require(teamId > 0, "No team assigned");
        return teams[teamId].name;
    }

    function getTeamHP(string calldata _team) external view returns (uint16) {
        uint8 teamId = teamNameToId[_team];
        require(teamId > 0, "Invalid team");
        return teams[teamId].hp;
    }

    function getTeamPlayers(
        string calldata _team
    ) external view returns (address[] memory) {
        uint8 teamId = teamNameToId[_team];
        require(teamId > 0, "Invalid team");
        return teams[teamId].players;
    }

    function getLeaderboard()
        external
        view
        returns (LeaderboardEntry[] memory)
    {
        return leaderboard;
    }

    function getPlayerDamage(address _player) external view returns (uint256) {
        return players[_player].totalDamageDealt;
    }

    // Function to find a team with HP > 0
    function _findAvailableTeam() private view returns (uint8) {
        uint8[] memory availableTeams = new uint8[](teamNames.length);
        uint8 count = 0;

        for (uint8 i = 1; i <= teamNames.length; i++) {
            if (teams[i].hp > 0) {
                availableTeams[count] = i;
                count++;
            }
        }

        require(count > 0, "No available teams");
        // Pick a random team from available ones
        uint8 randomIndex = uint8(_random(block.timestamp, 0, count - 1));
        return availableTeams[randomIndex];
    }

    // Function to reassign players when their team is defeated
    function _reassignTeamPlayers(uint8 defeatedTeamId) private {
        address[] memory playersToReassign = teams[defeatedTeamId].players;

        for (uint i = 0; i < playersToReassign.length; i++) {
            address player = playersToReassign[i];
            uint8 newTeamId = _findAvailableTeam();

            // Update player's team
            players[player].teamId = newTeamId;

            // Add player to new team
            teams[newTeamId].players.push(player);

            emit PlayerReassigned(
                player,
                teams[defeatedTeamId].name,
                teams[newTeamId].name
            );
        }

        // Clear the defeated team's players array
        delete teams[defeatedTeamId].players;
    }

    // Add view function to check if player is eligible
    function isPlayerEligibleForNFT(
        address player
    ) external view returns (bool) {
        if (monavaraNFT == address(0)) return false;
        if (IMonavaraNFT(monavaraNFT).hasMinted(player)) return false;
        return isEligibleForNFT[player];
    }
}
