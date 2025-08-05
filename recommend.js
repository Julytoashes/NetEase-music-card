class ShuffleRecommender {
    constructor(songIds) {
        this.originalSongs = [...songIds];
        this.shuffledSongs = [];
        this.currentIndex = 0;
        this.shuffle();
    }

    shuffle() {
        this.shuffledSongs = [...this.originalSongs];
        for (let i = this.shuffledSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledSongs[i], this.shuffledSongs[j]] = [this.shuffledSongs[j], this.shuffledSongs[i]];
        }
        this.currentIndex = 0;
    }

    getNextSongIndex() {
        if (this.currentIndex >= this.shuffledSongs.length) {
            this.shuffle();
        }
        const songId = this.shuffledSongs[this.currentIndex];
        this.currentIndex++;
        return this.originalSongs.indexOf(songId);
    }
}

let recommender = null;

function initRecommender(songIds) {
    recommender = new ShuffleRecommender(songIds);
}



