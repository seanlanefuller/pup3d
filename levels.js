// Level Definitions
const LEVELS = [
    // Level 1 - Tutorial
    {
        name: "Level 1",
        playerStart: { x: 1.5, y: 1.5, angle: 0 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 2, 0, 0, 2, 2, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 2, 2, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 2, 2, 0, 0, 2, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        enemies: [
            { x: 5.5, y: 3.5, health: 100, state: 'idle', alertRadius: 5 },
            { x: 5.5, y: 6.5, health: 100, state: 'idle', alertRadius: 5 }
        ],
        items: [
            { type: 'health', x: 2.5, y: 2.5, collected: false },
            { type: 'ammo', x: 7.5, y: 2.5, collected: false },
            { type: 'key', color: 'red', x: 5.5, y: 7.5, collected: false }
        ],
        doors: [
            { x: 8.5, y: 5, color: 'red', locked: true, open: false }
        ],
        exit: { x: 8.5, y: 8.5 }
    },

    // Level 2 - Intermediate
    {
        name: "Level 2",
        playerStart: { x: 1.5, y: 1.5, angle: 0 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 3, 3, 0, 1],
            [1, 0, 2, 2, 2, 0, 1, 0, 3, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 3, 3, 1],
            [1, 0, 2, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 2, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 1, 1, 0, 3, 3, 3, 0, 3, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1],
            [1, 0, 2, 2, 2, 0, 1, 0, 3, 3, 3, 3, 3, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        enemies: [
            { x: 3.5, y: 2.5, health: 100, state: 'idle', alertRadius: 6 },
            { x: 8.5, y: 4.5, health: 100, state: 'idle', alertRadius: 6 },
            { x: 12.5, y: 2.5, health: 100, state: 'idle', alertRadius: 6 },
            { x: 5.5, y: 8.5, health: 100, state: 'idle', alertRadius: 6 },
            { x: 11.5, y: 9.5, health: 100, state: 'idle', alertRadius: 6 }
        ],
        items: [
            { type: 'health', x: 3.5, y: 10.5, collected: false },
            { type: 'ammo', x: 13.5, y: 1.5, collected: false },
            { type: 'ammo', x: 8.5, y: 8.5, collected: false },
            { type: 'key', color: 'blue', x: 2.5, y: 3.5, collected: false },
            { type: 'key', color: 'red', x: 13.5, y: 8.5, collected: false }
        ],
        doors: [
            { x: 6, y: 3.5, color: 'blue', locked: true, open: false },
            { x: 10, y: 5.5, color: 'red', locked: true, open: false }
        ],
        exit: { x: 13.5, y: 10.5 }
    },

    // Level 3 - Advanced
    {
        name: "Level 3",
        playerStart: { x: 1.5, y: 1.5, angle: 0 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 3, 0, 1],
            [1, 0, 2, 0, 2, 0, 2, 0, 1, 0, 3, 3, 3, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 3, 3, 0, 1],
            [1, 0, 2, 2, 2, 2, 2, 0, 1, 0, 0, 0, 3, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 3, 3, 3, 3, 3, 1],
            [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 3, 3, 0, 1],
            [1, 0, 2, 2, 2, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 3, 0, 3, 3, 0, 3, 3, 0, 3, 1],
            [1, 0, 2, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 2, 0, 0, 0, 3, 0, 3, 3, 3, 3, 3, 3, 3, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 0, 3, 3, 3, 3, 0, 3, 3, 3, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        enemies: [
            { x: 3.5, y: 2.5, health: 100, state: 'idle', alertRadius: 7 },
            { x: 6.5, y: 2.5, health: 100, state: 'idle', alertRadius: 7 },
            { x: 12.5, y: 3.5, health: 100, state: 'idle', alertRadius: 7 },
            { x: 15.5, y: 2.5, health: 100, state: 'idle', alertRadius: 7 },
            { x: 4.5, y: 8.5, health: 100, state: 'idle', alertRadius: 7 },
            { x: 9.5, y: 7.5, health: 100, state: 'idle', alertRadius: 7 },
            { x: 14.5, y: 9.5, health: 100, state: 'idle', alertRadius: 7 },
            { x: 3.5, y: 11.5, health: 100, state: 'idle', alertRadius: 7 },
            { x: 10.5, y: 12.5, health: 100, state: 'idle', alertRadius: 7 },
            { x: 15.5, y: 14.5, health: 100, state: 'idle', alertRadius: 7 }
        ],
        items: [
            { type: 'health', x: 2.5, y: 3.5, collected: false },
            { type: 'health', x: 9.5, y: 10.5, collected: false },
            { type: 'ammo', x: 4.5, y: 4.5, collected: false },
            { type: 'ammo', x: 11.5, y: 2.5, collected: false },
            { type: 'ammo', x: 16.5, y: 7.5, collected: false },
            { type: 'key', color: 'yellow', x: 16.5, y: 1.5, collected: false },
            { type: 'key', color: 'blue', x: 2.5, y: 10.5, collected: false },
            { type: 'key', color: 'red', x: 16.5, y: 13.5, collected: false }
        ],
        doors: [
            { x: 8.5, y: 3, color: 'yellow', locked: true, open: false },
            { x: 11, y: 6.5, color: 'blue', locked: true, open: false },
            { x: 6, y: 11.5, color: 'red', locked: true, open: false }
        ],
        exit: { x: 16.5, y: 14.5 }
    }
];
