

// Works with a quests.json early on

// use like this: questDB[questID] gives you Quest details
export const questDB = {
    "training-grounds": {
        category: "pythagorean-marshes",
        type: 'encounter',
        title: 'Training For Triangulon',
        description:
            'An introduction to the combat system behind Branch. Including abilities, enemy types, and more. By the end you will be a Branch combat master!',
        objectives: [
            { label: 'Defeat the training dummy.', current: 0, total: 1 },
            { label: 'Use a health potion.', current: 0, total: 1 }
        ],
        rewards: [
            { name: 'Health Potion', count: 3, tone: 'blue' },
            { name: 'Sword of Rage', count: 1, tone: 'red' }
        ]
    }
};

