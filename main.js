const urlParams = new URLSearchParams(window.location.search);
const songParam = urlParams.get('id');
const playlistParam = urlParams.get('playlist');
const themeColor = urlParams.get('themeColor') || '#1db954';
const theme = urlParams.get('theme') || 'dark';
const audio = document.getElementById('audio');
const cover = document.getElementById('cover');
const title = document.getElementById('song-title');
const artist = document.getElementById('song-artist');
const elapsed = document.getElementById('elapsed');
const timeNow = document.getElementById('time_now');
const timeFull = document.getElementById('time_full');
const playPauseButton = document.getElementById('playpause');
const playPauseIcon = document.getElementById('playpause-icon');
const volumeButton = document.getElementById('volume_button');
const volume = document.getElementById('volume');
const volumeCircle = document.getElementById('volume-circle');
const volumeFill = document.getElementById('volume-fill');
const volumeSlider = volume.querySelector('.slider');
const timeBar = document.getElementById('time-bar');
const card = document.querySelector('.card');
let playIndex = 0;
let playMode = 'recommend'; // none, loop, recommend
let songs = [];
let isVolumeOpen = false;
let isDragging = false;
let isVolumeDragging = false;
let lastProgress = 0;

function animateChange() {
    cover.classList.add('animate');
    title.classList.add('animate');
    artist.classList.add('animate');
    setTimeout(() => {
        cover.classList.remove('animate');
        title.classList.remove('animate');
        artist.classList.remove('animate');
    }, 600);
}

function isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    if (s.color !== '') return true;
    return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color);
}

function rgbToHex(color) {
    if (color.startsWith('rgb')) {
        const rgb = color.match(/\d+/g).map(Number);
        return `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1).padStart(6, '0')}`;
    }
    return color;
}

const validColor = isValidColor(themeColor) ? rgbToHex(themeColor) : '#1db954';
document.documentElement.style.setProperty('--theme-color', validColor);

if (theme.toLowerCase() === 'light') {
    document.documentElement.style.setProperty('--bg-color', '#ffffff');
    document.documentElement.style.setProperty('--text-color', '#000000');
    document.documentElement.style.setProperty('--card-bg-color', '#f0f0f0');
    document.documentElement.style.setProperty('--slider-bg-color', '#a0a0a0');
    document.documentElement.style.setProperty('--overlay-color', 'rgba(255, 255, 255, 0.5)');
} else {
    document.documentElement.style.setProperty('--bg-color', '#191414');
    document.documentElement.style.setProperty('--text-color', '#1d1d5c');
    document.documentElement.style.setProperty('--card-bg-color', '#151515');
    document.documentElement.style.setProperty('--slider-bg-color', '#5e5e5e');
    document.documentElement.style.setProperty('--overlay-color', 'rgba(0, 0, 0, 0.5)');
}

audio.volume = 1.0;
volumeFill.style.width = '100%';
volumeCircle.style.right = '0%';

const playPath = "M12 21.6a9.6 9.6 0 1 0 0-19.2 9.6 9.6 0 0 0 0 19.2Zm-2.4-12a1.2 1.2 0 0 1 2.4-.848l3.6 2.4a1.2 1.2 0 0 1 0 2.096l-3.6 2.4a1.2 1.2 0 0 1-2.4-.848V9.6Z";
const pausePath = "M21.6 12a9.6 9.6 0 1 1-19.2 0 9.6 9.6 0 0 1 19.2 0ZM8.4 9.6a1.2 1.2 0 1 1 2.4 0v4.8a1.2 1.2 0 1 1-2.4 0V9.6Zm6-1.2a1.2 1.2 0 0 0-1.2 1.2v4.8a1.2 1.2 0 0 0 2.4 0V9.6a1.2 1.2 0 0 0-1.2-1.2Z";

function checkTextOverflow() {
    const titleWidth = title.scrollWidth;
    const artistWidth = artist.scrollWidth;
    const textContainerWidth = document.querySelector('.texts').offsetWidth;
    if (titleWidth > textContainerWidth) {
        title.classList.add('scroll');
        title.innerText = title.innerText + ' ';
    } else {
        title.classList.remove('scroll');
        title.innerText = title.innerText.trim();
    }
    if (artistWidth > textContainerWidth) {
        artist.classList.add('scroll');
        artist.innerText = artist.innerText + ' ';
    } else {
        artist.classList.remove('scroll');
        artist.innerText = artist.innerText.trim();
    }
}

audio.addEventListener('play', () => {
    playPauseIcon.setAttribute('d', pausePath);
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "playing";
    }
});

audio.addEventListener('pause', () => {
    playPauseIcon.setAttribute('d', playPath);
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "paused";
    }
});
playPauseButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

timeBar.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    updateProgress(e);
});
document.addEventListener('mousemove', (e) => {
    if (isDragging) updateProgress(e);
});
document.addEventListener('mouseup', (e) => {
    if (isDragging) {
        updateProgress(e);
        isDragging = false;
    }
});

function updateProgress(e) {
    const rect = timeBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (!isNaN(audio.duration)) {
        audio.currentTime = percent * audio.duration;
    }
}

volumeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    isVolumeOpen = !isVolumeOpen;
    volume.classList.toggle('show', isVolumeOpen);
});

document.addEventListener('click', (e) => {
    if (!volume.contains(e.target) && e.target !== volumeButton) {
        isVolumeOpen = false;
        volume.classList.remove('show');
    }
});

volumeSlider.addEventListener('click', (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    volumeFill.style.width = `${percent * 100}%`;
    volumeCircle.style.right = `${(1 - percent) * 100}%`;
    audio.volume = percent;
});

volumeCircle.addEventListener('mousedown', () => isVolumeDragging = true);
document.addEventListener('mousemove', (e) => {
    if (isVolumeDragging) {
        const rect = volumeSlider.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        volumeFill.style.width = `${percent * 100}%`;
        volumeCircle.style.right = `${(1 - percent) * 100}%`;
        audio.volume = percent;
    }
});
document.addEventListener('mouseup', () => isVolumeDragging = false);

document.getElementById('loop_toggle').addEventListener('click', () => {
    if (playMode === 'none') {
        playMode = 'loop';
        document.getElementById('loop_toggle').style.color = '#ba5757';
    } else if (playMode === 'loop') {
        playMode = 'recommend';
        document.getElementById('loop_toggle').style.color = '#1d1d5c';
    } else {
        playMode = 'none';
        document.getElementById('loop_toggle').style.color = '';
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (playMode === 'recommend') {
        updateSongWeight(songs[playIndex], lastProgress * 100);
        playIndex = getRecommendedSongIndex(playIndex);
    } else if (playIndex < songs.length - 1) {
        playIndex++;
    } else {
        playIndex = 0;
    }
    loadSong();
});

document.getElementById('prev').addEventListener('click', () => {
    if (playIndex > 0) {
        playIndex--;
    } else {
        playIndex = songs.length - 1;
    }
    loadSong();
});

audio.addEventListener('ended', () => {
    if (playMode === 'recommend') {
        updateSongWeight(songs[playIndex], lastProgress * 100);
        playIndex = getRecommendedSongIndex(playIndex);
        loadSong();
    } else if (playMode === 'loop') {
        audio.currentTime = 0;
        audio.play();
    } else if (playIndex < songs.length - 1) {
        playIndex++;
        loadSong();
    } else {
        playIndex = 0;
        loadSong();
    }
});

audio.addEventListener('timeupdate', () => {
    const percent = audio.currentTime / audio.duration;
    elapsed.style.width = `${percent * 100}%`;
    timeNow.innerText = formatTime(audio.currentTime);
    timeFull.innerText = formatTime(audio.duration);
    lastProgress = percent; // 跟踪收听进度
    
    // 更新 Media Session 的播放位置
  if ('mediaSession' in navigator && audio.duration) { // 检查 duration 是否可用
            navigator.mediaSession.setPositionState({
                duration: audio.duration,
                position: audio.currentTime,
                playbackRate: audio.playbackRate
            });
        }
    });
    
    
// 添加 postMessage 监听器
window.addEventListener('message', (event) => {
    if (event.data.type === 'getPlaybackState') {
        window.parent.postMessage({
            type: 'playbackState',
            currentTime: audio.currentTime,
            isPlaying: !audio.paused,
            songId: songs[playIndex],
            duration: audio.duration || 0
        }, '*');
    } else if (event.data.type === 'setPlaybackState') {
        const { currentTime, isPlaying, songId } = event.data;
        if (songId && songId !== songs[playIndex]) {
            playIndex = songs.indexOf(songId);
            if (playIndex === -1) {
                playIndex = 0;
            }
            loadSong().then(() => {
                audio.onloadedmetadata = () => {
                    timeFull.innerText = formatTime(audio.duration);
                    if (currentTime >= 0 && currentTime <= audio.duration) {
                        audio.currentTime = currentTime;
                    }
                    if (isPlaying) {
                        audio.play().then(() => {
                            playPauseIcon.setAttribute('d', pausePath);
                            window.parent.postMessage({ type: 'playbackStatus', isPlaying: true }, '*');
                        }).catch(() => {
                            playPauseIcon.setAttribute('d', playPath);
                            window.parent.postMessage({ type: 'playbackStatus', isPlaying: false }, '*');
                        });
                    } else {
                        audio.pause();
                        playPauseIcon.setAttribute('d', playPath);
                        window.parent.postMessage({ type: 'playbackStatus', isPlaying: false }, '*');
                    }
                };
            });
        } else {
            if (currentTime >= 0 && currentTime <= audio.duration) {
                audio.currentTime = currentTime;
            }
            if (isPlaying) {
                audio.play().then(() => {
                    playPauseIcon.setAttribute('d', pausePath);
                    window.parent.postMessage({ type: 'playbackStatus', isPlaying: true }, '*');
                }).catch(() => {
                    playPauseIcon.setAttribute('d', playPath);
                    window.parent.postMessage({ type: 'playbackStatus', isPlaying: false }, '*');
                });
            } else {
                audio.pause();
                playPauseIcon.setAttribute('d', playPath);
                window.parent.postMessage({ type: 'playbackStatus', isPlaying: false }, '*');
            }
        }
    }
});
    
    
function formatTime(t) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

async function fetchSongs() {
    if (playlistParam) {
        const res = await fetch(`https://163api.qijieya.cn/playlist/track/all?id=${playlistParam}&limit=100&offset=0`);
        const json = await res.json();
        songs = json.songs.map(s => s.id);
        // 缓存第一首歌的信息
        const detail = await fetch(`https://163api.qijieya.cn/song/detail?ids=${songs[0]}`);
        const detailJson = await detail.json();
        const song = detailJson.songs[0];
        window.parent.postMessage({
            type: 'songInfo',
            songId: songs[0],
            title: song.name,
            artist: song.ar.map(artist => artist.name).join(', '),
            coverUrl: song.al.picUrl.replace('http://', 'https://') + '?param=256x256'
        }, '*');
    } else if (songParam) {
        songs = songParam.split(',');
    }
    initRecommender(songs);
    playMode = 'recommend';
    document.getElementById('loop_toggle').style.color = '#1d1d5c';
    setupMediaControls();
    loadSong();
}

// 设置 Media Session 控制（上一首/下一首/播放/暂停）
function setupMediaControls() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
            audio.play();
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
            audio.pause();
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            // 调用你的 "上一首" 逻辑
            if (playIndex > 0) playIndex--;
            else playIndex = songs.length - 1;
            loadSong();
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            // 调用你的 "下一首" 逻辑
            if (playMode === 'recommend') {
                updateSongWeight(songs[playIndex], lastProgress * 100);
                playIndex = getRecommendedSongIndex(playIndex);
            } else if (playIndex < songs.length - 1) {
                playIndex++;
            } else {
                playIndex = 0;
            }
            loadSong();
        });
    }
}

// 修改 loadSong 函数以支持封面图和播放状态
async function loadSong() {
    const id = songs[playIndex];
    const detail = await fetch(`https://163api.qijieya.cn/song/detail?ids=${id}`);
    const detailJson = await detail.json();
    const song = detailJson.songs[0];
    animateChange();
    title.innerText = song.name;
    artist.innerText = song.ar.map(artist => artist.name).join(', ');
    cover.src = song.al.picUrl;
    card.style.backgroundImage = `url(${song.al.picUrl})`;
    checkTextOverflow();
    const urlRes = await fetch(`https://163api.qijieya.cn/song/url/v1?id=${id}&level=jymaster`);
    const urlJson = await urlRes.json();
    audio.src = urlJson.data[0].url;

    // 重置音频状态
    audio.currentTime = 0;
    audio.pause();
    elapsed.style.width = '0%';
    timeNow.innerText = '0:00';
    timeFull.innerText = '0:00';

    audio.onloadedmetadata = () => {
        timeFull.innerText = formatTime(audio.duration);
    };

    audio.oncanplay = () => {
        if ('mediaSession' in navigator && audio.duration > 0 && !isNaN(audio.duration)) {
            navigator.mediaSession.setPositionState({
                duration: audio.duration,
                position: audio.currentTime,
                playbackRate: audio.playbackRate
            });
        }
        // 自动播放（根据父页面指令决定）
        audio.play().then(() => {
            playPauseIcon.setAttribute('d', pausePath);
        }).catch(() => {
            playPauseIcon.setAttribute('d', playPath);
        });
    };

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.ar.map(artist => artist.name).join(', '),
            album: song.al.name,
            artwork: [
                { src: song.al.picUrl.replace('http://', 'https://') + '?param=96x96', sizes: '96x96' },
                { src: song.al.picUrl.replace('http://', 'https://') + '?param=128x128', sizes: '128x128' },
                { src: song.al.picUrl.replace('http://', 'https://') + '?param=192x192', sizes: '192x192' },
                { src: song.al.picUrl.replace('http://', 'https://') + '?param=256x256', sizes: '256x256' },
                { src: song.al.picUrl.replace('http://', 'https://') + '?param=384x384', sizes: '384x384' },
                { src: song.al.picUrl.replace('http://', 'https://') + '?param=512x512', sizes: '512x512' },
            ]
        });
    }

    // 通知父页面歌曲信息（封面图、标题等）
    window.parent.postMessage({
        type: 'songInfo',
        songId: id,
        title: song.name,
        artist: song.ar.map(artist => artist.name).join(', '),
        coverUrl: song.al.picUrl.replace('http://', 'https://') + '?param=256x256'
    }, '*');
}
    
    // 移除自动播放的尝试
    playPauseIcon.setAttribute('d', playPath); // 确保显示播放图标
}

// 移除 tryPlay() 函数，因为不再需要它



fetchSongs();
