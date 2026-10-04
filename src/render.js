// Draw the game with Canvas shapes; no external character or map images are needed.
// c means the Canvas drawing context; t is a duck, e an enemy, p a projectile,
// and f a temporary visual effect. Gameplay decisions belong in engine.js.
import { WIDTH, HEIGHT, PATH, BALLOONS, statsFor, placementError } from './engine.js';

// Small drawing helpers keep repeated shape setup out of the character code.
function ellipse(c, x, y, rx, ry, fill, angle = 0) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
    c.fillStyle = fill;
    c.fill();
}

function line(c, points, color, width) {
    c.beginPath();
    points.forEach((p, i) => {
        return i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y);
    });
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke();
}

function rounded(c, x, y, w, h, r, fill) {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
    c.fillStyle = fill;
    c.fill();
}

// save/restore confines translation, scaling, and drawing styles to this decoration.
function tree(c, x, y, size = 1) {
    c.save();
    c.translate(x, y);
    c.scale(size, size);
    ellipse(c, 7, 16, 29, 11, '#415a3530');
    rounded(c, -4, 0, 8, 25, 3, '#876c45');
    ellipse(c, -9, -5, 21, 23, '#536f43');
    ellipse(c, 10, -11, 23, 25, '#5e7e48');
    ellipse(c, -3, -22, 22, 22, '#709052');
    ellipse(c, -8, -29, 12, 8, '#819b5c');
    c.restore();
}

function rock(c, x, y, s = 1) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    ellipse(c, 1, 4, 14, 8, '#344f3122');
    c.beginPath();
    c.moveTo(-12, 4);
    c.lineTo(-9, -7);
    c.lineTo(3, -12);
    c.lineTo(12, -4);
    c.lineTo(14, 4);
    c.closePath();
    c.fillStyle = '#a4ac8f';
    c.fill();
    line(
        c,
        [
            {
                x: -8,
                y: -6,
            },
            {
                x: 2,
                y: -10,
            },
            {
                x: 9,
                y: -4,
            },
        ],
        '#c2c9a6',
        2,
    );
    c.restore();
}
// Draw at the duck's map position, or scale the same avatar for a menu portrait.
// Upgrade tiers choose hats, goggles, robes, capes, and weapon colors.
export function drawDuck(c, t, size = 1) {
    c.save();
    c.translate(t.x, t.y);
    c.scale(size, size);
    // a is the power tier; b is the utility tier, matching engine.statsFor().
    const [a, b] = t.levels || [0, 0];
    const type = t.type;
    const angle = t.angle || 0;
    ellipse(c, 0, 17, 21, 7, '#1d3e3540');
    // Capes and robes change with purchased tiers.
    if (type === 'super') {
        c.beginPath();
        c.moveTo(-9, -2);
        c.lineTo(-26, 20);
        c.lineTo(1, 15);
        c.closePath();
        c.fillStyle = a >= 3 ? '#f5bb43' : '#e87766';
        c.fill();
    }
    if (type === 'magic') {
        ellipse(c, 0, 6, 19, 18, a >= 3 ? '#dfc96b' : '#8670be');
        line(
            c,
            [
                {
                    x: -13,
                    y: 17,
                },
                {
                    x: 12,
                    y: 17,
                },
            ],
            a >= 3 ? '#fff0a4' : '#b6a1dc',
            3,
        );
    }
    ellipse(c, 0, 6, 18, 15, type === 'super' ? '#f7edd0' : '#f4d77f');
    ellipse(c, -5, 9, 10, 6, '#e7bb64', -0.3);
    ellipse(c, 3, -10, 14, 14, '#ffe8a0');
    ellipse(c, 13, -6, 9, 4, '#e99c44', 0.15);
    ellipse(c, 8, -13, 2.3, 3, '#263c35');
    ellipse(c, 8.6, -14, 0.7, 0.8, '#fff8d8');
    line(
        c,
        [
            {
                x: -7,
                y: 20,
            },
            {
                x: -12,
                y: 22,
            },
            {
                x: -4,
                y: 22,
            },
        ],
        '#d18c3d',
        3,
    );
    line(
        c,
        [
            {
                x: 5,
                y: 20,
            },
            {
                x: 2,
                y: 23,
            },
            {
                x: 11,
                y: 23,
            },
        ],
        '#d18c3d',
        3,
    );
    if (type === 'basic') {
        ellipse(c, 2, -23, 15, 5, b >= 3 ? '#435d3d' : '#75965a');
        rounded(c, -8, -32, 21, 10, 4, b >= 3 ? '#557545' : '#8aaa63');
        if (b >= 2) {
            rounded(c, 3, -17, 12, 7, 2, '#344f42');
            rounded(c, 5, -16, 3, 4, 1, '#b9daaa');
        }
        if (a >= 3) {
            rounded(c, -13, 2, 7, 13, 2, '#607047');
            line(
                c,
                [
                    {
                        x: -11,
                        y: 5,
                    },
                    {
                        x: -11,
                        y: 12,
                    },
                ],
                '#e4b754',
                2,
            );
        }
    } else if (type === 'super') {
        rounded(c, -9, -18, 24, 7, 3, a >= 2 ? '#69cddd' : '#5979b2');
        ellipse(c, 9, -15, 3, 2, '#f6ecc1');
        c.beginPath();
        c.moveTo(-2, 2);
        c.lineTo(7, 2);
        c.lineTo(2, 12);
        c.lineTo(-6, 12);
        c.closePath();
        c.fillStyle = a >= 3 ? '#fff2a8' : '#6392c9';
        c.fill();
        if (b >= 2) {
            line(
                c,
                [
                    {
                        x: -5,
                        y: -24,
                    },
                    {
                        x: -12,
                        y: -32,
                    },
                ],
                '#7eafc5',
                2,
            );
            ellipse(c, -13, -33, 3, 3, '#cbedf1');
        }
        if (a >= 3) {
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                line(
                    c,
                    [
                        {
                            x: Math.cos(angle) * 17,
                            y: -12 + Math.sin(angle) * 17,
                        },
                        {
                            x: Math.cos(angle) * 22,
                            y: -12 + Math.sin(angle) * 22,
                        },
                    ],
                    '#f4dc86',
                    3,
                );
            }
        }
    } else {
        c.beginPath();
        c.moveTo(-13, -22);
        c.lineTo(-1, -47);
        c.lineTo(14, -22);
        c.closePath();
        c.fillStyle = a >= 3 ? '#ac874e' : '#6e5ca4';
        c.fill();
        ellipse(c, 1, -22, 18, 4, a >= 3 ? '#e3c777' : '#a58acb');
        c.fillStyle = '#f5df85';
        c.font = '12px sans-serif';
        c.fillText('✦', -4, -30);
        if (b >= 2) {
            ellipse(c, -13, 5, 4, 4, '#92dbdf');
            line(
                c,
                [
                    {
                        x: -16,
                        y: 5,
                    },
                    {
                        x: -10,
                        y: 5,
                    },
                ],
                '#edffff',
                1,
            );
        }
    }
    // The equipped weapon aims independently of the friendly face.
    c.save();
    c.rotate(angle);
    const weapon = a >= 2 ? '#8c7760' : '#765a3c';
    if (type === 'magic') {
        line(
            c,
            [
                {
                    x: 7,
                    y: 8,
                },
                {
                    x: 27,
                    y: 8,
                },
            ],
            weapon,
            4,
        );
        ellipse(c, 27, 8, 5, 5, a >= 2 ? '#f8bb62' : '#bd9fe7');
    } else {
        rounded(
            c,
            7,
            4,
            type === 'super' ? 24 : 20,
            7,
            2,
            type === 'super'
                ? a >= 2
                    ? '#7ecdd5'
                    : '#6b889f'
                : a >= 2
                  ? '#7d8482'
                  : '#9d7850',
        );
        if (t.flash) {
            ellipse(c, 33, 7, 7, 5, '#fff0a4');
        }
    }
    c.restore();
    // Small dots below the avatar show how many tiers the player has purchased.
    if (a + b > 0) {
        for (let i = 0; i < a + b; i++) {
            ellipse(c, -12 + i * 5, 29, 1.7, 1.7, i < a ? '#f5cc76' : '#c0e797');
        }
    }
    c.restore();
}

// Cache the scenery once, then redraw only the changing game objects each frame.
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.c = canvas.getContext('2d');
        this.fx = [];
        this.time = 0;
        // This offscreen Canvas avoids rebuilding hundreds of grass details per frame.
        this.map = document.createElement('canvas');
        this.map.width = WIDTH;
        this.map.height = HEIGHT;
        this.drawMap(this.map.getContext('2d'));
        this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Paint grass, the shared balloon path, pond, decorations, and direction signs.
    drawMap(c) {
        c.fillStyle = '#9cb97b';
        c.fillRect(0, 0, WIDTH, HEIGHT);
        ellipse(c, 625, 455, 295, 220, '#a7bf82', -0.5);
        ellipse(c, 30, 30, 270, 150, '#afc78a');
        ellipse(c, 730, 0, 280, 100, '#a4bb7c');
        // A fixed random seed gives the scenery the same arrangement after each reload.
        let seed = 947;
        const random = () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };
        for (let i = 0; i < 550; i++) {
            const x = random() * WIDTH;
            const y = random() * HEIGHT;
            c.fillStyle = i % 3 === 0 ? '#6a95532c' : '#eff4bd28';
            c.fillRect(x, y, 2 + random() * 3, 2);
        }
        // Little meadow tufts.
        for (let i = 0; i < 120; i++) {
            const x = random() * WIDTH;
            const y = random() * HEIGHT;
            line(
                c,
                [
                    {
                        x: x - 3,
                        y: y + 3,
                    },
                    {
                        x,
                        y: y - 3,
                    },
                    {
                        x: x + 1,
                        y: y + 3,
                    },
                    {
                        x: x + 4,
                        y: y - 1,
                    },
                ],
                '#739c5a55',
                1,
            );
        }
        line(c, PATH, '#708953', 67);
        line(c, PATH, '#c8b786', 57);
        line(c, PATH, '#e2cea1', 48);
        line(c, PATH, '#ead8ad', 35);
        c.save();
        c.setLineDash([2, 13]);
        line(c, PATH, '#b7a57955', 1.5);
        c.restore();
        // Pond and layered shoreline, matching the placement exclusion ellipse.
        ellipse(c, 122, 482, 159, 98, '#829e62');
        ellipse(c, 121, 483, 151, 90, '#c8cd91');
        ellipse(c, 121, 484, 144, 84, '#548c8e');
        ellipse(c, 119, 480, 137, 76, '#6aa7a4');
        ellipse(c, 106, 466, 110, 48, '#7bb8af');
        for (const [x, y, w] of [
            [68, 446, 38],
            [160, 478, 32],
            [97, 520, 45],
            [30, 483, 22],
            [187, 438, 17],
        ]) {
            line(
                c,
                [
                    {
                        x,
                        y,
                    },
                    {
                        x: x + w,
                        y,
                    },
                ],
                '#b9e4ca55',
                2,
            );
            line(
                c,
                [
                    {
                        x: x + 6,
                        y: y + 7,
                    },
                    {
                        x: x + w - 5,
                        y: y + 7,
                    },
                ],
                '#b9e4ca33',
                1,
            );
        }
        for (const [x, y] of [
            [194, 498],
            [57, 502],
            [123, 450],
        ]) {
            ellipse(c, x, y, 9, 4, '#518253', -0.2);
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x + 10, y - 5);
            c.lineTo(x + 8, y + 3);
            c.closePath();
            c.fillStyle = '#6aa7a4';
            c.fill();
        }
        ellipse(c, 195, 496, 3, 2, '#ecd29b');
        for (const [x, y] of [
            [245, 510],
            [233, 536],
            [17, 400],
            [26, 417],
            [59, 566],
        ]) {
            line(
                c,
                [
                    {
                        x,
                        y,
                    },
                    {
                        x: x - 3,
                        y: y - 30,
                    },
                ],
                '#507c51',
                2,
            );
            line(
                c,
                [
                    {
                        x: x + 5,
                        y,
                    },
                    {
                        x: x + 8,
                        y: y - 24,
                    },
                ],
                '#507c51',
                2,
            );
            rounded(c, x - 5, y - 33, 5, 12, 2, '#8c7446');
        }
        // A few trees, stones, flowers and a picnic blanket.
        [
            [39, 38, 0.9],
            [89, 31, 1.1],
            [866, 70, 1.2],
            [914, 102, 0.85],
            [884, 558, 1.2],
            [926, 590, 1],
            [567, 555, 0.7],
            [341, 41, 0.65],
        ].forEach((p) => {
            return tree(c, ...p);
        });
        [
            [312, 525, 1.1],
            [282, 553, 0.65],
            [855, 322, 0.8],
            [896, 341, 0.6],
            [631, 67, 0.65],
        ].forEach((p) => {
            return rock(c, ...p);
        });
        for (const [x, y] of [
            [380, 313],
            [416, 335],
            [655, 428],
            [675, 441],
            [65, 220],
            [91, 208],
            [322, 137],
            [806, 548],
        ]) {
            for (let i = 0; i < 5; i++) {
                ellipse(
                    c,
                    x + Math.cos(i * 1.257) * 3,
                    y + Math.sin(i * 1.257) * 3,
                    2.3,
                    2.3,
                    '#f3eab7',
                );
            }
            ellipse(c, x, y, 1.6, 1.6, '#cba755');
        }
        c.save();
        c.translate(673, 536);
        c.rotate(-0.12);
        rounded(c, -30, -18, 60, 37, 3, '#eac6a0');
        for (let x = -30; x < 30; x += 10) {
            for (let y = -18; y < 19; y += 10) {
                if ((x + y) % 20 === -8) {
                    rounded(c, x, y, 10, 10, 0, '#d88e7866');
                }
            }
        }
        rounded(c, -12, -9, 23, 16, 3, '#af875a');
        line(
            c,
            [
                {
                    x: -7,
                    y: -9,
                },
                {
                    x: -7,
                    y: -16,
                },
                {
                    x: 5,
                    y: -16,
                },
                {
                    x: 5,
                    y: -9,
                },
            ],
            '#806642',
            2,
        );
        c.restore();
        // Direction signs.
        for (const [x, y, text] of [
            [45, 72, 'IN →'],
            [903, 499, 'OUT →'],
        ]) {
            rounded(c, x - 3, y + 6, 6, 24, 2, '#8e784e');
            rounded(c, x - 28, y - 9, 56, 22, 4, '#f0dcad');
            c.fillStyle = '#617447';
            c.textAlign = 'center';
            c.font = 'bold 10px sans-serif';
            c.fillText(text, x, y + 5);
        }
        c.save();
        c.translate(102, 596);
        c.fillStyle = '#567f54';
        c.font = '600 10px sans-serif';
        c.textAlign = 'center';
        c.fillText('W I L L O W B E N D', 0, 0);
        c.restore();
    }

    // Convert gameplay events into short-lived particles, rings, and floating text.
    // Respect reduced-motion preferences and cap the queue during busy waves.
    event(e) {
        if (this.reduced && e.kind === 'pop' && !e.boss) {
            return;
        }
        if (['pop', 'build', 'upgrade', 'sell', 'leak', 'blast'].includes(e.kind)) {
            this.fx.push({
                ...e,
                life:
                    e.kind === 'leak'
                        ? 1.1
                        : e.kind === 'blast'
                          ? 0.3
                          : e.boss
                            ? 0.8
                            : 0.45,
                max:
                    e.kind === 'leak'
                        ? 1.1
                        : e.kind === 'blast'
                          ? 0.3
                          : e.boss
                            ? 0.8
                            : 0.45,
            });
            if (this.fx.length > 160) {
                this.fx.splice(0, this.fx.length - 160);
            }
        }
    }

    // Boss hulls follow the path direction; ordinary balloons remain upright.
    // Camo patches, regrow hearts, and armor details explain enemy traits visually.
    balloon(c, e) {
        const b = BALLOONS[e.type];
        c.save();
        c.translate(e.x, e.y);
        if (b.boss) {
            c.rotate(e.angle);
            const r = b.radius;
            ellipse(c, 3, 9, r * 1.48, r * 0.58, '#284f3d33');
            for (const sign of [-1, 1]) {
                c.beginPath();
                c.moveTo(-r * 0.8, sign * r * 0.35);
                c.lineTo(-r * 1.4, sign * r * 0.95);
                c.lineTo(-r * 0.35, sign * r * 0.55);
                c.closePath();
                c.fillStyle = b.color;
                c.fill();
            }
            const grad = c.createLinearGradient(0, -r * 0.65, 0, r * 0.65);
            grad.addColorStop(0, '#eaf4ec');
            grad.addColorStop(0.3, b.color);
            grad.addColorStop(
                1,
                e.type === 'zeppelin'
                    ? '#4686ad'
                    : e.type === 'dread'
                      ? '#ae504f'
                      : '#8062b5',
            );
            ellipse(c, 0, 0, r * 1.55, r * 0.65, grad);
            c.save();
            c.beginPath();
            c.ellipse(0, 0, r * 1.55, r * 0.65, 0, 0, Math.PI * 2);
            c.clip();
            for (const x of [-r * 0.75, r * 0.35]) {
                c.fillStyle = '#ffffff35';
                c.fillRect(x - 3, -r, 6, r * 2);
                c.fillStyle = '#23445445';
                c.fillRect(x + 3, -r, 2, r * 2);
            }
            c.restore();
            rounded(c, -r * 0.25, -r * 0.27, r * 0.65, r * 0.33, 4, '#24465c');
            rounded(c, -r * 0.19, -r * 0.23, r * 0.2, r * 0.22, 2, '#b1dfde');
            c.fillStyle = '#fff9d3';
            c.font = `bold ${r * 0.32}px sans-serif`;
            c.textAlign = 'center';
            c.fillText(
                e.type === 'leviathan' ? 'Ⅲ' : e.type === 'dread' ? 'Ⅱ' : 'Ⅰ',
                -r * 0.76,
                4,
            );
            // Undo the hull rotation so its health bar remains horizontal and readable.
            c.rotate(-e.angle);
            rounded(c, -r, -r - 17, r * 2, 5, 2, '#2d493f');
            rounded(
                c,
                -r,
                -r - 17,
                r * 2 * Math.max(0, e.health / b.hp),
                5,
                2,
                e.type === 'leviathan' ? '#dbb8fa' : '#edf0bb',
            );
        } else {
            const r = b.radius;
            ellipse(c, 2, 10, r * 0.9, r * 0.35, '#3d663a22');
            line(
                c,
                [
                    {
                        x: 0,
                        y: r + 3,
                    },
                    {
                        x: 2,
                        y: r + 10,
                    },
                    {
                        x: -1,
                        y: r + 15,
                    },
                ],
                '#6e7c5855',
                1,
            );
            const grad = c.createLinearGradient(-r, -r, r, r);
            grad.addColorStop(0, e.type === 'white' ? '#fffef2' : b.color);
            grad.addColorStop(1, e.type === 'white' ? '#d1d7c4' : b.color);
            ellipse(c, 0, 0, r * 0.86, r, grad);
            if (e.type === 'rainbow') {
                c.save();
                c.beginPath();
                c.ellipse(0, 0, r * 0.86, r, 0, 0, Math.PI * 2);
                c.clip();
                [
                    '#e86a73',
                    '#efbe61',
                    '#eee78a',
                    '#7fce99',
                    '#79b9df',
                    '#b99be5',
                ].forEach((col, i) => {
                    c.fillStyle = col;
                    c.fillRect(-r, -r + (i * r) / 3, r * 2, r / 3 + 1);
                });
                c.restore();
            }
            if (e.type === 'lead') {
                line(
                    c,
                    [
                        {
                            x: -11,
                            y: -2,
                        },
                        {
                            x: 11,
                            y: -2,
                        },
                    ],
                    '#6b7c88',
                    2,
                );
                ellipse(c, -8, -2, 1.5, 1.5, '#d9e5df');
                ellipse(c, 8, -2, 1.5, 1.5, '#d9e5df');
            }
            if (e.type === 'ceramic') {
                line(
                    c,
                    [
                        {
                            x: -10,
                            y: -6,
                        },
                        {
                            x: 3,
                            y: -6,
                        },
                        {
                            x: 0,
                            y: 2,
                        },
                        {
                            x: 8,
                            y: 7,
                        },
                        {
                            x: 4,
                            y: 14,
                        },
                    ],
                    '#895b3c',
                    2,
                );
            }
            if (e.camo) {
                for (const [x, y, s] of [
                    [-4, 3, 5],
                    [5, -5, 4],
                    [-6, -7, 3],
                    [5, 7, 3],
                ]) {
                    ellipse(c, x, y, s, s * 0.55, '#456d4dbb', 0.6);
                }
            }
            ellipse(c, -r * 0.3, -r * 0.4, r * 0.2, r * 0.3, '#ffffff55', 0.4);
            c.beginPath();
            c.moveTo(0, r - 1);
            c.lineTo(-3, r + 4);
            c.lineTo(3, r + 4);
            c.closePath();
            c.fillStyle = b.color;
            c.fill();
            if (e.regrow) {
                c.font = 'bold 11px sans-serif';
                c.textAlign = 'center';
                c.fillStyle = '#fff3e1';
                c.fillText('♥', 0, 5);
            }
            if (e.type === 'ceramic' && e.health < b.hp) {
                rounded(c, -12, -23, 24, 3, 1, '#594e37');
                rounded(c, -12, -23, (24 * e.health) / b.hp, 3, 1, '#f2ce8c');
            }
        }
        c.restore();
    }

    // Compose one frame in drawing order: scenery, range, balloons, ducks, shots, effects.
    // dt advances visual effects even while the combat simulation is paused.
    draw(game, selection, dt) {
        const c = this.c;
        this.time += dt;
        c.clearRect(0, 0, WIDTH, HEIGHT);
        c.drawImage(this.map, 0, 0);
        const selected = game.towers.find((t) => {
            return t.id === selection.id;
        });
        if (selected) {
            const r = statsFor(selected).range;
            ellipse(c, selected.x, selected.y, r, r, '#effcc514');
            c.beginPath();
            c.arc(selected.x, selected.y, r, 0, Math.PI * 2);
            c.strokeStyle = '#f0fac678';
            c.lineWidth = 1.5;
            c.setLineDash([5, 5]);
            c.stroke();
            c.setLineDash([]);
            ellipse(c, selected.x, selected.y, 26, 26, '#e8fbb82a');
            c.beginPath();
            c.arc(selected.x, selected.y, 26, 0, Math.PI * 2);
            c.strokeStyle = '#f0fad1';
            c.lineWidth = 2;
            c.stroke();
        }
        // Bosses are behind smaller enemies. Draw ordinary enemies and ducks by y
        // position to give overlapping sprites a simple foreground/background order.
        game.enemies
            .filter((e) => {
                return BALLOONS[e.type].boss;
            })
            .forEach((e) => {
                return this.balloon(c, e);
            });
        game.enemies
            .filter((e) => {
                return !BALLOONS[e.type].boss;
            })
            .sort((a, b) => {
                return a.y - b.y;
            })
            .forEach((e) => {
                return this.balloon(c, e);
            });
        // Sort a copy so rendering never changes the engine's tower list.
        game.towers
            .slice()
            .sort((a, b) => {
                return a.y - b.y;
            })
            .forEach((t) => {
                return drawDuck(c, t);
            });
        for (const p of game.projectiles) {
            c.save();
            c.translate(p.x, p.y);
            c.rotate(Math.atan2(p.vy, p.vx));
            if (p.type === 'magic') {
                ellipse(
                    c,
                    0,
                    0,
                    p.stats.splash ? 6 : 4,
                    4,
                    p.stats.splash ? '#ffb368' : '#e1b5fc',
                );
                ellipse(c, 0, 0, 2, 2, '#fff5df');
                line(
                    c,
                    [
                        {
                            x: -6,
                            y: 0,
                        },
                        {
                            x: -14,
                            y: 0,
                        },
                    ],
                    '#e1b5fc77',
                    3,
                );
            } else {
                line(
                    c,
                    [
                        {
                            x: -8,
                            y: 0,
                        },
                        {
                            x: 3,
                            y: 0,
                        },
                    ],
                    p.stats.lead ? '#e3f9ce' : '#514c39',
                    2.5,
                );
                c.beginPath();
                c.moveTo(5, 0);
                c.lineTo(0, -3);
                c.lineTo(0, 3);
                c.closePath();
                c.fillStyle = p.stats.lead ? '#edffdf' : '#e5e4bf';
                c.fill();
            }
            c.restore();
        }
        // Convert remaining lifetime into progress from 0 to 1 for expansion and fading.
        for (const f of this.fx) {
            f.life -= dt;
            const t = 1 - f.life / f.max;
            c.save();
            c.globalAlpha = Math.max(0, 1 - t);
            if (f.kind === 'leak') {
                c.fillStyle = '#8d3b34';
                c.font = 'bold 22px sans-serif';
                c.textAlign = 'right';
                c.fillText(`−${f.amount} ♥`, f.x, f.y - 25 - t * 25);
            } else if (f.kind === 'blast') {
                ellipse(c, f.x, f.y, f.radius * t, f.radius * t, '#ffdb9255');
                c.strokeStyle = '#fff1b5';
                c.lineWidth = 2;
                c.beginPath();
                c.arc(f.x, f.y, f.radius * t, 0, Math.PI * 2);
                c.stroke();
            } else if (['build', 'upgrade', 'sell'].includes(f.kind)) {
                c.strokeStyle = f.kind === 'sell' ? '#ead0a1' : '#f0fcc5';
                c.lineWidth = 3;
                c.beginPath();
                c.arc(f.x, f.y, 20 + t * 35, 0, Math.PI * 2);
                c.stroke();
            } else {
                const n = f.boss ? 12 : 5;
                for (let i = 0; i < n; i++) {
                    const angle = (i * Math.PI * 2) / n;
                    ellipse(
                        c,
                        f.x + Math.cos(angle) * t * (f.boss ? 60 : 18),
                        f.y + Math.sin(angle) * t * (f.boss ? 60 : 18),
                        f.boss ? 4 : 2,
                        f.boss ? 4 : 2,
                        f.color || '#fff9d9',
                    );
                }
            }
            c.restore();
        }
        this.fx = this.fx.filter((f) => {
            return f.life > 0;
        });
        // Preview a shop duck before purchase, using the real placement validation.
        // Invalid or unaffordable spots get a red range circle and an X.
        if (
            selection.type &&
            selection.pointer &&
            !['won', 'lost'].includes(game.status)
        ) {
            const { x, y } = selection.pointer;
            const t = {
                type: selection.type,
                x,
                y,
                levels: [0, 0],
                angle: -Math.PI / 2,
            };
            const valid =
                !placementError(x, y, game.towers) && game.money >= selection.cost;
            ellipse(
                c,
                x,
                y,
                statsFor(t).range,
                statsFor(t).range,
                valid ? '#e7facb2c' : '#c14d4425',
            );
            c.beginPath();
            c.arc(x, y, statsFor(t).range, 0, Math.PI * 2);
            c.strokeStyle = valid ? '#f2fbd29c' : '#a45247aa';
            c.lineWidth = 1.5;
            c.stroke();
            c.save();
            c.globalAlpha = 0.75;
            drawDuck(c, t);
            c.restore();
            if (!valid) {
                c.font = 'bold 22px sans-serif';
                c.fillStyle = '#9a483a';
                c.textAlign = 'center';
                c.fillText('×', x, y + 47);
            }
        } else if (selection.keyboard && selection.pointer) {
            c.strokeStyle = '#f4f7ce';
            c.lineWidth = 2;
            c.strokeRect(selection.pointer.x - 12, selection.pointer.y - 12, 24, 24);
        }
    }
}
