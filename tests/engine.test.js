// Test game rules directly, without a browser or Canvas.
// Run with: node --test tests/engine.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
    Game,
    DUCKS,
    BALLOONS,
    WAVES,
    PATH_LENGTH,
    pointOnPath,
    placementError,
    statsFor,
    leakCost,
    waveSchedule,
} from '../src/engine.js';

// An unrestricted test attack isolates layer damage from camo and lead immunity.
const attack = {
    camo: true,
    lead: true,
    bossMultiplier: 1,
};

// Simulate elapsed game time at the same fixed step used by the browser controller.
// Discard feedback events because these tests check state, not sound or animation.
function advance(game, seconds) {
    for (let i = 0; i < seconds * 60; i++) {
        game.update(1 / 60);
        game.events = [];
    }
}
test('Exactly 15 valid waves, with bosses first appearing in wave 13', () => {
    assert.equal(WAVES.length, 15);
    WAVES.forEach((wave, i) => {
        assert.ok(wave.groups.length);
        for (const group of wave.groups) {
            assert.ok(BALLOONS[group.type]);
            assert.ok(group.count > 0);
            if (i < 12) {
                assert.ok(!BALLOONS[group.type].boss);
            }
        }
        const schedule = waveSchedule(i + 1);
        assert.equal(
            schedule.length,
            wave.groups.reduce((n, g) => {
                return n + g.count;
            }, 0),
        );
        assert.ok(
            schedule.every((s, j) => {
                return !j || s.at > schedule[j - 1].at;
            }),
        );
    });
    assert.ok(
        WAVES[12].groups.some((g) => {
            return g.type === 'zeppelin';
        }),
    );
    assert.ok(
        WAVES[13].groups.some((g) => {
            return g.type === 'dread';
        }),
    );
    assert.ok(
        WAVES[14].groups.some((g) => {
            return g.type === 'leviathan';
        }),
    );
});
test('Placement respects path, pond, map bounds, spacing, and available money', () => {
    const g = new Game();
    assert.equal(g.money, 650);
    assert.equal(g.lives, 100);
    assert.ok(placementError(100, 125));
    assert.ok(placementError(122, 482));
    assert.ok(placementError(0, 0));
    assert.equal(g.place('super', 360, 280), null);
    const t = g.place('basic', 170, 230);
    assert.ok(t);
    assert.equal(g.money, 450);
    assert.equal(g.place('basic', 180, 235), null);
    assert.equal(g.place('basic', 100, 125), null);
    assert.equal(g.money, 450);
});
test('Upgrades change stats; both paths have three tiers; selling returns 70%', () => {
    for (const type of Object.keys(DUCKS)) {
        const g = new Game();
        g.money = 20000;
        const t = g.place(type, 360, 280);
        const before = statsFor(t);
        for (let path = 0; path < 2; path++) {
            for (let tier = 0; tier < 3; tier++) {
                assert.equal(g.upgrade(t.id, path), true);
            }
        }
        assert.equal(g.upgrade(t.id, 0), false);
        assert.equal(g.upgrade(t.id, 2), false);
        const after = statsFor(t);
        assert.ok(after.range > before.range);
        assert.ok(after.damage > before.damage);
        assert.ok(after.cooldown < before.cooldown);
        assert.ok(after.camo && after.lead);
        const expected = Math.floor((t.invested * 7) / 10);
        const beforeSell = g.money;
        assert.equal(g.sell(t.id), expected);
        assert.equal(g.money, beforeSell + expected);
        assert.equal(g.towers.length, 0);
    }
});
test('Layered damage earns money and multi-child balloons split', () => {
    const g = new Game();
    const e = g.spawn('green', 500);
    const before = g.money;
    g.damage(e, 2, attack);
    assert.equal(e.type, 'red');
    assert.equal(g.money, before + 2);
    assert.equal(e.dead, false);
    g.damage(e, 1, attack);
    assert.equal(e.dead, true);
    assert.equal(g.money, before + 3);
    const b = g.spawn('black', 500);
    g.damage(b, 100, attack);
    assert.equal(b.dead, true);
    assert.equal(
        g.enemies.filter((e) => {
            return !e.dead && e.type === 'pink';
        }).length,
        2,
    );
});
test('Camo and lead resist unequipped ducks; magic can damage both', () => {
    const g = new Game();
    const e = g.spawn('lead', 500, {
        camo: true,
    });
    const before = e.health;
    assert.equal(
        g.damage(e, 4, {
            camo: false,
            lead: true,
        }),
        false,
    );
    assert.equal(
        g.damage(e, 4, {
            camo: true,
            lead: false,
        }),
        false,
    );
    assert.equal(e.health, before);
    const magic = statsFor({
        type: 'magic',
        levels: [0, 0],
    });
    assert.equal(g.damage(e, 2, magic), true);
    assert.equal(e.health, 2);
    const t = g.place('basic', 360, 280);
    assert.equal(g.chooseTarget(t, statsFor(t)), undefined);
});
test('Boss hulls release their listed children and strong attacks scale correctly', () => {
    const g = new Game();
    const e = g.spawn('dread', 500);
    g.damage(e, 550, {
        ...attack,
        bossMultiplier: 2,
    });
    assert.equal(e.dead, true);
    assert.equal(
        g.enemies.filter((e) => {
            return !e.dead && e.type === 'zeppelin';
        }).length,
        3,
    );
    assert.equal(leakCost('red'), 1);
    assert.equal(leakCost('pink'), 5);
    assert.equal(leakCost('zeppelin'), 652);
});
test('Leaking layers deduct remaining health; a boss leak ends the game', () => {
    const g = new Game();
    g.startWave();
    g.schedule = [];
    const e = g.spawn('lead', PATH_LENGTH - 1);
    e.health = 2;
    advance(g, 1);
    assert.equal(g.lives, 100 - (2 + 2 * leakCost('black')));
    const h = new Game();
    h.startWave();
    h.schedule = [];
    h.spawn('zeppelin', PATH_LENGTH - 1);
    advance(h, 1);
    assert.equal(h.lives, 0);
    assert.equal(h.status, 'lost');
});
test('Regrow reconstructs color layers without paying for a second pop', () => {
    const g = new Game();
    g.startWave();
    g.schedule = [
        {
            at: 10000,
            type: 'red',
        },
    ];
    const e = g.spawn('pink', 400, {
        regrow: true,
    });
    g.damage(e, 3, attack);
    assert.equal(e.type, 'blue');
    const money = g.money;
    advance(g, 4);
    assert.equal(e.type, 'green');
    g.damage(e, 1, attack);
    assert.equal(e.type, 'blue');
    assert.equal(g.money, money);
});
test('First, last, strongest, and closest target priority select correctly', () => {
    const g = new Game();
    const t = g.place('magic', 360, 280);
    const s = {
        ...statsFor(t),
        range: 5000,
    };
    const a = g.spawn('red', 300);
    const b = g.spawn('blue', 600);
    const c = g.spawn('ceramic', 450);
    t.target = 'first';
    assert.equal(g.chooseTarget(t, s).id, b.id);
    t.target = 'last';
    assert.equal(g.chooseTarget(t, s).id, a.id);
    t.target = 'strong';
    assert.equal(g.chooseTarget(t, s).id, c.id);
    t.target = 'close';
    const nearest = [a, b, c].sort((a, b) => {
        return Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y);
    })[0];
    assert.equal(g.chooseTarget(t, s).id, nearest.id);
});
test('Pause freezes combat; an empty wave awards one bonus exactly once', () => {
    const g = new Game();
    g.startWave();
    g.togglePause();
    const elapsed = g.waveTime;
    advance(g, 2);
    assert.equal(g.waveTime, elapsed);
    g.togglePause();
    g.schedule = [];
    const money = g.money;
    advance(g, 1);
    assert.equal(g.status, 'ready');
    assert.equal(g.money, money + 100);
    advance(g, 1);
    assert.equal(g.money, money + 100);
});
test('Autosave restores an honest ready-state checkpoint and rejects corrupt records', () => {
    const g = new Game();
    const t = g.place('basic', 170, 230);
    g.upgrade(t.id, 0);
    const save = g.serialize();
    const h = new Game();
    assert.equal(h.restore(JSON.parse(JSON.stringify(save))), true);
    assert.equal(h.money, g.money);
    assert.deepEqual(h.towers[0].levels, [1, 0]);
    assert.equal(h.status, 'ready');
    assert.equal(
        h.restore({
            ...save,
            wave: 15,
        }),
        false,
    );
    assert.equal(
        h.restore({
            ...save,
            money: NaN,
        }),
        false,
    );
    assert.equal(
        h.restore({
            ...save,
            towers: [
                {
                    ...t,
                    x: 100,
                    y: 125,
                },
            ],
        }),
        false,
    );
    assert.equal(
        h.restore({
            ...save,
            towers: [null],
        }),
        false,
    );
    assert.equal(g.sell(t.id), 252);
    g.startWave();
    assert.equal(g.serialize(), null);
    assert.equal(
        h.restore({
            ...save,
            towers: [
                {
                    ...t,
                    invested: 999999,
                },
            ],
        }),
        true,
    );
    assert.equal(h.towers[0].invested, 360);
});
test('A fully equipped flock can complete all 15 waves and reach victory', () => {
    // Extra starting money isolates wave progression from the separate economy test.
    const g = new Game();
    g.money = 50000;
    for (const [type, x, y] of [
        ['basic', 170, 230],
        ['magic', 360, 280],
        ['super', 650, 285],
        ['super', 450, 190],
        ['magic', 635, 390],
    ]) {
        const t = g.place(type, x, y);
        assert.ok(t);
        for (let p = 0; p < 2; p++) {
            for (let n = 0; n < 3; n++) {
                g.upgrade(t.id, p);
            }
        }
    }
    for (let wave = 1; wave <= 15; wave++) {
        assert.equal(g.startWave(), true);
        for (let i = 0; i < 180 * 60 && g.status === 'playing'; i++) {
            g.update(1 / 60);
            g.events = [];
        }
        assert.equal(g.wave, wave);
        assert.equal(g.status, wave === 15 ? 'won' : 'ready', `wave ${wave}`);
    }
    assert.equal(g.lives, 100);
    assert.ok(g.pops > 1000);
    assert.equal(g.startWave(), false);
});
test('An affordable opening defense clears the early waves', () => {
    const g = new Game();
    const t = g.place('basic', 170, 230);
    g.upgrade(t.id, 0);
    g.upgrade(t.id, 1);
    for (let wave = 1; wave <= 4; wave++) {
        g.startWave();
        advance(g, 100);
        assert.equal(g.status, 'ready', `wave ${wave}`);
    }
    assert.ok(g.lives >= 90);
    assert.ok(g.money > 650);
});
test('An economy-limited strategy can earn every purchase and win the campaign', () => {
    // This test uses the real 650-coin starting budget and earns every later purchase.
    const g = new Game();
    const flock = [g.place('basic', 170, 230)];
    g.upgrade(flock[0].id, 0);
    g.upgrade(flock[0].id, 1);
    // Each purchase waits until the previous waves have actually funded it.
    const plan = [
        ['upgrade', 0, 1],
        ['upgrade', 0, 0],
        ['place', 'magic', 360, 280],
        ['upgrade', 1, 0],
        ['upgrade', 1, 1],
        ['upgrade', 1, 0],
        ['upgrade', 0, 1],
        ['upgrade', 0, 0],
        ['place', 'super', 650, 285],
        ['upgrade', 2, 1],
        ['upgrade', 2, 0],
        ['upgrade', 2, 0],
        ['upgrade', 2, 1],
        ['upgrade', 2, 1],
        ['upgrade', 1, 1],
        ['upgrade', 1, 0],
        ['upgrade', 1, 1],
        ['upgrade', 2, 0],
    ];
    for (let wave = 1; wave <= 15; wave++) {
        while (plan.length) {
            const [action, a, b, c] = plan[0];
            if (action === 'place') {
                const t = g.place(a, b, c);
                if (!t) {
                    break;
                }
                flock.push(t);
            } else if (!g.upgrade(flock[a].id, b)) {
                break;
            }
            plan.shift();
        }
        assert.ok(g.money >= 0);
        g.startWave();
        advance(g, 180);
        assert.equal(g.status, wave === 15 ? 'won' : 'ready', `wave ${wave}`);
    }
    assert.equal(plan.length, 0);
    assert.equal(g.lives, 100);
    assert.equal(flock.length, 3);
});
test('Frost slows split children and boss slowing requires Timekeeper', () => {
    const g = new Game();
    const e = g.spawn('black', 400);
    g.damage(e, 1, {
        ...attack,
        slow: 0.65,
    });
    const children = g.enemies.filter((n) => {
        return !n.dead;
    });
    assert.ok(
        children.every((n) => {
            return n.slow === 0.65 && n.slowTime === 1.5;
        }),
    );
    const boss = g.spawn('zeppelin', 400);
    g.damage(boss, 1, {
        ...attack,
        slow: 0.65,
    });
    assert.equal(boss.slow, 1);
    g.damage(boss, 1, {
        ...attack,
        slow: 0.45,
        slowBoss: true,
    });
    assert.equal(boss.slow, 0.45);
});
test('Path interpolation gives finite in-bounds endpoints', () => {
    assert.ok(PATH_LENGTH > 1000);
    for (let d = 0; d < PATH_LENGTH; d += 11) {
        const p = pointOnPath(d);
        assert.ok(
            Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.angle),
        );
    }
    assert.deepEqual(pointOnPath(-100), pointOnPath(0));
    assert.deepEqual(pointOnPath(PATH_LENGTH + 100), pointOnPath(PATH_LENGTH));
});
