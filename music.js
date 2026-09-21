        (function() {
            const audio = document.getElementById('bgMusic');
            if (!audio) return;
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
            const lyricsContainer = lyricsList.parentElement;
            const autoplayHint = document.getElementById('autoplayHint');

            // 播放模式: 0=列表循环, 1=单曲循环, 2=顺序播放
            const modes = [
                { icon: '🔁', label: '列表循环' },
                { icon: '🔂', label: '单曲循环' },
                { icon: '➡️', label: '顺序播放' }
            ];
            let mode = 0;
            let lyrics = [];
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
                lines.forEach(line => {
                    const matches = [...line.matchAll(reg)];
                    if (!matches.length) return;
                    const content = line.replace(reg, '').trim();
                    matches.forEach(m => {
                        const min = parseInt(m[1]);
                        const sec = parseInt(m[2]);
                        const ms = m[3] ? parseInt(m[3].padEnd(3, '0')) : 0;
                        result.push({ time: min * 60 + sec + ms / 1000, text: content });
                    });
                });
                result.sort((a, b) => a.time - b.time);
                return result;
            }

            function renderLyrics() {
                if (!lyrics.length) {
                    lyricsList.innerHTML = '<div class="lyric-empty">暂无歌词<br>请将LRC歌词内容填入下方 EMBEDDED_LRC 变量</div>';
                    lyricsList.style.transform = 'translateY(0)';
                    return;
                }
                lyricsList.innerHTML = lyrics.map(l =>
                    `<div class="lyric-line">${l.text || '...'}</div>`
                ).join('');
                currentLine = -1;
                lyricsList.style.transform = 'translateY(0)';
            }

            // 内嵌歌词:静态主页(file://协议)下无法用fetch加载外部LRC,
            // 故将LRC文本直接内嵌于此。
            const EMBEDDED_LRC = `
[ti:无名的人]
[ar:毛不易]
[al:雄狮少年 电影主题曲]
[00:00.00]无名的人 (《雄狮少年》电影主题曲) - 毛不易
[00:02.28]词：唐恬 TIAN TANG
[00:02.46]曲：钱雷 LEI QIAN
[00:02.64]编曲：钱雷 LEI QIAN
[00:02.85]编曲：钱雷 LEI QIAN
[00:03.04]制作人：钱雷 LEI QIAN
[00:03.27]吉他：高飞 FEI GAO
[00:03.45]吉他录音师：付威 WEI FU
[00:03.75]吉他录音室：Legend（来真的·北京）Recording Studio
[00:04.20]Bass：李卓 ZHUO LI
[00:04.37]人声录音师：李宗远 ZONGYUAN LI@Studio 21A
[00:04.74]人声录音棚：Studio 21A Beijing
[00:05.00]声乐编辑：汝文博 WENBO RU@SBMS BEIJING
[00:05.33]配唱制作：钱雷 LEI QIAN
[00:05.58]和音：毛不易 BUYI MAO
[00:05.82]混音&母带：赵靖 JING ZHAO BIG.J@SBMS Beijing
[00:06.19]曲版权管理方：索尼音乐版权代理（北京）有限公司
[00:06.83]电影原声发行：太合麦田（天津）音乐有限公司
[00:07.46]出品人：钱实穆
[00:07.63]总监制：徐毅
[00:07.82]监制：胡译友
[00:07.98]音乐发行：太合麦田
[00:08.24]行销策略：武鹏
[00:08.43]音乐制作总监：蔡庭贵
[00:08.74]项目统筹：闫曼嘉
[00:08.96]项目协力：李艺佳/李靖
[00:09.25]宣传：北京很有可能文化传播有限公司：金朝顺/沈雨娟/张倩玉/夏童/田贝贝/汪斯遥/丁敏
[00:17.00]我是这路上 没名字的人
[00:24.05]我没有新闻 没有人评论
[00:31.21]要拼尽所有 换得普通的剧本
[00:38.21]曲折辗转 不过谋生
[00:44.75]我是离开 小镇上的人
[00:52.03]是哭笑着 吃过饭的人
[00:59.67]是赶路的人 是养家的人
[01:06.76]是城市背景的 无声
[01:13.97]我不过 想亲手触摸
[01:16.57]弯过腰的每一刻
[01:19.70]留下的 湿透的脚印 是不是值得
[01:28.20]这哽咽 若你也相同
[01:30.84]就是同路的朋友
[01:34.06]致所有 顶天立地却 平凡普通的
[01:57.14]无名的人啊 我敬你一杯酒
[02:00.42]敬你的沉默 和每一声怒吼
[02:03.98]敬你弯着腰 上山往高处走
[02:07.57]头顶 苍穹 努力地生活
[02:11.24]你来自于 南方的村落
[02:13.81]来自粗糙的双手
[02:16.96]你站在 楼宇的缝隙
[02:20.06]可你没有退缩
[02:25.49]我来自于 北方的春天
[02:28.12]来自一步一回首
[02:31.30]背后有 告别的路口
[02:34.36]温暖每个日落
[02:38.45]当家乡入冬 的时候
[02:40.62]列车到站 以后
[02:42.47]小时候的风 再吹过
[02:45.50]回忆起单纯 的快乐
[02:47.62]在熟悉的 街头
[02:49.53]有人 会用所有的温柔 喊出你的
[02:56.40]名字
[02:57.75]离家的人啊 我敬你一杯酒
[03:01.25]敬你的沉默 和每一声怒吼
[03:04.84]敬你弯着腰 上山往高处走
[03:08.40]头顶 苍穹 努力地生活
[03:12.05]无名的人啊 我敬你一杯酒
[03:15.53]敬你的沉默 和每一声怒吼
[03:19.15]敬你弯着腰 上山往高处走
[03:22.75]头顶 苍穹 努力地生活
[03:26.44]无名的人啊
[03:40.75]无名的人啊
[03:55.08]无名的人啊 车来啦
[04:02.33]太多牵挂就 别回头啊
[04:09.53]无名的人啊 车开啦
[04:16.64]往前吧 带着你的梦
`;
            // 解析内嵌LRC(无需网络请求,兼容静态主页)
            try {
                lyrics = parseLRC(EMBEDDED_LRC);
            } catch (e) {
                lyrics = [];
            }
            renderLyrics();

            function togglePlay() {
                if (audio.paused) {
                    audio.play().catch(() => showAutoplayHint());
                } else {
                    audio.pause();
                }
            }

            playBtn.addEventListener('click', togglePlay);

            audio.addEventListener('play', () => {
                playBtn.textContent = '⏸';
                disc.classList.add('playing');
                hideAutoplayHint();
            });
            audio.addEventListener('pause', () => {
                playBtn.textContent = '▶';
                disc.classList.remove('playing');
            });
            audio.addEventListener('loadedmetadata', () => {
                durationEl.textContent = formatTime(audio.duration);
            });

            // 音频加载/播放失败提示
            function showAudioError(msg) {
                lyricsList.innerHTML = `<div class="lyric-empty" style="color:#ff6b6b">${msg}</div>`;
                playBtn.textContent = '▶';
                disc.classList.remove('playing');
                durationEl.textContent = '00:00';
                currentEl.textContent = '00:00';
                fill.style.width = '0%';
            }
            audio.addEventListener('error', () => {
                showAudioError('音频加载失败<br>请确认「无名的人-毛不易.mp3」文件存在且非空');
            });
            // 主动检测空文件(0字节时 duration 为 NaN)
            audio.addEventListener('loadedmetadata', () => {
                if (!audio.duration || isNaN(audio.duration)) {
                    showAudioError('音频文件无效或为空<br>请替换为有效的 MP3 文件');
                }
            });

            audio.addEventListener('timeupdate', () => {
                const cur = audio.currentTime;
                const dur = audio.duration || 0;
                currentEl.textContent = formatTime(cur);
                fill.style.width = (dur ? (cur / dur) * 100 : 0) + '%';
                updateLyrics(cur);
            });

            audio.addEventListener('ended', () => {
                if (mode === 1) {
                    // 单曲循环
                    audio.currentTime = 0;
                    audio.play().catch(() => {});
                } else if (mode === 0) {
                    // 列表循环(仅一首,重新播放)
                    audio.currentTime = 0;
                    audio.play().catch(() => {});
                } else {
                    // 顺序播放(停止)
                    playBtn.textContent = '▶';
                    disc.classList.remove('playing');
                    fill.style.width = '0%';
                    currentEl.textContent = '00:00';
                    currentLine = -1;
                    lyricsList.style.transform = 'translateY(0)';
                    lyricsList.querySelectorAll('.lyric-line').forEach(l => l.classList.remove('active'));
                }
            });

            // 进度条点击跳转
            progress.addEventListener('click', (e) => {
                const rect = progress.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                if (audio.duration) {
                    audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
                }
            });

            // 播放模式切换
            modeBtn.addEventListener('click', () => {
                mode = (mode + 1) % modes.length;
                modeBtn.textContent = modes[mode].icon;
                modeLabel.textContent = modes[mode].label;
                modeBtn.classList.toggle('active', mode === 1);
            });

            prevBtn.addEventListener('click', () => {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            });
            nextBtn.addEventListener('click', () => {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            });

            // 歌词同步与滚动
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
                        const containerH = lyricsContainer.clientHeight;
                        const offset = target.offsetTop - containerH / 2 + target.offsetHeight / 2;
                        lyricsList.style.transform = `translateY(${-offset}px)`;
                    } else if (idx < 0) {
                        lyricsList.style.transform = 'translateY(0)';
                    }
                }
            }

            // 自动播放: 浏览器策略可能阻止,提供降级提示
            function showAutoplayHint() {
                if (autoplayHint) autoplayHint.classList.add('show');
            }
            function hideAutoplayHint() {
                if (autoplayHint) autoplayHint.classList.remove('show');
            }

            if (autoplayHint) {
                autoplayHint.addEventListener('click', () => {
                    audio.play().then(hideAutoplayHint).catch(() => {});
                });
            }

            // 页面加载后尝试自动播放
            function startAutoplay() {
                audio.play().then(hideAutoplayHint).catch(() => {
                    showAutoplayHint();
                });
            }

            window.addEventListener('load', () => {
                setTimeout(startAutoplay, 800);
            });

            // 若自动播放被阻止,监听首次用户交互启动
            function interactStart() {
                if (audio.paused) {
                    audio.play().then(() => {
                        hideAutoplayHint();
                    }).catch(() => {});
                }
                document.removeEventListener('click', interactStart);
                document.removeEventListener('keydown', interactStart);
                document.removeEventListener('touchstart', interactStart);
            }
            document.addEventListener('click', interactStart);
            document.addEventListener('keydown', interactStart);
            document.addEventListener('touchstart', interactStart);
        })();