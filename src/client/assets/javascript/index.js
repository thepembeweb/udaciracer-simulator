// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		await Promise.allSettled([getTracks(), getRacers()])
		.then(results => {
			results.forEach(result => {
			const value = result.value;
			if (value.length === 6) {
				const trackHtml = renderTrackCards(value);
				renderAt('#tracks', trackHtml)
			} else {
				const racerHtml = renderRacerCars(value);
				renderAt('#racers', racerHtml)
			}
			})
		});
	} catch(err) {
		console.log('Problem getting tracks and racers ::', err.message)
		console.error(err)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		let parent = event.target.parentElement
		const { target } = event

        // Race track form field
		if (parent.matches('.card.track')) {
			handleSelectTrack(parent)
		}

		// Podracer form field
		if (parent.matches('.card.podracer')) {
			handleSelectPodRacer(parent)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	
	try {

		// Get player_id and track_id from the store
		const {track_id, player_id} = store;

		if(!track_id || !player_id){
			alert('Please select tract and racer to start the race!');
			return;
		} else{
			// invoke the API call to create the race, then save the result
		    const race = await createRace(player_id, track_id);
			renderAt('#race', renderRaceStartView(race.Track, race.Cars))
			
			// update the store with the race id
			store.race_id = race.ID - 1;

			// The race has been created, now start the countdown
			// call the async function runCountdown
			await runCountdown()
			// call the async function startRace
			await startRace(store.race_id)
			// call the async function runRace
			await runRace(store.race_id)
		}
	} catch (err) {
		console.log('Problem with handleCreateRace ::', err);
	  }
}

function runRace(raceID) {
	return new Promise(resolve => {
	// use Javascript's built in setInterval method to get race info every 500ms
	const raceInterval = setInterval(() => {
		getRace(raceID)
		  .then(result => {
			if (result.status === 'in-progress') {
			  renderAt('#leaderBoard', raceProgress(result.positions))
			} else if (result.status === 'finished') {
			  clearInterval(raceInterval)
			  renderAt('#race', resultsView(result.positions))
			  resolve(result)
			}
		  }).catch(err => console.log(err))
  
	  }, 500);
	}).catch(err => console.log('Problem with runRace ::', err))
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// use Javascript's built in setInterval method to count down once per second
			const interval = setInterval(() => {
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer
				// if the countdown is done, clear the interval, resolve the promise, and return
				if (timer === 0) {
				  clearInterval(interval);
				  resolve();
				}
			  }, 1000);

		});
	} catch(err) {
		console.log(err);
	}
}

function handleSelectPodRacer(target) {
	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected racer to the store
	store.player_id = parseInt(target.id)
}

function handleSelectTrack(target) {
	console.log('target.id', target.id);
	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected track id to the store
	store.track_id = parseInt(target.id)
}

async function handleAccelerate() {
	try {
		// Invoke the API call to accelerate
		await accelerate(store.race_id)
	  } catch (err) {
		console.log('Problem with handleAccelerate ::', err);
	  }
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}
const customDriverName = {
	"Racer 1": "Hamilton",
	"Racer 2": "Vettel",
	"Racer 3": "Verstappen",
	"Racer 4": "Leclerc",
	"Racer 5": "Norris"
  }
  const customTrackName = {
	"Track 1": "Monaco",
	"Track 2": "Silverstone",
	"Track 3": "Bahrain",
	"Track 4": "Monza",
	"Track 5": "Suzuka",
	"Track 6": "Singapore"
  }
function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${customDriverName[driver_name]}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${customTrackName[name]}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${customTrackName[track.name]}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	const raceTracks = positions.map((r) => {
	  const completion = r.segment / 201;
	  if (r.id === store.player_id){
	  return`
		<div class="racetrack">
		<div class="race-car" style = " bottom:${completion * 25}vh"></div>
		<div class="racer-name">
			<div id="youcolor">${customDriverName[r.driver_name]}</div>
			<div>${Math.round(completion * 100)}%</div>
		</div>
		</div>
	  `
	  }
	return`
		<div class="racetrack">
		<div class="race-car" style="bottom:${completion * 25}vh"></div>
		<div class="racer-name">
			<div>${customDriverName[r.driver_name]}</div>
			<div>${Math.round(completion * 100)}%</div>
		</div>
		</div>
	`
	}).join('');
  
	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1
  
	const results = positions.map(p => {
	  if (p.id === store.player_id){
	  return `
		  <td>
			<h3>${count++} - ${customDriverName[p.driver_name]}(you)</h3>
		  </td>
		  `
	  }
	  return `
		<tr>
			<td>
				<h3>${count++} - ${customDriverName[p.driver_name]}</h3>
			</td>
		</tr>
		  `
	}).join('')
  
	return `
		  <main>
			  <h3>Leaderboard</h3>
			  <section id="leaderBoard" class="leaderBoard">
				<div class="progress-section">
					${results}
				</div>
				<div class="progress-racetracks">
					${raceTracks}
				</div>
			  </section>
		  </main>
	  `
  }

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`, {
			method: 'GET',
			...defaultFetchOpts(),
		})
		.then(response => response.json())
		.catch(err => console.log('Problem with getTracks() ::', err));
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`, {
			method: 'GET',
			...defaultFetchOpts(),
		})
		.then(response => response.json())
		.catch(err => console.log('Problem with getRacers() ::', err));
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log('Problem with createRace request ::', err))
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`, {
		method: 'GET',
		...defaultFetchOpts(),
	  })
	  .then(response => response.json())
	  .catch(err => console.log(err));
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.catch(err => console.log('Problem with startRace() request ::', err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	  })
	  .catch(err => console.log('Problem with accelerate request ::', err))
}
