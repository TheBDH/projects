document.addEventListener('DOMContentLoaded', () => {
    const db = {
        games: [
            { date: 'January 11th', teams: ['Brown', 'Yale'], winner: 'Yale' },
            { date: 'January 11th', teams: ['Cornell', 'Columbia'], winner: 'Cornell' },
            { date: 'January 11th', teams: ['Princeton', 'Harvard'], winner: 'Princeton' },
            { date: 'January 11th', teams: ['Penn', 'Dartmouth'], winner: 'Dartmouth' },
            { date: 'January 18th', teams: ['Princeton', 'Dartmouth'], winner: 'Princeton' },
            { date: 'January 18th', teams: ['Yale', 'Columbia'], winner: 'Yale' },
            { date: 'January 18th', teams: ['Harvard', 'Brown'], winner: 'Harvard' },
            { date: 'January 18th', teams: ['Cornell', 'Penn'], winner: 'Cornell' },
            { date: 'January 20th', teams: ['Dartmouth', 'Yale'], winner: 'Yale' },
            { date: 'January 20th', teams: ['Columbia', 'Princeton'], winner: 'Princeton' },
            { date: 'January 20th', teams: ['Penn', 'Harvard'], winner: 'Penn' },
            { date: 'January 20th', teams: ['Brown', 'Cornell'], winner: 'Brown' },
            { date: 'January 25th', teams: ['Dartmouth', 'Brown'], winner: 'Dartmouth' },
            { date: 'January 25th', teams: ['Columbia', 'Penn'], winner: 'Penn' },
            { date: 'January 25th', teams: ['Harvard', 'Yale'], winner: 'Yale' },
            { date: 'January 25th', teams: ['Cornell', 'Princeton'], winner: 'Cornell' },
            { date: 'January 31st', teams: ['Yale', 'Princeton'], winner: 'Yale' },
            { date: 'January 31st', teams: ['Brown', 'Penn'], winner: 'Brown' },
            { date: 'January 31st', teams: ['Harvard', 'Columbia'], winner: 'Harvard' },
            { date: 'January 31st', teams: ['Dartmouth', 'Cornell'], winner: 'Cornell' },
            { date: 'February 1st', teams: ['Brown', 'Princeton'], winner: 'Princeton' },
            { date: 'February 1st', teams: ['Yale', 'Penn'], winner: 'Yale' },
            { date: 'February 1st', teams: ['Dartmouth', 'Columbia'], winner: 'Dartmouth' },
            { date: 'February 1st', teams: ['Harvard', 'Cornell'], winner: 'Cornell' },
            { date: 'February 7th', teams: ['Princeton', 'Penn'], winner: 'Princeton' },
            { date: 'February 8th', teams: ['Yale', 'Cornell'], winner: 'Yale' },
            { date: 'February 8th', teams: ['Brown', 'Columbia'], winner: 'Columbia' },
            { date: 'February 8th', teams: ['Harvard', 'Dartmouth'], winner: 'Dartmouth' },
            { date: 'February 14th', teams: ['Columbia', 'Dartmouth'], winner: 'Dartmouth' },
            { date: 'February 14th', teams: ['Princeton', 'Brown'], winner: 'Brown' },
            { date: 'February 14th', teams: ['Cornell', 'Harvard'], winner: 'Harvard' },
            { date: 'February 14th', teams: ['Penn', 'Yale'], winner: 'Yale' },
            { date: 'February 15th', teams: ['Cornell', 'Dartmouth'], winner: 'Dartmouth' },
            { date: 'February 15th', teams: ['Columbia', 'Harvard'], winner: 'Harvard' },
            { date: 'February 15th', teams: ['Penn', 'Brown'], winner: 'Brown' },
            { date: 'February 15th', teams: ['Princeton', 'Yale'], winner: 'Yale' },
            { date: 'February 21st', teams: ['Cornell', 'Yale'], winner: 'Yale' },
            { date: 'February 21st', teams: ['Harvard', 'Princeton'], winner: 'Princeton' },
            { date: 'February 21st', teams: ['Dartmouth', 'Penn'], winner: 'Penn' },
            { date: 'February 21st', teams: ['Columbia', 'Brown'], winner: 'Brown' },
            { date: 'February 22nd', teams: ['Cornell', 'Brown'], winner: 'Cornell' },
            { date: 'February 22nd', teams: ['Harvard', 'Penn'], winner: 'Harvard' },
            { date: 'February 22nd', teams: ['Columbia', 'Yale'], winner: 'Yale' },
            { date: 'February 22nd', teams: ['Dartmouth', 'Princeton'], winner: 'Dartmouth' },
            { date: 'February 28th', teams: ['Brown', 'Harvard'], winner: '' },
            { date: 'February 28th', teams: ['Yale', 'Dartmouth'], winner: '' },
            { date: 'February 28th', teams: ['Penn', 'Cornell'], winner: '' },
            { date: 'February 28th', teams: ['Princeton', 'Columbia'], winner: '' },
            { date: 'March 1st', teams: ['Brown', 'Dartmouth'], winner: '' },
            { date: 'March 1st', teams: ['Yale', 'Harvard'], winner: '' },
            { date: 'March 1st', teams: ['Penn', 'Columbia'], winner: '' },
            { date: 'March 2nd', teams: ['Princeton', 'Cornell'], winner: '' },
            { date: 'March 8th', teams: ['Yale', 'Brown'], winner: '' },
            { date: 'March 8th', teams: ['Columbia', 'Cornell'], winner: '' },
            { date: 'March 8th', teams: ['Penn', 'Princeton'], winner: '' },
            { date: 'March 8th', teams: ['Dartmouth', 'Harvard'], winner: '' }
        ],
        womenGames: [
            { date: 'January 4th', teams: ['Columbia', 'Penn'], winner: 'Columbia' },
            { date: 'January 4th', teams: ['Dartmouth', 'Brown'], winner: 'Dartmouth' },
            { date: 'January 4th', teams: ['Harvard', 'Yale'], winner: 'Harvard' },
            { date: 'January 4th', teams: ['Cornell', 'Princeton'], winner: 'Princeton' },
            { date: 'January 11th', teams: ['Columbia', 'Cornell'], winner: 'Columbia' },
            { date: 'January 11th', teams: ['Yale', 'Brown'], winner: 'Brown' },
            { date: 'January 11th', teams: ['Harvard', 'Princeton'], winner: 'Princeton' },
            { date: 'January 11th', teams: ['Dartmouth', 'Penn'], winner: 'Dartmouth' },
            { date: 'January 18th', teams: ['Penn', 'Cornell'], winner: 'Penn' },
            { date: 'January 18th', teams: ['Brown', 'Harvard'], winner: 'Harvard' },
            { date: 'January 18th', teams: ['Columbia', 'Yale'], winner: 'Columbia' },
            { date: 'January 18th', teams: ['Dartmouth', 'Princeton'], winner: 'Princeton' },
            { date: 'January 20th', teams: ['Harvard', 'Penn'], winner: 'Harvard' },
            { date: 'January 20th', teams: ['Cornell', 'Brown'], winner: 'Brown' },
            { date: 'January 20th', teams: ['Yale', 'Dartmouth'], winner: 'Yale' },
            { date: 'January 20th', teams: ['Princeton', 'Columbia'], winner: 'Columbia' },
            { date: 'January 25th', teams: ['Princeton', 'Cornell'], winner: 'Princeton' },
            { date: 'January 25th', teams: ['Yale', 'Harvard'], winner: 'Harvard' },
            { date: 'January 25th', teams: ['Brown', 'Dartmouth'], winner: 'Brown' },
            { date: 'January 25th', teams: ['Penn', 'Columbia'], winner: 'Columbia' },
            { date: 'January 31st', teams: ['Princeton', 'Yale'], winner: 'Princeton' },
            { date: 'January 31st', teams: ['Cornell', 'Dartmouth'], winner: 'Cornell' },
            { date: 'January 31st', teams: ['Penn', 'Brown'], winner: 'Brown' },
            { date: 'January 31st', teams: ['Columbia', 'Harvard'], winner: 'Columbia' },
            { date: 'February 1st', teams: ['Cornell', 'Harvard'], winner: 'Harvard' },
            { date: 'February 1st', teams: ['Princeton', 'Brown'], winner: 'Princeton' },
            { date: 'February 1st', teams: ['Columbia', 'Dartmouth'], winner: 'Columbia' },
            { date: 'February 1st', teams: ['Penn', 'Yale'], winner: 'Penn' },
            { date: 'February 8th', teams: ['Cornell', 'Yale'], winner: 'Cornell' },
            { date: 'February 8th', teams: ['Penn', 'Princeton'], winner: 'Princeton' },
            { date: 'February 8th', teams: ['Columbia', 'Brown'], winner: 'Columbia' },
            { date: 'February 8th', teams: ['Dartmouth', 'Harvard'], winner: 'Harvard' },
            { date: 'February 14th', teams: ['Brown', 'Princeton'], winner: 'Princeton' },
            { date: 'February 14th', teams: ['Yale', 'Penn'], winner: 'Penn' },
            { date: 'February 14th', teams: ['Harvard', 'Cornell'], winner: 'Harvard' },
            { date: 'February 14th', teams: ['Dartmouth', 'Columbia'], winner: 'Columbia' },
            { date: 'February 15th', teams: ['Brown', 'Penn'], winner: 'Penn' },
            { date: 'February 15th', teams: ['Dartmouth', 'Cornell'], winner: 'Cornell' },
            { date: 'February 15th', teams: ['Yale', 'Princeton'], winner: 'Princeton' },
            { date: 'February 16th', teams: ['Harvard', 'Columbia'], winner: 'Harvard' },
            { date: 'February 22nd', teams: ['Harvard', 'Brown'], winner: 'Harvard' },
            { date: 'February 22nd', teams: ['Dartmouth', 'Yale'], winner: 'Yale' },
            { date: 'February 22nd', teams: ['Cornell', 'Penn'], winner: 'Penn' },
            { date: 'February 22nd', teams: ['Columbia', 'Princeton'], winner: 'Columbia' },
            { date: 'February 28th', teams: ['Brown', 'Columbia'], winner: '' },
            { date: 'February 28th', teams: ['Yale', 'Cornell'], winner: '' },
            { date: 'February 28th', teams: ['Penn', 'Dartmouth'], winner: '' },
            { date: 'February 28th', teams: ['Princeton', 'Harvard'], winner: '' },
            { date: 'March 1st', teams: ['Yale', 'Columbia'], winner: '' },
            { date: 'March 1st', teams: ['Brown', 'Cornell'], winner: '' },
            { date: 'March 1st', teams: ['Penn', 'Harvard'], winner: '' },
            { date: 'March 1st', teams: ['Princeton', 'Dartmouth'], winner: '' },
            { date: 'March 8th', teams: ['Brown', 'Yale'], winner: '' },
            { date: 'March 8th', teams: ['Princeton', 'Penn'], winner: '' },
            { date: 'March 8th', teams: ['Cornell', 'Columbia'], winner: '' },
            { date: 'March 8th', teams: ['Harvard', 'Dartmouth'], winner: '' }
        ]
    };

    const today = new Date('2025-02-27');
    today.setHours(0, 0, 0, 0);

    //TODO RESET THE GAMES WHEN GENDER SWITCHED
    function parseDate(dateStr) {
        const [month, day] = dateStr.split(' ');
        const monthIndex = new Date(`${month} 1, 2000`).getMonth();
        const dayNumber = parseInt(day);
        return new Date(new Date().getFullYear(), monthIndex, dayNumber);
    }

    const gamesTableBody = document.querySelector('#gamesTable tbody');
    gamesTableBody.innerHTML = '';

    const genderSelect = document.querySelector('#genderSelect');
    let curDB = db.games;
    let curGender = 'mens';
    let gamesPlayed = 0;

    if (genderSelect) {
        genderSelect.addEventListener('change', () => {
            curDB = genderSelect.value === 'womens' ? db.womenGames : db.games;
            console.log(curDB);
            curGender = genderSelect.value;
            updateGamesTable();
        });
    } else {
        console.error('Gender select element not found');
    }

    function updateGamesPlayed() {
        //gamesPlayed = curDB.filter(game => game.winner !== '').length;
        gamesPlayed = curDB.filter(game => parseDate(game.date) < today).length;
    }

    function updateGamesTable() {
        updateGamesPlayed();

        gamesTableBody.innerHTML = '';
        curDB.filter(game => parseDate(game.date) >= today).forEach((game, index) => {
            const row = document.createElement('tr');
            const gameId = `game${index + 1}`;
            row.innerHTML = `
                <td><div class="date">${game.date}</div></td>
                <td>
                    <button class="team ${game.winner === game.teams[0] ? 'winner selected' : game.winner === game.teams[1] ? 'loser' : ''}" data-game-id="${gameId}" data-team="${game.teams[0]}">${game.teams[0]}
                        <input type="checkbox" class="team-checkbox ${game.winner === game.teams[0] ? 'winner-checkbox' : game.winner === game.teams[1] ? 'loser-checkbox' : ''}" data-game-id="${gameId}" data-team="${game.teams[0]}" ${game.winner === game.teams[0] ? 'checked' : ''}>
                    </button>
                </td>
                <td>
                    <button class="team ${game.winner === game.teams[1] ? 'winner selected' : game.winner === game.teams[0] ? 'loser' : ''}" data-game-id="${gameId}" data-team="${game.teams[1]}">${game.teams[1]}
                        <input type="checkbox" class="team-checkbox ${game.winner === game.teams[1] ? 'winner-checkbox' : game.winner === game.teams[0] ? 'loser-checkbox' : ''}" data-game-id="${gameId}" data-team="${game.teams[1]}" ${game.winner === game.teams[1] ? 'checked' : ''}>
                    </button>
                </td>
            `;
            gamesTableBody.appendChild(row);
        });
        projectStandings();
    }

    updateGamesTable();

    // db.games.filter(game => parseDate(game.date) >= today).forEach((game, index) => {
    //     const row = document.createElement('tr');
    //     const gameId = `game${index + 1}`;
    //     row.innerHTML = `
    //         <td><div class="date">${game.date}</div></td>
    //         <td>
    //             <button class="team" data-game-id="${gameId}" data-team="${game.teams[0]}">${game.teams[0]}
    //                 <input type="checkbox" class="team-checkbox" data-game-id="${gameId}" data-team="${game.teams[0]}">
    //             </button>
    //         </td>
    //         <td>
    //             <button class="team" data-game-id="${gameId}" data-team="${game.teams[1]}">${game.teams[1]}
    //                 <input type="checkbox" class="team-checkbox" data-game-id="${gameId}" data-team="${game.teams[1]}">
    //             </button>
    //         </td>
    //     `;
    //     gamesTableBody.appendChild(row);
    // });

    gamesTableBody.addEventListener('click', (event) => {
        console.log(curDB);
        if (event.target.classList.contains('team') || event.target.classList.contains('team-checkbox')) {
            const gameId = event.target.getAttribute('data-game-id');
            const team = event.target.getAttribute('data-team');
            const gameIndex = parseInt(gameId.replace('game', '')) - 1;
            const game = curDB[gamesPlayed + gameIndex];

            if (game.winner === team) {
                game.winner = '';
                document.querySelectorAll(`[data-game-id="${gameId}"]`).forEach(el => {
                    el.classList.remove('winner', 'loser', 'selected', 'loser-checkbox');
                    if (el.type === 'checkbox') el.checked = false;
                });
            } else {
                const otherTeam = game.teams.find(t => t !== team);
                game.winner = team;
                document.querySelectorAll(`[data-game-id="${gameId}"]`).forEach(el => {
                    el.classList.remove('winner', 'loser', 'selected', 'loser-checkbox');
                    if (el.getAttribute('data-team') === team) {
                        el.classList.add('winner', 'selected');
                        if (el.type === 'checkbox') el.checked = true;
                    } else if (el.getAttribute('data-team') === otherTeam) {
                        el.classList.add('loser');
                        if (el.type === 'checkbox') {
                            el.checked = false;
                            el.classList.add('loser-checkbox');
                        }
                    }
                });
            }
        }
        projectStandings();
    });


    // function updateWinnersFromTable() {
    //     const gamesTableBody = document.querySelector('#gamesTable tbody');
    //     const rows = gamesTableBody.querySelectorAll('tr');
    //     rows.forEach((row) => {
    //         const select = row.querySelector('select');
    //         const gameId = select.name;
    //         const gameIndex = parseInt(gameId.replace('game', '')) - 1;
    //         db.games[gamesPlayed + gameIndex].winner = select.value || '';
    //     });
    // }
    //document.getElementById('projectStandings').addEventListener('click', projectStandings);

    function projectStandings() {
        //updateWinnersFromTable();
        const standings = {
            'Harvard': { wins: 0, losses: 0 },
            'Yale': { wins: 0, losses: 0 },
            'Princeton': { wins: 0, losses: 0 },
            'Columbia': { wins: 0, losses: 0 },
            'Cornell': { wins: 0, losses: 0 },
            'Brown': { wins: 0, losses: 0 },
            'Dartmouth': { wins: 0, losses: 0 },
            'Penn': { wins: 0, losses: 0 }
        };

        curDB.forEach(game => {
            const [team1, team2] = game.teams;
            const winner = game.winner;
            if (winner === team1) {
                standings[team1].wins++;
                standings[team2].losses++;
            } else if (winner === team2) {
                standings[team2].wins++;
                standings[team1].losses++;
            }
        });

        const standingsTableBody = document.querySelector('#standingsTable tbody');
        standingsTableBody.innerHTML = '';
        const sortedTeams = Object.keys(standings).sort((a, b) => standings[b].wins - standings[a].wins);

        for (let i = 0; i < sortedTeams.length - 1; i++) {
            let tieGroup = [sortedTeams[i]];
            while (i < sortedTeams.length - 1 && standings[sortedTeams[i]].wins === standings[sortedTeams[i + 1]].wins) {
                tieGroup.push(sortedTeams[i + 1]);
                i++;
            }
            if (tieGroup.length > 1) {
                const resolvedTieGroup = breakTie(tieGroup, standings, curDB, true);
                sortedTeams.splice(i - tieGroup.length + 1, tieGroup.length, ...resolvedTieGroup);
            }
        }
        const start = performance.now();
        simulateStandings();
        const end = performance.now();
        const timeTaken = end - start;
        const simulationsPerSecond = 1000 / timeTaken;
        const numSimulations = Math.min(Math.floor(simulationsPerSecond * 10), 1000); // Cap at 1000 simulations

        console.log(`Running ${numSimulations} simulations based on processor speed.`);
        const simulationResults = runSimulations(numSimulations);

        for (let i = 0; i < sortedTeams.length; i++) {
            const team = sortedTeams[i];
            const row = document.createElement('tr');
            row.innerHTML = `<td class="standingTeam">${team}</td><td>${standings[team].wins}</td><td>${standings[team].losses}</td><td>${simulationResults[team]}</td>`;
            if (i === 4) {
            row.style.borderTop = '6px solid white'; // Thicker line between fourth and fifth row
            }
            if (team === 'Brown') {
                console.log("BROOOWN");
                row.querySelectorAll('td').forEach(cell => {
                    //cell.style.backgroundColor = i < 4 ? '#90ee90' : '#ffcccb';
                    cell.style.backgroundColor = i < 4 ? '#00a600' : '#e52d2d';
                });
            }
            standingsTableBody.appendChild(row);
        }
    }

    function simulateStandings() {
        const standings = {
            'Harvard': { wins: 0, losses: 0 },
            'Yale': { wins: 0, losses: 0 },
            'Princeton': { wins: 0, losses: 0 },
            'Columbia': { wins: 0, losses: 0 },
            'Cornell': { wins: 0, losses: 0 },
            'Brown': { wins: 0, losses: 0 },
            'Dartmouth': { wins: 0, losses: 0 },
            'Penn': { wins: 0, losses: 0 }
        };

        curDB.forEach(game => {
            const [team1, team2] = game.teams;
            const winner = game.winner;
            if (winner === team1) {
                standings[team1].wins++;
                standings[team2].losses++;
            } else if (winner === team2) {
                standings[team2].wins++;
                standings[team1].losses++;
            }
        });

        curDB.forEach(game => {
            const [team1, team2] = game.teams;
            const winner = game.winner;
            if (winner === '') {
                odds = standings[team1].wins / (standings[team1].wins + standings[team2].wins);
                const simulatedWinner = Math.random() < odds ? team1 : team2;
                standings[simulatedWinner].wins++;
                standings[simulatedWinner === team1 ? team2 : team1].losses++;
            }
        });

        const sortedTeams = Object.keys(standings).sort((a, b) => standings[b].wins - standings[a].wins);

        for (let i = 0; i < sortedTeams.length - 1; i++) {
            let tieGroup = [sortedTeams[i]];
            while (i < sortedTeams.length - 1 && standings[sortedTeams[i]].wins === standings[sortedTeams[i + 1]].wins) {
                tieGroup.push(sortedTeams[i + 1]);
                i++;
            }
            if (tieGroup.length > 1) {
                const resolvedTieGroup = breakTie(tieGroup, standings, curDB, false);
                sortedTeams.splice(i - tieGroup.length + 1, tieGroup.length, ...resolvedTieGroup);
            }
        }

        return sortedTeams;
    }

    function runSimulations(num) {
        const simulationResults = {
            'Harvard': 0,
            'Yale': 0,
            'Princeton': 0,
            'Columbia': 0,
            'Cornell': 0,
            'Brown': 0,
            'Dartmouth': 0,
            'Penn': 0
        };
    
        for (let i = 0; i < num; i++) {
            const standings = simulateStandings();
            standings.slice(0, 4).forEach(team => {
                simulationResults[team]++;
            });
        }

        const results = {};
        Object.keys(simulationResults).forEach(team => {
            const percentage = ((simulationResults[team] / num) * 100).toFixed(1) + '%';
            results[team] = percentage;
        });

        return results;
    }

    function breakTie(tiedTeams, standings, games, log) {
        // Cumulative record against all other teams in the tie
        const records = tiedTeams.map(team => {
            return {
                team,
                record: tiedTeams.reduce((acc, opponent) => {
                    if (team !== opponent) {
                        const headToHead = games.filter(game =>
                            (game.teams.includes(team) && game.teams.includes(opponent)) && game.winner !== ''
                        );
                        const wins = headToHead.filter(game => game.winner === team).length;
                        acc += wins;
                    }
                    return acc;
                }, 0)
            };
        });

        records.sort((a, b) => b.record - a.record);
        if (!records.every(record => record.record === records[0].record)) {
            const groupedRecords = [];
            let currentGroup = [records[0]];

            for (let i = 1; i < records.length; i++) {
                if (records[i].record === records[i - 1].record) {
                    currentGroup.push(records[i]);
                } else {
                    groupedRecords.push(currentGroup);
                    currentGroup = [records[i]];
                }
            }
            groupedRecords.push(currentGroup);

            const resolvedGroups = Object.values(groupedRecords).flatMap(group => {
                if (group.length > 1) {
                    return breakTie(group.map(item => item.team), standings, games, log);
                }
                return group.map(item => item.team);
            });
            if (log) {
                console.log("Tie broken by head-to-head record against tie group.");
                console.log(groupedRecords);
            }
            return resolvedGroups;
        }

        // Record against highest seeded team not in the tie
        const otherTeams = Object.keys(standings)
            .filter(team => !tiedTeams.includes(team))
            .sort((a, b) => standings[b].wins - standings[a].wins);
        for (let team of otherTeams) {
            if (log) {
                console.log(team);
            }
            const teamRecords = tiedTeams.map(tiedTeam => {
                const wins = games.filter(game =>
                    game.teams.includes(tiedTeam) && game.teams.includes(team) && game.winner !== ''
                ).filter(game => game.winner === tiedTeam).length;
                return { team: tiedTeam, wins };
            });

            teamRecords.sort((a, b) => b.wins - a.wins);
            if (!teamRecords.every(record => record.wins === teamRecords[0].wins)) {
                const groupedRecords = [];
                let currentGroup = [teamRecords[0]];

                for (let i = 1; i < teamRecords.length; i++) {
                    if (teamRecords[i].wins === teamRecords[i - 1].wins) {
                        currentGroup.push(teamRecords[i]);
                    } else {
                        groupedRecords.push(currentGroup);
                        currentGroup = [teamRecords[i]];
                    }
                }
                groupedRecords.push(currentGroup);

                const resolvedGroups = Object.values(groupedRecords).flatMap(group => {
                    if (group.length > 1) {
                        return breakTie(group.map(item => item.team), standings, games, log);
                    }
                    return group.map(item => item.team);
                });
                if (log) {
                    console.log(groupedRecords);
                    console.log("Tie broken by record against top team not in tie.");
                }
                return resolvedGroups;
            }
        }

        // If still tied, use NCAA NET rankings
        const netRankings = tiedTeams.map(team => ({
            team,
            ranking: getNetRanking(team)
        }));

        netRankings.sort((a, b) => a.ranking - b.ranking);
        if (netRankings[0].ranking !== netRankings[1].ranking) {
            if (log) {
                console.log(netRankings);
                console.log("Tie broken by net rankings");
            }
            return netRankings.map(record => record.team);
        }

        // If still tied, conduct a draw
        return tiedTeams.sort((a, b) => draw(a, b));
    }

    function getNetRanking(team) {
        // update after each game from https://www.ncaa.com/rankings/basketball-men/d1/ncaa-mens-basketball-net-rankings
        const menRankings = {
            'Yale': 68,
            'Cornell': 157,
            'Princeton': 167,
            'Brown': 208,
            'Dartmouth': 209,
            'Columbia': 256,
            'Harvard': 267,
            'Penn': 304
        };
        const womenRankings = {
            'Harvard': 35,
            'Columbia': 42,
            'Princeton': 50,
            'Penn': 167,
            'Brown': 179,
            'Cornell': 235,
            'Dartmouth': 310,
            'Yale': 334
        };
        const rankings = curGender === 'mens' ? menRankings : womenRankings;
        return rankings[team] || 999; // Return a high number if team is not found
    }

    function draw(teamA, teamB) {
        // Placeholder function for conducting a draw
        // Replace with actual implementation
        return Math.random() - 0.5;
    }
});
