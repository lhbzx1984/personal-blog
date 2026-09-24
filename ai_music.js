// AI音乐播放器
(function () {
    // 使用全局持久音频元素（跨页面不中断）
    const audio = window.__globalAudio;
    if (!audio) return;

    // 歌曲列表（共享到全局，供切歌逻辑使用）
    const songs = [
        { name: '南墙火焰', artist: '碳基圈', mp3: 'AI音乐/南墙火焰.mp3', lrc: 'AI音乐/南墙火焰.lrc' },
        { name: '平凡的心', artist: '碳基圈', mp3: 'AI音乐/平凡的心-版本2.mp3', lrc: 'AI音乐/平凡的心.lrc' },
        { name: '归人未至', artist: '碳基圈', mp3: 'AI音乐/归人未至.mp3', lrc: 'AI音乐/归人未至.lrc' },
        { name: '心随飞翔', artist: '碳基圈', mp3: 'AI音乐/心随飞翔-版本2.mp3', lrc: 'AI音乐/心随飞翔-版本2.lrc' },
        { name: '校园初恋', artist: '碳基圈', mp3: 'AI音乐/校园初恋.mp3', lrc: 'AI音乐/校园初恋.lrc' },
        { name: '狮驼岭夜关', artist: '碳基圈', mp3: 'AI音乐/狮驼岭夜关-版本2.mp3', lrc: 'AI音乐/狮驼岭夜关-版本2.lrc' },
        { name: '青春永动', artist: '碳基圈', mp3: 'AI音乐/青春永动-版本2.mp3', lrc: 'AI音乐/青春永动-版本2.lrc' },
        { name: 'Saltwater Hands', artist: '碳基圈', mp3: 'AI音乐/Saltwater Hands-版本2.mp3', lrc: 'AI音乐/Saltwater Hands-版本2.lrc' },
        { name: '灯火照不亮胸膛', artist: '碳基圈', mp3: 'AI音乐/灯火照不亮胸膛-版本2.mp3', lrc: 'AI音乐/灯火照不亮胸膛-版本2.lrc' },
        { name: '九月站台', artist: '碳基圈', mp3: 'AI音乐/九月站台.mp3', lrc: 'AI音乐/九月站台.lrc' },
        { name: '楼兰残影', artist: '碳基圈', mp3: 'AI音乐/楼兰残影-版本2.mp3', lrc: 'AI音乐/楼兰残影-版本2.lrc' },
        { name: '四十岁的重量', artist: '碳基圈', mp3: 'AI音乐/四十岁的重量.mp3', lrc: 'AI音乐/四十岁的重量.lrc' }
    ];

    // 共享到全局，供跨页面切歌使用
    window.__music.songs = songs;

    // DOM 元素
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const modeBtn = document.getElementById('modeBtn');
    const modeLabel = document.getElementById('modeLabel');
    const progress = document.getElementById('musicProgress');
    const fill = document.getElementById('musicFill');
    const currentEl = document.getElementById('musicCurrent');
    const durationEl = document.getElementById('musicDuration');
    const disc = document.getElementById('musicDisc');
    const lyricsList = document.getElementById('lyricsList');
    const titleEl = document.getElementById('musicTitle');
    const artistEl = document.getElementById('musicArtist');
    const playlistEl = document.getElementById('playlist');

    // 播放模式: 0=列表循环, 1=单曲循环, 2=顺序播放
    const modes = [
        { icon: '🔁', label: '列表循环' },
        { icon: '🔂', label: '单曲循环' },
        { icon: '➡️', label: '顺序播放' }
    ];
    let mode = 0;
    let currentIndex = -1;
    let lyrics = []; // 带时间戳的歌词行（{time, text}）
    let lyricsLines = []; // 无时间戳时的纯文本行数组
    let hasTimestamp = false; // 当前歌词是否有时间戳
    let currentLine = -1;

    function formatTime(s) {
        if (isNaN(s) || !isFinite(s)) return '00:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    }

    // 解析LRC歌词
    function parseLRC(text) {
        const lines = text.split(/\r?\n/);
        const result = [];
        const reg = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;
        let hasTimestamp = false;
        lines.forEach(line => {
            const matches = [...line.matchAll(reg)];
            if (!matches.length) return;
            const content = line.replace(reg, '').trim();
            if (!content) return;
            matches.forEach(m => {
                const min = parseInt(m[1]);
                const sec = parseInt(m[2]);
                const ms = m[3] ? parseInt(m[3].padEnd(3, '0')) : 0;
                const time = min * 60 + sec + ms / 1000;
                if (time > 0) hasTimestamp = true;
                result.push({ time, text: content });
            });
        });
        result.sort((a, b) => a.time - b.time);
        return { lines: result, hasTimestamp };
    }

    // 提取LRC元数据（标题、歌手）
    function parseMeta(text) {
        const meta = {};
        const ti = text.match(/\[ti:([^\]]+)\]/);
        const ar = text.match(/\[ar:([^\]]+)\]/);
        if (ti) meta.title = ti[1].trim();
        if (ar) meta.artist = ar[1].trim();
        return meta;
    }

    // 渲染歌词（统一逐行渲染，支持高亮和滚动）
    function renderLyrics() {
        if (lyrics.length) {
            // 有时间戳：逐行渲染
            lyricsList.innerHTML = lyrics.map(l =>
                `<div class="lyric-line">${l.text || '...'}</div>`
            ).join('');
        } else if (lyricsLines.length) {
            // 无时间戳：逐行渲染（空行用占位符）
            lyricsList.innerHTML = lyricsLines.map(line =>
                `<div class="lyric-line">${line.trim() ? line : '&nbsp;'}</div>`
            ).join('');
        } else {
            lyricsList.innerHTML = '<div class="lyric-empty">暂无歌词</div>';
        }
        currentLine = -1;
        lyricsList.style.transform = 'translateY(0)';
    }

    // 根据歌曲总时长为无时间戳歌词均匀分配每行时间
    function assignTimestamps() {
        if (hasTimestamp || !lyricsLines.length || !audio.duration || isNaN(audio.duration)) return;
        const total = audio.duration;
        const count = lyricsLines.length;
        // 预留前5秒为前奏，后5秒为尾奏
        const startOffset = Math.min(5, total * 0.1);
        const endOffset = Math.min(5, total * 0.1);
        const available = Math.max(total - startOffset - endOffset, 1);
        const perLine = available / count;
        lyrics = lyricsLines.map((line, i) => ({
            time: startOffset + i * perLine,
            text: line
        }));
    }

    // 加载歌词
    function loadLyrics(song) {
        lyrics = [];
        lyricsLines = [];
        hasTimestamp = false;
        lyricsList.innerHTML = '<div class="lyric-empty">歌词加载中...</div>';

        fetch(song.lrc)
            .then(r => r.ok ? r.text() : Promise.reject('加载失败'))
            .then(text => {
                const meta = parseMeta(text);
                if (meta.title) titleEl.textContent = meta.title;
                if (meta.artist) artistEl.textContent = meta.artist;

                const { lines, hasTimestamp: hasTS } = parseLRC(text);
                hasTimestamp = hasTS;
                if (hasTS && lines.length) {
                    lyrics = lines;
                } else {
                    // 无时间戳，提取纯文本歌词行（去掉元数据标签行）
                    lyricsLines = text
                        .split(/\r?\n/)
                        .map(line => line.trim())
                        .filter(line => {
                            if (!line) return true; // 保留空行作为段落分隔
                            const isMeta = /^\[(ti|ar|al|length|by|re|offset|tool|ve|la|ku|ma|pu|ac|ai|ap|au|co|in|it|se|li):/i.test(line);
                            return !isMeta;
                        });
                    // 去掉首尾的空行
                    while (lyricsLines.length && !lyricsLines[0]) lyricsLines.shift();
                    while (lyricsLines.length && !lyricsLines[lyricsLines.length - 1]) lyricsLines.pop();
                }
                renderLyrics();
                // 尝试分配时间戳（需要audio.duration已加载）
                assignTimestamps();
            })
            .catch(() => {
                lyricsList.innerHTML = '<div class="lyric-empty">歌词加载失败</div>';
            });
    }

    // 渲染歌曲列表
    function renderPlaylist() {
        const items = songs.map((song, i) => `
            <div class="playlist-item" data-index="${i}">
                <span class="playlist-index">${String(i + 1).padStart(2, '0')}</span>
                <div class="playlist-info">
                    <div class="playlist-name">${song.name}</div>
                    <div class="playlist-artist">${song.artist}</div>
                </div>
                <span class="playlist-duration" id="dur-${i}">--:--</span>
            </div>
        `).join('');
        const title = playlistEl.querySelector('.playlist-title');
        playlistEl.innerHTML = '';
        playlistEl.appendChild(title);
        playlistEl.insertAdjacentHTML('beforeend', items);

        playlistEl.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index);
                if (idx === currentIndex) {
                    togglePlay();
                } else {
                    playSong(idx);
                }
            });
        });
    }

    // 更新列表高亮
    function updatePlaylistActive() {
        playlistEl.querySelectorAll('.playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === currentIndex);
        });
    }

    // 播放指定歌曲（调用全局切歌，保证跨页面状态一致）
    function playSong(index) {
        if (index < 0 || index >= songs.length) return;
        currentIndex = index;
        const song = songs[index];
        titleEl.textContent = song.name;
        artistEl.textContent = song.artist;
        updatePlaylistActive();
        loadLyrics(song);
        if (window.__playGlobalSong) window.__playGlobalSong(index);
    }

    // 同步 UI 到当前全局播放状态
    function syncUI() {
        const idx = window.__music.currentIndex;
        if (idx >= 0 && songs[idx]) {
            currentIndex = idx;
            const song = songs[idx];
            titleEl.textContent = song.name;
            artistEl.textContent = song.artist;
            updatePlaylistActive();
            loadLyrics(song);
            if (window.__updateMiniTrack) window.__updateMiniTrack(song.name);
        }
        playBtn.textContent = audio.paused ? '▶' : '⏸';
        disc.classList.toggle('playing', !audio.paused);
    }

    // 播放/暂停
    function togglePlay() {
        if (currentIndex < 0) {
            playSong(0);
            return;
        }
        if (audio.paused) {
            audio.play().catch(() => {});
        } else {
            audio.pause();
        }
    }

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', () => {
        const prev = (currentIndex - 1 + songs.length) % songs.length;
        playSong(prev);
    });
    nextBtn.addEventListener('click', () => {
        const next = (currentIndex + 1) % songs.length;
        playSong(next);
    });

    // 播放模式切换
    modeBtn.addEventListener('click', () => {
        mode = (mode + 1) % modes.length;
        window.__music.mode = mode;
        modeBtn.textContent = modes[mode].icon;
        modeLabel.textContent = modes[mode].label;
        modeBtn.classList.toggle('active', mode === 1);
    });

    // 进度条点击跳转
    progress.addEventListener('click', (e) => {
        const rect = progress.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        if (audio.duration) {
            audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
        }
    });

    // 清理上一次 ai_music.js 运行时绑定的音频监听器（SPA 重复执行时避免重复）
    if (window.__musicCleanup) window.__musicCleanup();

    const onPlay = () => { playBtn.textContent = '⏸'; disc.classList.add('playing'); };
    const onPause = () => { playBtn.textContent = '▶'; disc.classList.remove('playing'); };
    const onLoadedMeta = () => {
        durationEl.textContent = formatTime(audio.duration);
        if (currentIndex >= 0) {
            const durEl = document.getElementById(`dur-${currentIndex}`);
            if (durEl) durEl.textContent = formatTime(audio.duration);
        }
        assignTimestamps();
    };
    const onTimeUpdate = () => {
        const cur = audio.currentTime;
        const dur = audio.duration || 0;
        currentEl.textContent = formatTime(cur);
        fill.style.width = (dur ? (cur / dur) * 100 : 0) + '%';
        updateLyrics(cur);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('timeupdate', onTimeUpdate);

    window.__musicCleanup = () => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('loadedmetadata', onLoadedMeta);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        window.removeEventListener('musicchange', onMusicChange);
    };

    // 全局切歌时同步 UI
    function onMusicChange(e) {
        const { index, song } = e.detail || {};
        if (index != null && songs[index]) {
            currentIndex = index;
            titleEl.textContent = song.name;
            artistEl.textContent = song.artist;
            updatePlaylistActive();
            loadLyrics(song);
        }
    }
    window.addEventListener('musicchange', onMusicChange);

    // 播放模式同步到全局
    window.__music.mode = mode;

    // 歌词同步（仅当有时间戳时）
    function updateLyrics(time) {
        if (!lyrics.length) return;
        let idx = -1;
        for (let i = 0; i < lyrics.length; i++) {
            if (time + 0.2 >= lyrics[i].time) idx = i;
            else break;
        }
        if (idx !== currentLine) {
            currentLine = idx;
            const lineEls = lyricsList.querySelectorAll('.lyric-line');
            lineEls.forEach((l, i) => l.classList.toggle('active', i === idx));
            if (idx >= 0 && lineEls[idx]) {
                const target = lineEls[idx];
                const containerH = lyricsList.parentElement.clientHeight;
                const offset = target.offsetTop - containerH / 2 + target.offsetHeight / 2;
                lyricsList.style.transform = `translateY(${-offset}px)`;
            }
        }
    }

    // 初始化
    renderPlaylist();
    // 若已有全局播放状态（跨页面返回时），同步 UI
    syncUI();
})();
