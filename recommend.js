const RECOMMEND_STORAGE_KEY = 'song_weights';
const ETA = 0.5;
const ALPHA = Math.E;
const MAX_ATTEMPTS = 10;

class Recommender {
    constructor(songIds) {
        this.weights = this.loadWeights(songIds);
        this.songIds = songIds;
        console.log('推荐器初始化：', { songIds, weights: this.weights });
    }

    loadWeights(songIds) {
        const stored = localStorage.getItem(RECOMMEND_STORAGE_KEY);
        const weights = stored ? JSON.parse(stored) : {};
        songIds.forEach(id => {
            if (!weights[id]) weights[id] = 100;
        });
        return weights;
    }

    saveWeights() {
        localStorage.setItem(RECOMMEND_STORAGE_KEY, JSON.stringify(this.weights));
    }

    calculatePred(songId) {
        const N = this.songIds.length;
        const sumWeights = Object.values(this.weights).reduce((sum, w) => sum + w, 0);
        const avgW = N / sumWeights;
        const Wn = this.weights[songId];
        const pred = (100 * Wn) / (avgW + Wn);
        console.log('计算Pred(n)：', { songId, N, sumWeights, avgW, Wn, pred });
        return pred;
    }

    updateWeight(songId, progress) {
        const pred = this.calculatePred(songId);
        const difference = progress - pred;
        const f = Math.log(1 / pred + ALPHA) / Math.log(ALPHA);
        let dW = difference * ETA * f;
        dW = Math.max(-50, Math.min(50, dW));
        const oldWeight = this.weights[songId];
        this.weights[songId] = Math.max(0.01, this.weights[songId] + dW);
        console.log('更新权重：', { songId, progress, pred, difference, f, dW, oldWeight, newWeight: this.weights[songId] });
        this.saveWeights();
    }

    getNextSongIndex(currentIndex) {
        if (this.songIds.length <= 1) return 0;
        const weights = this.songIds.map(id => this.weights[id]);
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let attempts = 0;
        let nextIndex;
        console.log('加权随机选择开始：', { currentIndex, weights, totalWeight });
        do {
            let random = Math.random() * totalWeight;
            nextIndex = 0;
            for (let i = 0; i < weights.length; i++) {
                random -= weights[i];
                if (random <= 0) {
                    nextIndex = i;
                    break;
                }
            }
            console.log('随机尝试：', { attempt: attempts + 1, random, nextIndex });
            attempts++;
        } while (nextIndex === currentIndex && attempts < MAX_ATTEMPTS);
        if (nextIndex === currentIndex) {
            nextIndex = (currentIndex + 1) % this.songIds.length;
        }
        console.log('选择结果：', { nextIndex, isFallback: attempts >= MAX_ATTEMPTS });
        return nextIndex;
    }
}

let recommender = null;

function initRecommender(songIds) {
    recommender = new Recommender(songIds);
}

function updateSongWeight(songId, progress) {
    if (recommender) {
        recommender.updateWeight(songId, progress);
    }
}

function getRecommendedSongIndex(currentIndex) {
    if (recommender) {
        return recommender.getNextSongIndex(currentIndex);
    }
    return (currentIndex + 1) % songs.length;
}