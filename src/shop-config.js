// Shop Configuration - ONLY FUNCTIONAL ITEMS
export const SHOP_CONFIG = {
    // UPGRADES - These actually work in game
    upgrades: [
        {
            id: 'speed',
            name: 'Velocidad',
            description: 'Movete más rápido (+20% por nivel)',
            maxLevel: 5,
            baseCost: 200,
            costMultiplier: 2,
            icon: '🏃',
            functional: true
        },
        {
            id: 'fireRate',
            name: 'Cadencia',
            description: 'Disparás más rápido (-100ms por nivel)',
            maxLevel: 5,
            baseCost: 300,
            costMultiplier: 2.5,
            icon: '🔫',
            functional: true
        },
        {
            id: 'shield',
            name: 'Vidas Extra',
            description: 'Empezás con más vidas (+1 por nivel)',
            maxLevel: 3,
            baseCost: 500,
            costMultiplier: 3,
            icon: '❤️',
            functional: true
        },
        {
            id: 'damage',
            name: 'Daño',
            description: 'Balas más poderosas (+50% por nivel)',
            maxLevel: 3,
            baseCost: 400,
            costMultiplier: 2.5,
            icon: '💥',
            functional: true
        }
    ]
};

// Achievement names and descriptions
export const ACHIEVEMENT_INFO = {
    firstBlood: {
        name: 'Primera Sangre',
        description: 'Mata tu primera gallina',
        icon: '🐔'
    },
    killer10: {
        name: 'Calentando',
        description: 'Acumula 10 kills totales',
        icon: '🔥'
    },
    killer50: {
        name: 'Cazador',
        description: 'Acumula 50 kills totales',
        icon: '🎯'
    },
    killer100: {
        name: 'Exterminador',
        description: 'Acumula 100 kills totales',
        icon: '💀'
    },
    killer500: {
        name: 'Leyenda',
        description: 'Acumula 500 kills totales',
        icon: '👑'
    },
    killer1000: {
        name: 'Dios de la Guerra',
        description: 'Acumula 1000 kills totales',
        icon: '⚔️'
    },
    sudamericana2023: {
        name: 'Sudamericana 2023',
        description: 'Acumula 5,000 kills totales',
        icon: '🏆'
    },
    libertadores: {
        name: 'Copa Libertadores',
        description: 'Acumula 10,000 kills totales',
        icon: '🏆'
    },
    libertadores2: {
        name: 'Copa Libertadores II',
        description: 'Acumula 20,000 kills totales',
        icon: '🏆'
    },
    libertadores3: {
        name: 'Copa Libertadores III',
        description: 'Acumula 30,000 kills totales',
        icon: '🏆'
    },
    libertadores4: {
        name: 'Copa Libertadores IV',
        description: 'Acumula 40,000 kills totales',
        icon: '🏆'
    },
    libertadores5: {
        name: 'Copa Libertadores V',
        description: 'Acumula 50,000 kills totales',
        icon: '🏆'
    },
    libertadores6: {
        name: 'Copa Libertadores VI',
        description: 'Acumula 60,000 kills totales',
        icon: '🏆'
    },
    intercontinental2000: {
        name: 'Intercontinental 2000',
        description: 'Acumula 50,000 kills totales',
        icon: '🌍'
    },
    intercontinental2: {
        name: 'Intercontinental II',
        description: 'Acumula 100,000 kills totales',
        icon: '🌍'
    },
    intercontinental3: {
        name: 'Intercontinental III',
        description: 'Acumula 150,000 kills totales',
        icon: '🌍'
    },
    intercontinental4: {
        name: 'Intercontinental IV',
        description: 'Acumula 200,000 kills totales',
        icon: '🌍'
    },
    intercontinental5: {
        name: 'Intercontinental V',
        description: 'Acumula 250,000 kills totales',
        icon: '🌍'
    },
    intercontinental6: {
        name: 'Intercontinental VI',
        description: 'Acumula 300,000 kills totales',
        icon: '🌍'
    },
    survivor5min: {
        name: 'Sobreviviente 5min',
        description: 'Sobrevive 5 minutos en una partida',
        icon: '⏱️'
    },
    survivor10min: {
        name: 'Sobreviviente 10min',
        description: 'Sobrevive 10 minutos en una partida',
        icon: '⏱️'
    },
    survivor15min: {
        name: 'Sobreviviente 15min',
        description: 'Sobrevive 15 minutos en una partida',
        icon: '⏱️'
    },
    perfectWave: {
        name: 'Oleada Perfecta',
        description: 'Completa una oleada sin recibir daño',
        icon: '✨'
    },
    speedRunner: {
        name: 'Velocista',
        description: '100 kills en menos de 3 minutos',
        icon: '⚡'
    },
    collector: {
        name: 'Coleccionista',
        description: 'Compra todas las mejoras al máximo',
        icon: '🎨'
    }
};
