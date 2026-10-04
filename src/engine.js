// The simulation is independent of the browser so its rules can be tested directly.
// Coordinates use the 960 x 620 map; timers use seconds and speeds use pixels/second.
export const WIDTH = 960;
export const HEIGHT = 620;

// Each entry describes one outer layer. Popping it reveals the listed children.
// hp is that layer's health; reward is paid once when that layer is destroyed.
export const BALLOONS = {
    red: {
        name: 'Red',
        color: '#f26165',
        speed: 66,
        hp: 1,
        reward: 1,
        children: [],
        radius: 11,
    },
    blue: {
        name: 'Blue',
        color: '#58aaf1',
        speed: 78,
        hp: 1,
        reward: 1,
        children: ['red'],
        radius: 12,
    },
    green: {
        name: 'Green',
        color: '#6dd989',
        speed: 91,
        hp: 1,
        reward: 1,
        children: ['blue'],
        radius: 12,
    },
    yellow: {
        name: 'Yellow',
        color: '#f5d75b',
        speed: 116,
        hp: 1,
        reward: 1,
        children: ['green'],
        radius: 13,
    },
    pink: {
        name: 'Pink',
        color: '#f48cc8',
        speed: 135,
        hp: 1,
        reward: 1,
        children: ['yellow'],
        radius: 13,
    },
    black: {
        name: 'Black',
        color: '#35424e',
        speed: 96,
        hp: 1,
        reward: 1,
        children: ['pink', 'pink'],
        radius: 12,
    },
    white: {
        name: 'White',
        color: '#f5f1de',
        speed: 104,
        hp: 1,
        reward: 1,
        children: ['pink', 'pink'],
        radius: 12,
    },
    lead: {
        name: 'Lead',
        color: '#9ba7b0',
        speed: 62,
        hp: 4,
        reward: 3,
        children: ['black', 'black'],
        radius: 15,
        lead: true,
    },
    rainbow: {
        name: 'Rainbow',
        color: '#b490f0',
        speed: 105,
        hp: 1,
        reward: 1,
        children: ['black', 'white'],
        radius: 15,
    },
    ceramic: {
        name: 'Ceramic',
        color: '#c18a58',
        speed: 100,
        hp: 12,
        reward: 8,
        children: ['rainbow', 'rainbow'],
        radius: 17,
    },
    zeppelin: {
        name: 'Zeppelin',
        color: '#70b8e1',
        speed: 36,
        hp: 420,
        reward: 45,
        children: ['ceramic', 'ceramic', 'ceramic', 'ceramic'],
        radius: 31,
        boss: true,
    },
    dread: {
        name: 'Dreadnought',
        color: '#e77876',
        speed: 29,
        hp: 1100,
        reward: 100,
        children: ['zeppelin', 'zeppelin', 'zeppelin'],
        radius: 39,
        boss: true,
    },
    leviathan: {
        name: 'Leviathan',
        color: '#b29aee',
        speed: 24,
        hp: 2400,
        reward: 250,
        children: ['dread', 'dread'],
        radius: 49,
        boss: true,
    },
};
// Include every contained layer when calculating the cost of a full balloon escaping.
export function leakCost(type) {
    const b = BALLOONS[type];
    return (
        b.hp +
        b.children.reduce((sum, child) => {
            return sum + leakCost(child);
        }, 0)
    );
}
// Base duck stats and shop prices live here so balancing does not require UI changes.
// paths[0] is power; paths[1] is utility. Each path contains three purchasable tiers.
export const DUCKS = {
    basic: {
        name: 'Scout Duck',
        role: 'A steady wing. Piercing darts.',
        cost: 200,
        icon: '🦆',
        color: '#e9b84e',
        range: 137,
        cooldown: 0.58,
        damage: 1,
        pierce: 2,
        speed: 480,
        paths: [
            [
                {
                    name: 'Sharp Darts',
                    cost: 160,
                    description: '+1 damage and +1 pierce.',
                },
                {
                    name: 'Shatter Tips',
                    cost: 380,
                    description: '+2 damage. Breaks lead armor.',
                },
                {
                    name: 'Quackshot',
                    cost: 850,
                    description: '+3 damage, +3 pierce, shoots twice as fast.',
                },
            ],
            [
                {
                    name: 'Far Sight',
                    cost: 120,
                    description: '+35 range and +1 pierce.',
                },
                {
                    name: 'Spotter',
                    cost: 260,
                    description: 'Sees camo. +20 range and 20% faster fire.',
                },
                {
                    name: 'Ranger',
                    cost: 620,
                    description: '+35 range, +2 pierce, another 30% faster fire.',
                },
            ],
        ],
    },
    super: {
        name: 'Super Duck',
        role: 'Rapid fire. Unreasonable confidence.',
        cost: 950,
        icon: '⚡',
        color: '#79b9e9',
        range: 158,
        cooldown: 0.13,
        damage: 1,
        pierce: 1,
        speed: 680,
        paths: [
            [
                {
                    name: 'Twin Darts',
                    cost: 450,
                    description: '+1 damage and +1 pierce.',
                },
                {
                    name: 'Plasma Wings',
                    cost: 1000,
                    description: '+2 damage, +2 pierce. Melts lead.',
                },
                {
                    name: 'Sunbird',
                    cost: 2100,
                    description: '+4 damage, +3 pierce, 35% faster fire.',
                },
            ],
            [
                {
                    name: 'Horizon',
                    cost: 240,
                    description: '+45 range.',
                },
                {
                    name: 'Radar',
                    cost: 460,
                    description: 'Sees camo. +25 range and +1 pierce.',
                },
                {
                    name: 'Sky Captain',
                    cost: 1100,
                    description: '+40 range, 25% faster fire. Double damage to bosses.',
                },
            ],
        ],
    },
    magic: {
        name: 'Mage Duck',
        role: 'Seeking spells. Camo? What camo?',
        cost: 550,
        icon: '✦',
        color: '#b99bea',
        range: 145,
        cooldown: 0.72,
        damage: 2,
        pierce: 3,
        speed: 350,
        paths: [
            [
                {
                    name: 'Bright Sparks',
                    cost: 240,
                    description: '+2 spell damage and +1 pierce.',
                },
                {
                    name: 'Fireball',
                    cost: 580,
                    description: '+3 damage. Explodes in a 36px area.',
                },
                {
                    name: 'Archmage',
                    cost: 1300,
                    description: '+5 damage, bigger explosions, 30% faster spells.',
                },
            ],
            [
                {
                    name: 'Long Reach',
                    cost: 180,
                    description: '+35 range and faster spells.',
                },
                {
                    name: 'Frost Charm',
                    cost: 420,
                    description: 'Slows ordinary balloons by 35% for 1.5 seconds.',
                },
                {
                    name: 'Timekeeper',
                    cost: 950,
                    description:
                        '+30 range, 25% faster fire. Stronger slow affects bosses too.',
                },
            ],
        ],
    },
};

// Build fresh combat stats from a duck's type and purchased tiers.
// Recalculating avoids permanently modifying the shared base stats in DUCKS.
export function statsFor(tower) {
    const d = DUCKS[tower.type];
    // a and b are the number of upgrades bought on the power and utility paths.
    const [a, b] = tower.levels;
    const s = {
        range: d.range,
        cooldown: d.cooldown,
        damage: d.damage,
        pierce: d.pierce,
        speed: d.speed,
        camo: tower.type === 'magic',
        lead: tower.type === 'magic',
        splash: 0,
        slow: 0,
        bossMultiplier: 1,
        slowBoss: false,
        seeking: tower.type === 'magic',
    };
    // Tier bonuses stack: a tier-three duck keeps its tier-one and tier-two bonuses.
    // A smaller cooldown means faster firing; a slow of 0.65 means 65% normal speed.
    if (tower.type === 'basic') {
        if (a >= 1) {
            s.damage += 1;
            s.pierce += 1;
        }
        if (a >= 2) {
            s.damage += 2;
            s.lead = true;
        }
        if (a >= 3) {
            s.damage += 3;
            s.pierce += 3;
            s.cooldown *= 0.5;
        }
        if (b >= 1) {
            s.range += 35;
            s.pierce++;
        }
        if (b >= 2) {
            s.range += 20;
            s.camo = true;
            s.cooldown *= 0.8;
        }
        if (b >= 3) {
            s.range += 35;
            s.pierce += 2;
            s.cooldown *= 0.7;
        }
    } else if (tower.type === 'super') {
        if (a >= 1) {
            s.damage++;
            s.pierce++;
        }
        if (a >= 2) {
            s.damage += 2;
            s.pierce += 2;
            s.lead = true;
        }
        if (a >= 3) {
            s.damage += 4;
            s.pierce += 3;
            s.cooldown *= 0.65;
        }
        if (b >= 1) {
            s.range += 45;
        }
        if (b >= 2) {
            s.range += 25;
            s.camo = true;
            s.pierce++;
        }
        if (b >= 3) {
            s.range += 40;
            s.cooldown *= 0.75;
            s.bossMultiplier = 2;
        }
    } else {
        if (a >= 1) {
            s.damage += 2;
            s.pierce++;
        }
        if (a >= 2) {
            s.damage += 3;
            s.splash = 36;
        }
        if (a >= 3) {
            s.damage += 5;
            s.splash = 52;
            s.cooldown *= 0.7;
        }
        if (b >= 1) {
            s.range += 35;
            s.speed += 100;
        }
        if (b >= 2) {
            s.slow = 0.65;
        }
        if (b >= 3) {
            s.range += 30;
            s.cooldown *= 0.75;
            s.slow = 0.45;
            s.slowBoss = true;
        }
    }
    return s;
}

// Balloons enter and leave just outside the map so spawning looks natural.
// These control points also define the path drawn by the renderer.
const waypoints = [
    [-45, 125],
    [140, 125],
    [235, 195],
    [240, 320],
    [340, 424],
    [455, 420],
    [531, 326],
    [515, 223],
    [590, 141],
    [701, 165],
    [770, 264],
    [757, 374],
    [831, 453],
    [1005, 442],
];

// A Catmull-Rom curve turns the control points into a smooth series of short segments.
// Store cumulative distances so balloon speed stays consistent through the bends.
function samplePath(points) {
    const samples = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        for (let j = 0; j < 24; j++) {
            const t = j / 24;
            const blend = (k) => {
                return (
                    0.5 *
                    (2 * p1[k] +
                        (-p0[k] + p2[k]) * t +
                        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t +
                        (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)
                );
            };
            samples.push({
                x: blend(0),
                y: blend(1),
            });
        }
    }
    samples.push({
        x: points.at(-1)[0],
        y: points.at(-1)[1],
    });
    let distance = 0;
    samples.forEach((p, i) => {
        if (i) {
            distance += Math.hypot(p.x - samples[i - 1].x, p.y - samples[i - 1].y);
        }
        p.distance = distance;
    });
    return samples;
}
export const PATH = samplePath(waypoints);
export const PATH_LENGTH = PATH.at(-1).distance;

// Convert distance traveled into a map position and direction of movement.
export function pointOnPath(distance) {
    const d = Math.max(0, Math.min(PATH_LENGTH, distance));
    let lo = 0;
    let hi = PATH.length - 1;
    // Binary search finds the surrounding samples without scanning the entire path.
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (PATH[mid].distance < d) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    const a = PATH[Math.max(0, lo - 1)];
    const b = PATH[lo];
    const t = (d - a.distance) / (b.distance - a.distance || 1);
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        angle: Math.atan2(b.y - a.y, b.x - a.x),
    };
}
// Find the shortest distance from a point to a line segment.
// Used both to keep ducks off the path and to detect fast-moving projectile hits.
export function segmentDistance(x, y, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(
        0,
        Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)),
    );
    return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
}
// Return an explanation for an invalid spot, or an empty string for a valid one.
export function placementError(x, y, towers = []) {
    if (x < 26 || x > WIDTH - 26 || y < 54 || y > HEIGHT - 26) {
        return 'Keep your duck inside the meadow.';
    }
    if (
        PATH.some((p, i) => {
            return (
                i && segmentDistance(x, y, PATH[i - 1].x, PATH[i - 1].y, p.x, p.y) < 43
            );
        })
    ) {
        return 'Balloons need the path. Try the grass.';
    }
    // The pond is an ellipse. Leave a little extra space around its shoreline.
    if (((x - 122) / 155) ** 2 + ((y - 482) / 93) ** 2 < 1.15) {
        return 'Ducks are off duty in the pond. Try the grass.';
    }
    if (
        towers.some((t) => {
            return Math.hypot(t.x - x, t.y - y) < 43;
        })
    ) {
        return 'Give your flock a little room.';
    }
    return '';
}

// A wave group repeats one balloon type, with gap seconds between spawns.
const group = (type, count, gap = 0.65, options = {}) => {
    return {
        type,
        count,
        gap,
        ...options,
    };
};
// Wave numbers shown to players are 1-15; array indexes are 0-14.
// Camo, lead, ceramics, and bosses are introduced gradually through these groups.
export const WAVES = [
    {
        name: 'A gentle breeze',
        groups: [group('red', 22, 0.85)],
    },
    {
        name: 'Feeling blue',
        groups: [group('red', 12, 0.65), group('blue', 18, 0.7)],
    },
    {
        name: 'Greener pastures',
        groups: [group('blue', 18, 0.55), group('green', 18, 0.65)],
    },
    {
        name: 'Pick up the pace',
        groups: [group('green', 22, 0.5), group('yellow', 20, 0.6)],
    },
    {
        name: 'Tickled pink',
        groups: [group('yellow', 24, 0.5), group('pink', 24, 0.55)],
    },
    {
        name: 'Double trouble',
        groups: [group('black', 16, 0.8), group('white', 16, 0.8)],
    },
    {
        name: 'Hide and squeak',
        hint: 'Camo incoming. Mages see it; Scout Spotter and Super Radar do too.',
        groups: [
            group('pink', 22, 0.5),
            group('green', 22, 0.65, {
                camo: true,
            }),
        ],
    },
    {
        name: 'Heavy weather',
        hint: 'Lead armor! Use a Mage, Shatter Tips, or Plasma Wings.',
        groups: [
            group('lead', 16, 0.95),
            group('yellow', 28, 0.4),
            group('black', 18, 0.7),
        ],
    },
    {
        name: 'All the colors',
        groups: [
            group('rainbow', 20, 0.95),
            group('pink', 24, 0.45, {
                regrow: true,
            }),
            group('blue', 18, 0.5, {
                camo: true,
            }),
        ],
    },
    {
        name: 'Shell shock',
        hint: 'Ceramics have tough shells and lots of balloons inside.',
        groups: [
            group('ceramic', 14, 1.2),
            group('lead', 20, 0.75),
            group('white', 22, 0.5, {
                camo: true,
            }),
        ],
    },
    {
        name: 'Wild garden',
        groups: [
            group('rainbow', 26, 0.65, {
                regrow: true,
            }),
            group('ceramic', 18, 0.9),
            group('pink', 28, 0.4, {
                camo: true,
            }),
        ],
    },
    {
        name: 'The gathering storm',
        groups: [
            group('ceramic', 26, 0.8),
            group('rainbow', 22, 0.65, {
                camo: true,
            }),
            group('lead', 16, 0.75, {
                camo: true,
            }),
        ],
    },
    {
        name: 'Something in the sky',
        hint: 'Zeppelins! Focus your strongest ducks on their 420 HP hulls.',
        groups: [
            group('zeppelin', 1, 2),
            group('ceramic', 18, 0.8),
            group('zeppelin', 1, 2),
            group('rainbow', 20, 0.6),
        ],
    },
    {
        name: 'Red sky at duck time',
        hint: 'A 1,100 HP Dreadnought carries three Zeppelins. Upgrade your damage.',
        groups: [
            group('dread', 1, 2),
            group('ceramic', 24, 0.65, {
                camo: true,
            }),
            group('zeppelin', 2, 5),
            group('rainbow', 20, 0.5, {
                regrow: true,
            }),
        ],
    },
    {
        name: 'The last quack',
        hint: 'The Leviathan has 2,400 HP and two Dreadnoughts inside. Hold the pond!',
        groups: [
            group('leviathan', 1, 3),
            group('ceramic', 25, 0.6, {
                camo: true,
            }),
            group('dread', 2, 9),
            group('rainbow', 25, 0.5, {
                camo: true,
                regrow: true,
            }),
        ],
    },
];
// Expand the compact wave groups into individual, timed spawn instructions.
export function waveSchedule(wave) {
    const entries = [];
    let time = 0.5;
    for (const g of WAVES[wave - 1].groups) {
        for (let i = 0; i < g.count; i++) {
            entries.push({
                at: time,
                type: g.type,
                camo: !!g.camo,
                regrow: !!g.regrow,
            });
            time += g.gap;
        }
        // Give each new group a short breathing space before it starts arriving.
        time += 1.5;
    }
    return entries;
}

// Own all gameplay state. The UI asks this class to act and reads its event queue.
// Status moves between ready, playing, paused, won, and lost.
export class Game {
    constructor() {
        this.reset();
    }

    // Clear the previous campaign and restore the starting economy and lives.
    reset() {
        this.lives = 100;
        this.money = 650;
        this.wave = 0;
        this.status = 'ready';
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.events = [];
        this.pops = 0;
        this.elapsed = 0;
        this.nextId = 1;
        this.spawned = 0;
        this.schedule = [];
        this.waveTime = 0;
    }

    // Queue feedback for menus, sounds, and animation without touching browser APIs.
    emit(kind, data = {}) {
        this.events.push({
            kind,
            ...data,
        });
    }

    // Validate the spot and budget before charging the player or creating a duck.
    place(type, x, y) {
        if (!DUCKS[type] || ['lost', 'won'].includes(this.status)) {
            return null;
        }
        const error = placementError(x, y, this.towers);
        if (error) {
            this.emit('message', {
                text: error,
            });
            return null;
        }
        if (this.money < DUCKS[type].cost) {
            this.emit('message', {
                text: 'A few more coins, then this duck is yours.',
            });
            return null;
        }
        // invested tracks the original purchase plus upgrades for the sell refund.
        const tower = {
            id: this.nextId++,
            type,
            x,
            y,
            levels: [0, 0],
            cooldown: 0,
            angle: -Math.PI / 2,
            invested: DUCKS[type].cost,
            pops: 0,
            target: 'first',
            flash: 0,
        };
        this.money -= tower.invested;
        this.towers.push(tower);
        this.emit('build', {
            x,
            y,
        });
        return tower;
    }

    // Buy only the next unowned tier on the requested path; reject unaffordable purchases.
    upgrade(id, path) {
        if (
            !Number.isInteger(path) ||
            path < 0 ||
            path > 1 ||
            ['lost', 'won'].includes(this.status)
        ) {
            return false;
        }
        const t = this.towers.find((t) => {
            return t.id === id;
        });
        if (!t) {
            return false;
        }
        const u = DUCKS[t.type].paths[path][t.levels[path]];
        if (!u || this.money < u.cost) {
            return false;
        }
        this.money -= u.cost;
        t.invested += u.cost;
        t.levels[path]++;
        this.emit('upgrade', {
            x: t.x,
            y: t.y,
        });
        return true;
    }

    // Recall a duck and return 70% of its total investment, rounded down.
    sell(id) {
        if (['lost', 'won'].includes(this.status)) {
            return 0;
        }
        const t = this.towers.find((t) => {
            return t.id === id;
        });
        if (!t) {
            return 0;
        }
        // Using 7/10 avoids decimal rounding errors such as 360 * 0.7 becoming 251.999.
        const value = Math.floor((t.invested * 7) / 10);
        this.money += value;
        this.towers = this.towers.filter((t) => {
            return t.id !== id;
        });
        this.emit('sell', {
            x: t.x,
            y: t.y,
        });
        return value;
    }

    // Prepare the next schedule. A second wave cannot start during an active one.
    startWave() {
        if (this.status !== 'ready' || this.wave >= 15) {
            return false;
        }
        this.wave++;
        this.status = 'playing';
        this.waveTime = 0;
        this.spawned = 0;
        this.schedule = waveSchedule(this.wave);
        this.emit('wave', {
            wave: this.wave,
            text: WAVES[this.wave - 1].hint || WAVES[this.wave - 1].name,
        });
        return true;
    }

    // Pausing stops simulation updates, while the UI can still buy and upgrade ducks.
    togglePause() {
        if (this.status === 'playing') {
            this.status = 'paused';
        } else if (this.status === 'paused') {
            this.status = 'playing';
        }
    }

    // New arrivals start at distance zero; split children start near their parent.
    spawn(type, progress = 0, options = {}) {
        const e = {
            id: this.nextId++,
            type,
            health: BALLOONS[type].hp,
            progress,
            camo: !!options.camo,
            regrow: !!options.regrow,
            regrowMax: options.regrowMax || type,
            paid: options.paid ? [...options.paid] : [],
            sinceHit: 0,
            regrowClock: 0,
            slow: options.slow || 1,
            slowTime: options.slowTime || 0,
            dead: false,
            ...pointOnPath(progress),
        };
        this.enemies.push(e);
        return e;
    }

    // Apply one attack to a balloon, including immunity, slowing, layers, and rewards.
    // e is the enemy; tower is optional so tests can apply damage without a duck.
    damage(e, amount, attack, tower) {
        if (
            e.dead ||
            (e.camo && !attack.camo) ||
            (BALLOONS[e.type].lead && !attack.lead)
        ) {
            return false;
        }
        // A successful hit delays regrowth. Ordinary slows cannot affect boss hulls.
        e.sinceHit = 0;
        e.regrowClock = 0;
        if (attack.slow && (!BALLOONS[e.type].boss || attack.slowBoss)) {
            e.slowTime = 1.5;
            e.slow = Math.min(e.slow, attack.slow);
        }
        if (BALLOONS[e.type].boss) {
            amount *= attack.bossMultiplier || 1;
        }
        // Spare damage carries into the next color layer of the same balloon.
        while (amount > 0 && !e.dead) {
            const def = BALLOONS[e.type];
            if (def.lead && !attack.lead) {
                break;
            }
            const hit = Math.min(e.health, amount);
            e.health -= hit;
            amount -= hit;
            if (e.health > 0) {
                break;
            }
            // Regrown layers never mint additional money or inflate the pop count.
            if (!e.paid.includes(e.type)) {
                this.money += def.reward;
                this.pops++;
                if (tower) {
                    tower.pops++;
                }
                e.paid.push(e.type);
            }
            this.emit('pop', {
                x: e.x,
                y: e.y,
                color: def.color,
                boss: !!def.boss,
            });
            if (def.children.length === 1) {
                e.type = def.children[0];
                e.health = BALLOONS[e.type].hp;
            } else {
                e.dead = true;
                // Splitting replaces the parent with independent children. Preserve
                // camo and any active slowing, with small gaps to avoid perfect overlap.
                def.children.forEach((child, i) => {
                    return this.spawn(child, Math.max(0, e.progress - i * 7), {
                        camo: e.camo,
                        regrow: e.regrow && !BALLOONS[child].boss,
                        regrowMax: child,
                        slow: e.slow,
                        slowTime: e.slowTime,
                    });
                });
            }
        }
        return true;
    }

    // t is the duck and s is its calculated stats. Ignore unreachable or immune enemies.
    // Greater progress means closer to the exit; strongest uses full layered health.
    chooseTarget(t, s) {
        const candidates = this.enemies.filter((e) => {
            return (
                !e.dead &&
                (!e.camo || s.camo) &&
                (!BALLOONS[e.type].lead || s.lead) &&
                Math.hypot(e.x - t.x, e.y - t.y) <= s.range
            );
        });
        if (t.target === 'last') {
            candidates.sort((a, b) => {
                return a.progress - b.progress;
            });
        } else if (t.target === 'strong') {
            candidates.sort((a, b) => {
                return leakCost(b.type) - leakCost(a.type) || b.progress - a.progress;
            });
        } else if (t.target === 'close') {
            candidates.sort((a, b) => {
                return (
                    Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y)
                );
            });
        } else {
            candidates.sort((a, b) => {
                return b.progress - a.progress;
            });
        }
        return candidates[0];
    }

    // Advance the simulation by dt seconds: spawn, move, fire, collide, then finish waves.
    // main.js normally calls this in fixed 1/60-second steps.
    update(dt) {
        if (this.status !== 'playing') {
            return;
        }
        // Limit unusually large steps so lag cannot make shots skip across the map.
        dt = Math.max(0, Math.min(0.05, dt));
        this.elapsed += dt;
        this.waveTime += dt;
        // Spawn every scheduled arrival whose time has been reached this update.
        while (
            this.spawned < this.schedule.length &&
            this.schedule[this.spawned].at <= this.waveTime
        ) {
            const spawn = this.schedule[this.spawned++];
            this.spawn(spawn.type, 0, spawn);
        }
        // Update temporary effects, regrowth, movement, and escaped-balloon life loss.
        for (const e of this.enemies) {
            if (e.dead) {
                continue;
            }
            e.sinceHit += dt;
            e.slowTime -= dt;
            if (e.slowTime <= 0) {
                e.slow = 1;
            }
            // After 2.8 seconds without damage, restore one color layer each second.
            // Never regrow past the balloon's original color tier.
            if (e.regrow && e.sinceHit > 2.8) {
                e.regrowClock += dt;
                if (e.regrowClock >= 1) {
                    e.regrowClock = 0;
                    const colors = ['red', 'blue', 'green', 'yellow', 'pink'];
                    const index = colors.indexOf(e.type);
                    const max = colors.indexOf(e.regrowMax);
                    if (index >= 0 && index < max) {
                        e.type = colors[index + 1];
                        e.health = BALLOONS[e.type].hp;
                    }
                }
            }
            e.progress +=
                BALLOONS[e.type].speed * (1 + (this.wave - 1) * 0.016) * e.slow * dt;
            Object.assign(e, pointOnPath(e.progress));
            if (e.progress >= PATH_LENGTH) {
                e.dead = true;
                // Partially damaged armor costs its remaining HP plus all its children.
                const cost =
                    e.health +
                    BALLOONS[e.type].children.reduce((sum, child) => {
                        return sum + leakCost(child);
                    }, 0);
                this.lives = Math.max(0, this.lives - cost);
                this.emit('leak', {
                    amount: cost,
                    x: WIDTH - 15,
                    y: e.y,
                });
                if (this.lives <= 0) {
                    this.status = 'lost';
                    this.emit('lost');
                    return;
                }
            }
        }
        // Ducks choose targets and launch projectiles when their cooldown expires.
        for (const t of this.towers) {
            t.flash = Math.max(0, t.flash - dt);
            t.cooldown -= dt;
            const s = statsFor(t);
            const target = this.chooseTarget(t, s);
            if (!target) {
                t.cooldown = Math.max(0, t.cooldown);
                continue;
            }
            t.angle = Math.atan2(target.y - t.y, target.x - t.x);
            if (t.cooldown <= 0) {
                t.cooldown += s.cooldown;
                t.flash = 0.1;
                this.projectiles.push({
                    id: this.nextId++,
                    x: t.x,
                    y: t.y,
                    vx: Math.cos(t.angle) * s.speed,
                    vy: Math.sin(t.angle) * s.speed,
                    targetId: target.id,
                    towerId: t.id,
                    type: t.type,
                    stats: s,
                    pierce: s.pierce,
                    // A projectile must not charge pierce or deal damage twice to one ID.
                    hit: new Set(),
                    life: s.range / s.speed + 0.45,
                });
                this.emit('shoot', {
                    type: t.type,
                });
            }
        }
        // Darts keep their launch direction; seeking spells steer toward a live target.
        for (const p of this.projectiles) {
            p.life -= dt;
            if (p.life <= 0 || p.pierce <= 0) {
                continue;
            }
            const target = this.enemies.find((e) => {
                return e.id === p.targetId && !e.dead;
            });
            if (p.stats.seeking && target) {
                const angle = Math.atan2(target.y - p.y, target.x - p.x);
                p.vx = Math.cos(angle) * p.stats.speed;
                p.vy = Math.sin(angle) * p.stats.speed;
            }
            const ox = p.x;
            const oy = p.y;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            // Test the entire traveled segment instead of just the new position.
            // Snapshot the candidates so splitting cannot add more direct hits this step.
            const collisions = this.enemies
                .filter((e) => {
                    return (
                        !e.dead &&
                        !p.hit.has(e.id) &&
                        segmentDistance(e.x, e.y, ox, oy, p.x, p.y) <
                            BALLOONS[e.type].radius + 3
                    );
                })
                .sort((a, b) => {
                    return (
                        Math.hypot(a.x - ox, a.y - oy) - Math.hypot(b.x - ox, b.y - oy)
                    );
                });
            const tower = this.towers.find((t) => {
                return t.id === p.towerId;
            });
            for (const e of collisions) {
                if (p.pierce <= 0) {
                    break;
                }
                p.hit.add(e.id);
                if (this.damage(e, p.stats.damage, p.stats, tower)) {
                    p.pierce--;
                    // Fireballs share the normal immunity rules and limit extra victims
                    // to their pierce stat. They disappear after the explosion.
                    if (p.stats.splash) {
                        const neighbors = this.enemies.filter((n) => {
                            return (
                                !n.dead &&
                                !p.hit.has(n.id) &&
                                Math.hypot(n.x - e.x, n.y - e.y) <= p.stats.splash
                            );
                        });
                        for (const n of neighbors.slice(0, p.stats.pierce)) {
                            p.hit.add(n.id);
                            this.damage(n, p.stats.damage, p.stats, tower);
                        }
                        this.emit('blast', {
                            x: e.x,
                            y: e.y,
                            radius: p.stats.splash,
                        });
                        p.pierce = 0;
                    }
                }
            }
        }
        // Remove defeated enemies and spent or off-map projectiles before the next step.
        this.enemies = this.enemies.filter((e) => {
            return !e.dead;
        });
        this.projectiles = this.projectiles.filter((p) => {
            return (
                p.life > 0 &&
                p.pierce > 0 &&
                p.x > -30 &&
                p.x < WIDTH + 30 &&
                p.y > -30 &&
                p.y < HEIGHT + 30
            );
        });
        // A wave ends only after all scheduled arrivals and all split children are gone.
        if (this.spawned === this.schedule.length && this.enemies.length === 0) {
            const bonus = 85 + this.wave * 15;
            this.money += bonus;
            this.projectiles = [];
            this.status = this.wave === 15 ? 'won' : 'ready';
            this.emit('complete', {
                wave: this.wave,
                bonus,
            });
            if (this.status === 'won') {
                this.emit('won');
            }
        }
    }

    // Save only the preparation stage, never a partly played wave.
    // Clone the level arrays so later upgrades cannot alter an existing checkpoint.
    serialize() {
        if (this.status !== 'ready') {
            return null;
        }
        return {
            version: 1,
            lives: this.lives,
            money: this.money,
            wave: this.wave,
            pops: this.pops,
            elapsed: this.elapsed,
            nextId: this.nextId,
            towers: this.towers.map((t) => {
                return {
                    ...t,
                    levels: [...t.levels],
                };
            }),
        };
    }

    // Validate an entire saved campaign before replacing the current game.
    restore(data) {
        if (
            !data ||
            data.version !== 1 ||
            !Number.isInteger(data.wave) ||
            data.wave < 0 ||
            data.wave > 14 ||
            !Number.isFinite(data.lives) ||
            data.lives <= 0 ||
            data.lives > 100 ||
            !Number.isFinite(data.money) ||
            data.money < 0 ||
            !Array.isArray(data.towers) ||
            data.towers.length > 100
        ) {
            return false;
        }
        const towers = [];
        for (const t of data.towers) {
            if (
                !t ||
                !DUCKS[t.type] ||
                !Array.isArray(t.levels) ||
                t.levels.length !== 2 ||
                t.levels.some((l) => {
                    return !Number.isInteger(l) || l < 0 || l > 3;
                }) ||
                !Number.isInteger(t.id) ||
                t.id < 1 ||
                towers.some((n) => {
                    return n.id === t.id;
                }) ||
                placementError(t.x, t.y, towers) ||
                !Number.isFinite(t.x) ||
                !Number.isFinite(t.y)
            ) {
                return false;
            }
            // Rebuild sell value from known prices rather than trusting the saved amount.
            const invested =
                DUCKS[t.type].cost +
                t.levels.reduce((sum, level, p) => {
                    return (
                        sum +
                        DUCKS[t.type].paths[p].slice(0, level).reduce((s, u) => {
                            return s + u.cost;
                        }, 0)
                    );
                }, 0);
            towers.push({
                ...t,
                invested,
                cooldown: 0,
                flash: 0,
                angle: Number.isFinite(t.angle) ? t.angle : 0,
                pops: Number.isFinite(t.pops) ? Math.max(0, t.pops) : 0,
                target: ['first', 'last', 'strong', 'close'].includes(t.target)
                    ? t.target
                    : 'first',
            });
        }
        // All validation passed: now install the restored preparation-stage state.
        this.reset();
        this.lives = data.lives;
        this.money = data.money;
        this.wave = data.wave;
        this.towers = towers;
        this.nextId = Math.max(
            1,
            ...towers.map((t) => {
                return t.id + 1;
            }),
        );
        this.pops = Number.isFinite(data.pops) ? Math.max(0, data.pops) : 0;
        this.elapsed = Number.isFinite(data.elapsed) ? Math.max(0, data.elapsed) : 0;
        return true;
    }
}
