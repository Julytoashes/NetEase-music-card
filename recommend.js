class RandomRecommender {
    constructor(songIds) {
        this.songIds = songIds;
        console.log('纯随机推荐器初始化：', { songIds });
    }

    getNextSongIndex(currentIndex) {
        if (this.songIds.length <= 1) return 0;
        
        let nextIndex;
        let attempts = 0;
        const MAX_ATTEMPTS = 3; // 减少尝试次数，因为不需要计算权重
        
        do {
            nextIndex = Math.floor(Math.random() * this.songIds.length);
            attempts++;
        } while (nextIndex === currentIndex && attempts < MAX_ATTEMPTS);
        
        if (nextIndex === currentIndex) {
            nextIndex = (currentIndex + 1) % this.songIds.length;
        }
        
        return nextIndex;
    }
}

let recommender = null;

function initRecommender(songIds) {
    recommender = new RandomRecommender(songIds);
}

function updateSongWeight(songId, progress) {
    // 纯随机版本不需要此功能
}

function getRecommendedSongIndex(currentIndex) {
    if (recommender) {
        return recommender.getNextSongIndex(currentIndex);
    }
    return (currentIndex + 1) % songs.length;
}
