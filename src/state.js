export class GameState {
    constructor() {
        this.storageKey = 'galaga_bostero_data';
        this.data = this.load();

        if (!this.data) {
            this.data = this.createInitialState();
            this.save();
        }

        // Migrate old data if needed
        this.migrateData();
    }

    createInitialState() {
        return {
            user: null, // { name: string, dni: string, socioId: string }
            wallet: {
                coins: 0
            },
            stats: {
                totalKills: 0,
                highScore: 0,
                totalPlayTime: 0, // seconds
                gamesPlayed: 0,
                runs: [], // Top 10 runs
                lastPlayed: null
            },
            inventory: {
                // Only upgrades - these actually work
                upgrades: {
                    speed: 0,
                    fireRate: 0,
                    shield: 0,
                    damage: 0
                }
            },
            achievements: {
                // Kills milestones
                firstBlood: { unlocked: false, reward: 10 },
                killer10: { unlocked: false, reward: 20 },
                killer50: { unlocked: false, reward: 50 },
                killer100: { unlocked: false, reward: 100 },
                killer500: { unlocked: false, reward: 250 },
                killer1000: { unlocked: false, reward: 500 },

                // Historic achievements
                sudamericana2023: { unlocked: false, reward: 1000 }, // 5k total kills
                libertadores: { unlocked: false, reward: 2000 }, // 10k total kills
                libertadores2: { unlocked: false, reward: 3000 }, // 20k total kills
                libertadores3: { unlocked: false, reward: 4000 }, // 30k total kills
                libertadores4: { unlocked: false, reward: 5000 }, // 40k total kills
                libertadores5: { unlocked: false, reward: 6000 }, // 50k total kills
                libertadores6: { unlocked: false, reward: 7000 }, // 60k total kills

                intercontinental2000: { unlocked: false, reward: 5000 }, // 50k total kills
                intercontinental2: { unlocked: false, reward: 8000 }, // 100k total kills
                intercontinental3: { unlocked: false, reward: 11000 }, // 150k total kills
                intercontinental4: { unlocked: false, reward: 14000 }, // 200k total kills
                intercontinental5: { unlocked: false, reward: 17000 }, // 250k total kills
                intercontinental6: { unlocked: false, reward: 20000 }, // 300k total kills

                // Time achievements
                survivor5min: { unlocked: false, reward: 100 },
                survivor10min: { unlocked: false, reward: 300 },
                survivor15min: { unlocked: false, reward: 500 },

                // Special
                perfectWave: { unlocked: false, reward: 200 }, // Complete wave without damage
                speedRunner: { unlocked: false, reward: 300 }, // 100 kills in under 3 min
                collector: { unlocked: false, reward: 500 } // Own all skins
            },
            profile: {
                level: 1,
                xp: 0,
                title: 'Hincha',
                favoriteMode: null
            }
        };
    }

    migrateData() {
        // Add new fields if they don't exist
        if (!this.data.inventory.trails) {
            this.data.inventory.trails = ['none'];
            this.data.inventory.equippedTrail = 'none';
        }
        if (!this.data.inventory.bulletStyles) {
            this.data.inventory.bulletStyles = ['default'];
            this.data.inventory.equippedBullet = 'default';
        }
        if (!this.data.inventory.backgrounds) {
            this.data.inventory.backgrounds = ['bombonera'];
            this.data.inventory.equippedBackground = 'bombonera';
        }
        if (!this.data.inventory.songs) { // Added songs migration
            this.data.inventory.songs = ['default'];
            this.data.inventory.equippedSong = 'default';
        }
        if (!this.data.inventory.upgrades.shield && this.data.inventory.upgrades.lives !== undefined) {
            this.data.inventory.upgrades.shield = this.data.inventory.upgrades.lives; // Migrate lives to shield
            delete this.data.inventory.upgrades.lives;
        }
        if (!this.data.achievements) {
            // If unlocks existed, migrate them to achievements
            if (this.data.unlocks) {
                const initialAchievements = this.createInitialState().achievements;
                this.data.achievements = {
                    ...initialAchievements,
                    sudamericana2023: { ...initialAchievements.sudamericana2023, unlocked: this.data.unlocks.sudamericana2023 },
                    libertadores: { ...initialAchievements.libertadores, unlocked: this.data.unlocks.libertadores },
                    intercontinental2000: { ...initialAchievements.intercontinental2000, unlocked: this.data.unlocks.intercontinental2000 }
                };
                delete this.data.unlocks; // Remove old unlocks
            } else {
                this.data.achievements = this.createInitialState().achievements;
            }
        }
        if (!this.data.profile) {
            this.data.profile = this.createInitialState().profile;
        }
        if (!this.data.stats.totalPlayTime) this.data.stats.totalPlayTime = 0;
        if (!this.data.stats.gamesPlayed) this.data.stats.gamesPlayed = 0;
        if (!this.data.stats.lastPlayed) this.data.stats.lastPlayed = null;

        // Ensure runs array is always present and has correct length (if it was top 5 before)
        if (!this.data.stats.runs) {
            this.data.stats.runs = [];
        } else {
            this.data.stats.runs = this.data.stats.runs.slice(0, 10); // Adjust to new top 10 limit
        }

        this.save();
    }

    load() {
        const raw = localStorage.getItem(this.storageKey);
        return raw ? JSON.parse(raw) : null;
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    // User Management
    registerUser(name, dni) {
        const socioId = '1' + Math.floor(Math.random() * 9000000 + 1000000); // 1XXXXXXX
        this.data.user = {
            name: name.toUpperCase(),
            dni: dni,
            socioId: socioId
        };
        this.save();
        return this.data.user;
    }

    isLoggedIn() {
        return !!this.data.user;
    }

    getUser() {
        return this.data.user;
    }

    // Economy
    addCoins(amount) {
        this.data.wallet.coins += amount;
        this.save();
    }

    spendCoins(amount) {
        if (this.data.wallet.coins >= amount) {
            this.data.wallet.coins -= amount;
            this.save();
            return true;
        }
        return false;
    }

    getCoins() {
        return this.data.wallet.coins;
    }

    // Stats
    addKill() {
        this.data.stats.totalKills++;
        this.checkAchievements();
        this.addXP(1); // 1 XP per kill
        this.save();
    }

    addRun(runData) {
        // runData = { score, kills, time, wave, date }
        this.data.stats.gamesPlayed++;
        this.data.stats.totalPlayTime += runData.time;
        this.data.stats.lastPlayed = runData.date;

        this.data.stats.runs.push({
            score: runData.score,
            kills: runData.kills,
            time: runData.time,
            wave: runData.wave,
            date: runData.date || new Date().toISOString()
        });

        // Sort by score
        this.data.stats.runs.sort((a, b) => b.score - a.score);
        this.data.stats.runs = this.data.stats.runs.slice(0, 10);

        // Update high score
        if (runData.score > this.data.stats.highScore) {
            this.data.stats.highScore = runData.score;
        }

        this.addXP(runData.score); // XP = score
        this.checkAchievements();
        this.save();
    }

    // Profile & Progression
    addXP(amount) {
        this.data.profile.xp += amount;

        // Level up calculation
        const xpForNextLevel = this.data.profile.level * 100;
        if (this.data.profile.xp >= xpForNextLevel) {
            this.data.profile.level++;
            this.data.profile.xp -= xpForNextLevel;

            // Level up reward
            this.addCoins(this.data.profile.level * 10);

            // Update title
            this.updateTitle();
        }
    }

    updateTitle() {
        const level = this.data.profile.level;
        if (level >= 50) this.data.profile.title = 'Leyenda Xeneize';
        else if (level >= 30) this.data.profile.title = 'Ídolo';
        else if (level >= 20) this.data.profile.title = 'Crack';
        else if (level >= 10) this.data.profile.title = 'Jugador';
        else if (level >= 5) this.data.profile.title = 'Socio Activo';
        else this.data.profile.title = 'Hincha';
    }

    // Inventory
    buyItem(itemType, itemId, cost) {
        const inventoryKey = itemType + 's'; // 'skin' -> 'skins'

        if (!this.data.inventory[inventoryKey].includes(itemId)) {
            if (this.spendCoins(cost)) {
                this.data.inventory[inventoryKey].push(itemId);
                this.checkAchievements();
                this.save();
                return true;
            }
        }
        return false;
    }

    equipItem(itemType, itemId) {
        const inventoryKey = itemType + 's';
        const equippedKey = 'equipped' + itemType.charAt(0).toUpperCase() + itemType.slice(1);

        if (this.data.inventory[inventoryKey].includes(itemId)) {
            this.data.inventory[equippedKey] = itemId;
            this.save();
            return true;
        }
        return false;
    }

    buyUpgrade(type, cost, maxLevel) {
        const currentLevel = this.data.inventory.upgrades[type] || 0;
        if (currentLevel < maxLevel) {
            if (this.spendCoins(cost)) {
                this.data.inventory.upgrades[type]++;
                this.save();
                return true;
            }
        }
        return false;
    }

    // Achievements
    checkAchievements() {
        const kills = this.data.stats.totalKills;
        const achievements = this.data.achievements;

        // Kill milestones
        this.unlockAchievement('firstBlood', kills >= 1);
        this.unlockAchievement('killer10', kills >= 10);
        this.unlockAchievement('killer50', kills >= 50);
        this.unlockAchievement('killer100', kills >= 100);
        this.unlockAchievement('killer500', kills >= 500);
        this.unlockAchievement('killer1000', kills >= 1000);

        // Historic
        this.unlockAchievement('sudamericana2023', kills >= 5000);
        this.unlockAchievement('libertadores', kills >= 10000);
        this.unlockAchievement('intercontinental2000', kills >= 50000);

        // Collector
        const allSkins = ['default', 'merentiel', 'paredes', 'cavani', 'advincula', 'rojo'];
        const hasAllSkins = allSkins.every(skin => this.data.inventory.skins.includes(skin));
        this.unlockAchievement('collector', hasAllSkins);
    }

    unlockAchievement(achievementId, condition) {
        if (condition && !this.data.achievements[achievementId].unlocked) {
            this.data.achievements[achievementId].unlocked = true;
            const reward = this.data.achievements[achievementId].reward;
            this.addCoins(reward);

            // Show notification (will implement in UI)
            window.dispatchEvent(new CustomEvent('achievement', {
                detail: { id: achievementId, reward: reward }
            }));

            this.save();
        }
    }

    getUnlockedAchievements() {
        return Object.entries(this.data.achievements)
            .filter(([id, data]) => data.unlocked)
            .map(([id, data]) => ({ id, ...data }));
    }

    getLockedAchievements() {
        return Object.entries(this.data.achievements)
            .filter(([id, data]) => !data.unlocked)
            .map(([id, data]) => ({ id, ...data }));
    }
}
