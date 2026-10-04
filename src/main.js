// Browser controller: connect the game rules, Canvas renderer, and HTML controls.
// Keep gameplay decisions in engine.js and drawing details in render.js.
import { Game, DUCKS, BALLOONS, WAVES, statsFor } from './engine.js';
import { Renderer, drawDuck } from './render.js';

// Short helper for finding an HTML element by its id.
const $ = (id) => {
    return document.getElementById(id);
};
export const game = new Game();
const renderer = new Renderer($('game'));
// A selection is either a shop duck to place or an existing duck to inspect.
// pointer always uses map coordinates, even when CSS resizes the Canvas.
const selection = {
    id: null,
    type: null,
    pointer: null,
    cost: 0,
    keyboard: false,
};
// Browser storage is local to this site. Version the key when save formats change.
const SAVE_KEY = 'pond-patrol-save-v1';
// checkpoint is the last preparation stage, used by Continue and Retry this wave.
let checkpoint = null;
let welcome = true;
let speed = 1;
let autoTimer = 0;
let toastTimer = 0;
let inspectorKey = '';
let uiTimer = 0;
let wasPlayingBeforeHelp = false;
let storageAvailable = true;
let soundEnabled = false;
let audioContext = null;
let lastPopSound = 0;
// Check saved data using a temporary game so the welcome screen does not load it yet.
// Storage may be unavailable in some browser modes; the game still works without it.
try {
    soundEnabled = localStorage.getItem('pond-patrol-sound') === 'on';
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    const probe = new Game();
    if (probe.restore(saved)) {
        checkpoint = saved;
    }
} catch {
    storageAvailable = false;
}

// Show brief feedback. Replace the old timer so a new message is not hidden too soon.
function toast(text) {
    $('toast').textContent = text;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        return $('toast').classList.remove('visible');
    }, 3500);
}

// engine.serialize() returns null during a wave, preserving the earlier checkpoint.
// Save after preparation-stage purchases and immediately before starting a wave.
function persist() {
    const data = game.serialize();
    if (!data) {
        return;
    }
    checkpoint = data;
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
        storageAvailable = false;
    }
    $('save-status').textContent = storageAvailable
        ? 'Progress saves between waves'
        : 'Saving unavailable in this browser';
}

// A completed campaign no longer needs a Continue checkpoint.
function clearSave() {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch {
        storageAvailable = false;
    }
}

// Browsers require a click or key press before starting audio; create it on demand.
function initAudio() {
    if (!audioContext) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (Audio) {
            audioContext = new Audio();
        }
    }
    if (audioContext?.state === 'suspended') {
        audioContext.resume().catch(() => {
            // Keep playing silently if the browser blocks audio.
        });
    }
}

// Synthesize small sound effects instead of downloading audio files.
// Notes contain frequency, duration, and volume, in that order.
function sound(kind) {
    if (!soundEnabled || !audioContext || audioContext.state !== 'running') {
        return;
    }
    const now = audioContext.currentTime;
    // Rapid-fire ducks can pop many layers at once; avoid a sound for every layer.
    if (kind === 'pop' && now - lastPopSound < 0.07) {
        return;
    }
    if (kind === 'pop') {
        lastPopSound = now;
    }
    const notes = {
        pop: [610, 0.045, 0.027],
        build: [320, 0.12, 0.06],
        upgrade: [850, 0.18, 0.05],
        complete: [1050, 0.24, 0.05],
        leak: [140, 0.17, 0.07],
        lost: [95, 0.4, 0.06],
        won: [1250, 0.35, 0.06],
        wave: [450, 0.15, 0.045],
    };
    const n = notes[kind];
    if (!n) {
        return;
    }
    const o = audioContext.createOscillator();
    const g = audioContext.createGain();
    o.type = kind === 'pop' ? 'sine' : 'triangle';
    o.frequency.setValueAtTime(n[0], now);
    o.frequency.exponentialRampToValueAtTime(
        n[0] * (kind === 'leak' ? 0.55 : 1.3),
        now + n[1],
    );
    g.gain.setValueAtTime(n[2], now);
    g.gain.exponentialRampToValueAtTime(0.001, now + n[1]);
    o.connect(g);
    g.connect(audioContext.destination);
    o.start(now);
    o.stop(now + n[1]);
}

// Keep the button's appearance, tooltip, and screen-reader label in sync.
function updateSound() {
    $('sound').classList.toggle('active', soundEnabled);
    $('sound').setAttribute(
        'aria-label',
        soundEnabled ? 'Turn sound off' : 'Turn sound on',
    );
    $('sound').title = soundEnabled ? 'Sound on' : 'Sound muted';
}
$('sound').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    initAudio();
    updateSound();
    try {
        localStorage.setItem('pond-patrol-sound', soundEnabled ? 'on' : 'off');
    } catch {
        // The toggle still works even when browser storage is unavailable.
    }
    if (soundEnabled) {
        sound('build');
    }
});
updateSound();

// Reuse the map duck drawing for shop cards and the upgrade-panel portrait.
function portrait(canvas, type, levels = [0, 0]) {
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, 80, 80);
    drawDuck(
        c,
        {
            type,
            levels,
            x: 40,
            y: 43,
            angle: -0.15,
        },
        1.05,
    );
}
// Build the three shop cards from the same definitions that the economy uses.
$('shop').innerHTML = Object.entries(DUCKS)
    .map(([type, d], i) => {
        return /* HTML */ `
            <button
                class="duck-card ${type}"
                data-duck="${type}"
                aria-label="Select ${d.name}, ${d.cost} coins"
            >
                <canvas width="80" height="80" aria-hidden="true"></canvas>
                <span class="duck-info">
                    <span class="duck-name">${d.name}</span>
                    <span class="duck-role">${d.role}</span>
                    <span class="duck-price">● ${d.cost.toLocaleString()}</span>
                </span>
                <span class="duck-hotkey">${i + 1}</span>
            </button>
        `;
    })
    .join('');
document.querySelectorAll('[data-duck]').forEach((button) => {
    portrait(button.querySelector('canvas'), button.dataset.duck);
    button.addEventListener('click', () => {
        return chooseDuck(button.dataset.duck);
    });
});

// Clicking the same shop card twice cancels placement; another card switches type.
function chooseDuck(type) {
    if (welcome || ['lost', 'won'].includes(game.status)) {
        return;
    }
    selection.type = selection.type === type ? null : type;
    selection.id = null;
    selection.cost = DUCKS[type].cost;
    $('field-hint').textContent = selection.type
        ? `${DUCKS[type].name} selected · click grass to place · Esc to cancel`
        : 'Pick a duck or select one on the map.';
    refreshUI(true);
}

// Cancel placement and inspection, then restore the panel's empty state.
function clearSelection() {
    selection.type = null;
    selection.id = null;
    selection.keyboard = false;
    refreshUI(true);
}

// Start a fresh campaign and save its initial preparation stage.
function newGame() {
    game.reset();
    renderer.fx = [];
    welcome = false;
    autoTimer = 0;
    clearSelection();
    $('overlay').innerHTML = '';
    persist();
    refreshUI(true);
    toast('Welcome to Willowbend. Place your first duck!');
}

// Restore a validated checkpoint, falling back to a fresh game if it cannot load.
function continueGame() {
    if (!game.restore(checkpoint)) {
        return newGame();
    }
    welcome = false;
    autoTimer = 0;
    clearSelection();
    $('overlay').innerHTML = '';
    refreshUI(true);
    toast(`Welcome back! Wave ${game.wave + 1} is next.`);
}

// Offer Continue only when a valid save was found during startup.
function showWelcome() {
    $('overlay').innerHTML = /* HTML */ `
        <div class="overlay-card">
            <div class="overlay-illustration">🦆 🎈</div>
            <span class="eyebrow">WELCOME TO WILLOWBEND</span>
            <h2>
                Small pond.
                <br />
                Big duck energy.
            </h2>
            <p>
                Three brave ducks. Fifteen waves of trouble.
                <br />
                Build your flock and keep the pond peaceful.
            </p>
            ${checkpoint
                ? /* HTML */ `
                      <button class="primary-button" id="continue-game">
                          Continue · wave ${checkpoint.wave + 1}
                          <span>↗</span>
                      </button>
                      <button class="secondary-button" id="fresh-game">
                          Start a fresh adventure
                      </button>
                  `
                : /* HTML */ `
                      <button class="primary-button" id="fresh-game">
                          Let’s quack
                          <span>↗</span>
                      </button>
                  `}
            <button class="secondary-button" id="welcome-help">How to play</button>
        </div>
    `;
    $('fresh-game').onclick = newGame;
    if ($('continue-game')) {
        $('continue-game').onclick = continueGame;
    }
    $('welcome-help').onclick = openHelp;
}

// Show campaign results. Losing keeps the checkpoint for a retry; winning clears it.
function showResult(won) {
    autoTimer = 0;
    selection.type = null;
    selection.id = null;
    if (won) {
        clearSave();
    }
    $('overlay').innerHTML = /* HTML */ `
        <div class="overlay-card">
            <div class="overlay-illustration">${won ? '🏆 🦆' : '🎈 🦆'}</div>
            <span class="eyebrow">
                ${won ? 'THE POND IS YOURS' : 'EVERY FLOCK LEARNS'}
            </span>
            <h2>${won ? 'What a flock.' : 'A little outquacked.'}</h2>
            <p>
                ${won
                    ? 'All 15 waves cleared. Willowbend can breathe easy. Your ducks have earned a very long swim.'
                    : `The balloons broke through on wave ${game.wave}. Try covering the bends and investing in stronger upgrades.`}
            </p>
            <div class="result-stats">
                <div>
                    <strong>${game.wave}${won ? '' : ' / 15'}</strong>
                    <span>WAVES</span>
                </div>
                <div>
                    <strong>${game.pops.toLocaleString()}</strong>
                    <span>LAYERS POPPED</span>
                </div>
                <div>
                    <strong>${game.lives}</strong>
                    <span>LIVES LEFT</span>
                </div>
            </div>
            ${!won && checkpoint
                ? /* HTML */ `
                      <button id="retry" class="primary-button">
                          Retry this wave
                          <span>↗</span>
                      </button>
                  `
                : ''}
            <button
                id="play-again"
                class="${won ? 'primary-button' : 'secondary-button'}"
            >
                A fresh adventure
                ${won
                    ? /* HTML */ `
                          <span>↗</span>
                      `
                    : ''}
            </button>
        </div>
    `;
    // Retry restores the coins, lives, and ducks from before the failed wave.
    if ($('retry')) {
        $('retry').onclick = () => {
            game.restore(checkpoint);
            renderer.fx = [];
            clearSelection();
            $('overlay').innerHTML = '';
            persist();
            refreshUI(true);
            toast('Back at the start of the wave. Adjust your flock, then try again.');
        };
    }
    $('play-again').onclick = newGame;
}

// Pause while confirming a restart, and resume the previous state if it is canceled.
function restartPrompt() {
    if (welcome || ['won', 'lost'].includes(game.status)) {
        newGame();
        return;
    }
    const oldStatus = game.status;
    if (game.status === 'playing') {
        game.togglePause();
    }
    autoTimer = 0;
    $('overlay').innerHTML = /* HTML */ `
        <div class="overlay-card">
            <span class="eyebrow">A CLEAN SLATE</span>
            <h2>A new adventure?</h2>
            <p>Your current flock and saved progress will be replaced.</p>
            <button id="confirm-new" class="primary-button">
                Start fresh
                <span>↗</span>
            </button>
            <button id="cancel-new" class="secondary-button">Keep my flock</button>
        </div>
    `;
    $('confirm-new').onclick = newGame;
    $('cancel-new').onclick = () => {
        $('overlay').innerHTML = '';
        game.status = oldStatus;
        refreshUI();
    };
    refreshUI();
}
$('restart').onclick = restartPrompt;

// The field guide pauses combat and remembers whether it should resume afterward.
function openHelp() {
    wasPlayingBeforeHelp = game.status === 'playing';
    if (wasPlayingBeforeHelp) {
        game.togglePause();
    }
    autoTimer = 0;
    $('help-dialog').showModal();
    refreshUI();
}

// The dialog's close event handles resuming, including when Escape closes it.
function closeHelp() {
    $('help-dialog').close();
}
$('help').onclick = openHelp;
$('close-help').onclick = closeHelp;
$('got-it').onclick = closeHelp;
$('help-dialog').addEventListener('close', () => {
    if (wasPlayingBeforeHelp && game.status === 'paused') {
        game.togglePause();
    }
    wasPlayingBeforeHelp = false;
    refreshUI();
});

// One control handles starting, pausing, and resuming based on the current status.
function startOrPause() {
    if (welcome || $('help-dialog').open || $('overlay').children.length) {
        return;
    }
    initAudio();
    autoTimer = 0;
    if (game.status === 'ready') {
        persist();
        game.startWave();
    } else {
        game.togglePause();
    }
    refreshUI(true);
}
$('start').onclick = startOrPause;

// Speed changes the number of simulation steps, not the step size or damage rules.
function toggleSpeed() {
    speed = speed === 1 ? 3 : 1;
    $('speed').textContent = `${speed}×`;
    $('speed').classList.toggle('fast', speed > 1);
    $('speed').setAttribute('aria-label', `Game speed ${speed} times. Click to switch.`);
}
$('speed').onclick = toggleSpeed;
// Allow three real-world seconds to prepare before an automatically started wave.
$('autostart').onchange = () => {
    autoTimer = $('autostart').checked && game.status === 'ready' && !welcome ? 3 : 0;
};

// Show the selected duck's stats, targeting menu, upgrade choices, and sell value.
// Rebuild markup only when the duck or its tiers change, preserving menu focus.
function updateInspector(force = false) {
    const t = game.towers.find((t) => {
        return t.id === selection.id;
    });
    const key = t ? `${t.id}:${t.levels.join(',')}` : selection.type || 'empty';
    // Pop counts and affordability change during combat without changing selection.
    if (!force && key === inspectorKey) {
        if (t) {
            $('duck-pop-count').textContent = `${t.pops.toLocaleString()} layers popped`;
            document.querySelectorAll('[data-upgrade]').forEach((b) => {
                const path = Number(b.dataset.upgrade);
                const u = DUCKS[t.type].paths[path][t.levels[path]];
                b.disabled =
                    !u || game.money < u.cost || ['lost', 'won'].includes(game.status);
            });
        }
        return;
    }
    inspectorKey = key;
    if (!t) {
        const d = DUCKS[selection.type];
        $('inspector').innerHTML = /* HTML */ `
            <div class="empty-inspector">
                <div>
                    <span class="empty-icon">${d ? d.icon : '◎'}</span>
                    <h3>
                        ${d
                            ? `Deploy ${d.name}`
                            : 'A good spot makes all the difference.'}
                    </h3>
                    <p>
                        ${d
                            ? `Costs ${d.cost} coins. Click grass near a bend to cover more of the path.`
                            : 'Select a duck on the map to see its range, upgrades, and popping stats.'}
                    </p>
                </div>
            </div>
        `;
        return;
    }
    const d = DUCKS[t.type];
    const s = statsFor(t);
    $('inspector').innerHTML = /* HTML */ `
        <div class="inspector-heading">
            <canvas
                id="selected-portrait"
                width="80"
                height="80"
                aria-hidden="true"
            ></canvas>
            <div>
                <h3>${d.name}</h3>
                <p id="duck-pop-count">${t.pops.toLocaleString()} layers popped</p>
            </div>
        </div>
        <div class="stat-row">
            <span>
                RANGE
                <strong>${s.range}</strong>
            </span>
            <span>
                DAMAGE
                <strong>${s.damage}</strong>
            </span>
            <span>
                PIERCE
                <strong>${s.pierce}</strong>
            </span>
        </div>
        <div class="target-row">
            <label for="target">Target priority</label>
            <select id="target">
                <option value="first">First</option>
                <option value="last">Last</option>
                <option value="strong">Strongest</option>
                <option value="close">Closest</option>
            </select>
        </div>
        ${d.paths
            .map((path, p) => {
                const level = t.levels[p];
                const u = path[level];
                return /* HTML */ `
                    <div class="upgrade-path">
                        <div class="upgrade-path-heading">
                            <span>
                                ${p === 0 ? 'POWER & POPPING' : 'RANGE & UTILITY'}
                            </span>
                            <span class="tier-dots" aria-label="Tier ${level} of 3">
                                ${[1, 2, 3]
                                    .map((n) => {
                                        return /* HTML */ `
                                            <i class="${n <= level ? 'filled' : ''}"></i>
                                        `;
                                    })
                                    .join('')}
                            </span>
                        </div>
                        <button
                            class="upgrade-button"
                            data-upgrade="${p}"
                            ${!u || game.money < u.cost ? 'disabled' : ''}
                        >
                            <span>
                                <b>${u ? u.name : 'Fully upgraded'}</b>
                                <small>
                                    ${u ? u.description : path[2].name + ' mastered.'}
                                </small>
                            </span>
                            <span class="price">
                                ${u ? '● ' + u.cost.toLocaleString() : '✓'}
                            </span>
                        </button>
                    </div>
                `;
            })
            .join('')}
        <button class="sell-button" id="sell">
            Sell duck · +${Math.floor((t.invested * 7) / 10).toLocaleString()} coins
        </button>
    `;
    portrait($('selected-portrait'), t.type, t.levels);
    $('target').value = t.target;
    $('target').onchange = () => {
        t.target = $('target').value;
        persist();
    };
    document.querySelectorAll('[data-upgrade]').forEach((button) => {
        return (button.onclick = () => {
            if (game.upgrade(t.id, Number(button.dataset.upgrade))) {
                persist();
                refreshUI(true);
            }
        });
    });
    $('sell').onclick = sellSelected;
}

// Keep the map selection and saved preparation stage consistent after a sale.
function sellSelected() {
    if (selection.id && game.sell(selection.id)) {
        selection.id = null;
        persist();
        refreshUI(true);
        toast('Duck recalled. 70% of your investment returned.');
    }
}

// Refresh resource counters, wave controls, previews, and shop affordability.
// force asks the panels to rebuild after a purchase or selection change.
function refreshUI(force = false) {
    $('lives').textContent = game.lives;
    $('money').textContent = Math.floor(game.money).toLocaleString();
    $('wave').textContent = game.wave;
    const ready = game.status === 'ready';
    const paused = game.status === 'paused';
    const done = ['won', 'lost'].includes(game.status);
    $('start').innerHTML = ready
        ? `Start wave ${game.wave + 1} <span>▶</span>`
        : paused
          ? 'Resume wave <span>▶</span>'
          : done
            ? `${game.status === 'won' ? 'Pond protected' : 'Pond overrun'} <span>${game.status === 'won' ? '✓' : '×'}</span>`
            : 'Pause wave <span>Ⅱ</span>';
    $('start').disabled = done || welcome;
    $('speed').disabled = done || welcome;
    $('map-status').textContent = welcome
        ? 'A peaceful pond. For now.'
        : done
          ? game.status === 'won'
              ? 'The pond is safe. Thanks to you.'
              : 'The flock will rise again.'
          : paused
            ? 'Taking a breather.'
            : ready
              ? `Wave ${game.wave + 1} · prepare your flock`
              : `Wave ${game.wave} · ${game.enemies.length} balloons in the meadow`;
    // Preview the next wave while preparing; show the current one during combat.
    const w = WAVES[Math.min(14, ready ? game.wave : Math.max(0, game.wave - 1))];
    $('forecast-label').textContent = done
        ? 'THE ADVENTURE'
        : `${ready ? 'NEXT UP' : 'INCOMING'} · WAVE ${ready ? game.wave + 1 : game.wave}`;
    $('forecast-name').textContent = done
        ? game.status === 'won'
            ? '15 waves. One legendary flock.'
            : 'Ready for another try?'
        : w.name;
    if (force || $('forecast').dataset.wave !== String(WAVES.indexOf(w))) {
        $('forecast').dataset.wave = String(WAVES.indexOf(w));
        $('forecast').innerHTML = w.groups
            .map((g) => {
                return /* HTML */ `
                    <span class="balloon-chip">
                        <i
                            class="balloon-swatch"
                            style="background:${g.type === 'rainbow'
                                ? 'linear-gradient(#ee6c73,#efd76c,#78cfad,#a590df)'
                                : BALLOONS[g.type].color}"
                        ></i>
                        ${g.count}
                        ${BALLOONS[g.type].name}${g.camo ? ' · camo' : ''}${g.regrow
                            ? ' · regrow'
                            : ''}
                    </span>
                `;
            })
            .join('');
    }
    $('wave-progress').style.width = done
        ? '100%'
        : ready
          ? '0%'
          : `${(100 * game.spawned) / Math.max(1, game.schedule.length)}%`;
    $('round-note').textContent = done
        ? 'A good flock always has another adventure in it.'
        : paused
          ? 'Everything is paused. You can still build and upgrade.'
          : ready
            ? game.wave === 0
                ? 'Set up your flock. The first wave is on you.'
                : `Wave bonus collected. ${w.hint || 'Upgrade your ducks before the next wave.'}`
            : w.hint || 'Pop, earn, upgrade. You can build during a wave, too.';
    document.querySelectorAll('[data-duck]').forEach((b) => {
        b.classList.toggle('selected', selection.type === b.dataset.duck);
        b.classList.toggle('unaffordable', game.money < DUCKS[b.dataset.duck].cost);
        b.setAttribute('aria-pressed', String(selection.type === b.dataset.duck));
    });
    $('save-status').textContent = storageAvailable
        ? 'Progress saves between waves'
        : 'Saving unavailable in this browser';
    if (!selection.type) {
        $('field-hint').textContent = selection.id
            ? 'Duck selected · buy upgrades in the panel · S to sell'
            : '1 / 2 / 3 Choose a duck · click grass to place';
    }
    updateInspector(force);
}

// Translate mouse or touch positions from screen pixels into the fixed map size.
function pointerPosition(event) {
    const rect = $('game').getBoundingClientRect();
    return {
        x: ((event.clientX - rect.left) * 960) / rect.width,
        y: ((event.clientY - rect.top) * 620) / rect.height,
    };
}
$('game').addEventListener('pointermove', (event) => {
    selection.pointer = pointerPosition(event);
    selection.keyboard = false;
});
$('game').addEventListener('pointerleave', () => {
    if (!selection.keyboard) {
        selection.pointer = null;
    }
});

// A map click places a shop selection or selects an existing duck.
// Holding Shift keeps the same shop duck selected for repeated placement.
function interact(point, multi = false) {
    if (
        welcome ||
        ['lost', 'won'].includes(game.status) ||
        $('overlay').children.length
    ) {
        return;
    }
    initAudio();
    if (selection.type) {
        const t = game.place(selection.type, point.x, point.y);
        if (t) {
            if (!multi) {
                selection.type = null;
                selection.id = t.id;
            }
            persist();
            refreshUI(true);
        }
    } else {
        const t = game.towers.find((t) => {
            return Math.hypot(t.x - point.x, t.y - point.y) < 29;
        });
        selection.id = t?.id || null;
        refreshUI(true);
    }
}
$('game').addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
        return;
    }
    selection.pointer = pointerPosition(event);
    interact(selection.pointer, event.shiftKey);
});
$('game').addEventListener('contextmenu', (event) => {
    event.preventDefault();
    clearSelection();
});
// Page shortcuts must not interfere with browser shortcuts or focused form controls.
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }
    if (
        $('help-dialog').open ||
        ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName)
    ) {
        return;
    }
    if (event.key === 'Escape') {
        clearSelection();
        return;
    }
    if (welcome || $('overlay').children.length) {
        return;
    }
    if (['1', '2', '3'].includes(event.key)) {
        chooseDuck(['basic', 'super', 'magic'][Number(event.key) - 1]);
        selection.pointer ||= {
            x: 360,
            y: 280,
        };
        selection.keyboard = true;
    }
    if (event.code === 'Space') {
        event.preventDefault();
        startOrPause();
    }
    if (event.key.toLowerCase() === 'f') {
        toggleSpeed();
    }
    if (event.key.toLowerCase() === 's') {
        sellSelected();
    }
    // Arrow keys provide a map cursor; Shift uses smaller, more precise movements.
    if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        selection.pointer ||= {
            x: 360,
            y: 280,
        };
        selection.keyboard = true;
        const step = event.shiftKey ? 5 : 15;
        selection.pointer.x = Math.max(
            26,
            Math.min(
                934,
                selection.pointer.x +
                    (event.key === 'ArrowRight'
                        ? step
                        : event.key === 'ArrowLeft'
                          ? -step
                          : 0),
            ),
        );
        selection.pointer.y = Math.max(
            54,
            Math.min(
                594,
                selection.pointer.y +
                    (event.key === 'ArrowDown'
                        ? step
                        : event.key === 'ArrowUp'
                          ? -step
                          : 0),
            ),
        );
    }
    if (event.key === 'Enter' && selection.keyboard && selection.pointer) {
        event.preventDefault();
        interact(selection.pointer, event.shiftKey);
    }
});
// Leaving the tab pauses a live wave so the player cannot lose lives while away.
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.status === 'playing') {
        game.togglePause();
        autoTimer = 0;
        refreshUI();
        toast('Wave paused while you were away.');
    }
});

// Consume each engine event once, translating it into effects, sound, or menus.
function drainEvents() {
    for (const e of game.events.splice(0)) {
        renderer.event(e);
        sound(e.kind);
        if (e.kind === 'message' || e.kind === 'wave') {
            toast(e.text);
        }
        if (e.kind === 'complete') {
            persist();
            toast(`Wave ${e.wave} cleared! +${e.bonus} bonus coins.`);
            if ($('autostart').checked && game.status === 'ready') {
                autoTimer = 3;
            }
            refreshUI(true);
        }
        if (e.kind === 'lost' || e.kind === 'won') {
            showResult(e.kind === 'won');
            refreshUI(true);
        }
    }
}
// requestAnimationFrame supplies milliseconds; the engine uses seconds.
let lastTime = performance.now();
let accumulator = 0;

// Render at the browser's frame rate, but simulate in consistent 1/60-second steps.
// This keeps movement and hit detection stable at both 1x and 3x speed.
function frame(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    if (!document.hidden) {
        if (
            autoTimer > 0 &&
            game.status === 'ready' &&
            !$('help-dialog').open &&
            !$('overlay').children.length
        ) {
            autoTimer -= dt;
            if (autoTimer <= 0) {
                persist();
                game.startWave();
                refreshUI(true);
            }
        }
        if (game.status === 'playing') {
            accumulator += dt * speed;
            while (accumulator >= 1 / 60 && game.status === 'playing') {
                game.update(1 / 60);
                accumulator -= 1 / 60;
            }
        } else {
            // Discard leftover time while paused so resuming cannot jump ahead.
            accumulator = 0;
        }
        drainEvents();
        renderer.draw(game, selection, dt);
        uiTimer += dt;
        // The Canvas needs every frame; text counters only need a few refreshes/second.
        if (uiTimer > 0.15) {
            uiTimer = 0;
            refreshUI();
        }
    }
    requestAnimationFrame(frame);
}
// Draw the first screen and schedule the continuing animation loop.
showWelcome();
refreshUI(true);
renderer.draw(game, selection, 0);
requestAnimationFrame(frame);
