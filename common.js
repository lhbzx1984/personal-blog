        function drawAvatar() {
            const avatarCanvas = document.getElementById('avatar-canvas');
            if (avatarCanvas) {
                const ctx = avatarCanvas.getContext('2d');
                const centerX = avatarCanvas.width / 2;
                const centerY = avatarCanvas.height / 2;
                const radius = Math.min(centerX, centerY);
                
                const gradient = ctx.createRadialGradient(centerX - 20, centerY - 20, 0, centerX, centerY, radius);
                gradient.addColorStop(0, '#1a1a25');
                gradient.addColorStop(1, '#0a0a0f');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = '#00f5ff';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                ctx.shadowColor = '#00f5ff';
                ctx.shadowBlur = 15;
                
                ctx.font = 'bold 60px Arial, sans-serif';
                ctx.fillStyle = '#00f5ff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('刘', centerX, centerY);
                
                ctx.shadowBlur = 0;
            }
        }
        
        drawAvatar();
        
        const canvas = document.getElementById('particles-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 80;
        const connectionDistance = 150;
        const mouseRadius = 100;

        let mouse = {
            x: null,
            y: null
        };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = Math.random() > 0.5 ? '#00f5ff' : '#ff00aa';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (mouse.x && mouse.y) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouseRadius) {
                        const force = (mouseRadius - distance) / mouseRadius;
                        this.x -= dx * force * 0.02;
                        this.y -= dy * force * 0.02;
                    }
                }

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = 1 - distance / connectionDistance;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 245, 255, ${opacity * 0.3})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();

        const cursor = document.querySelector('.cursor');
        const cursorDot = document.querySelector('.cursor-dot');

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            cursorDot.style.left = e.clientX - 3 + 'px';
            cursorDot.style.top = e.clientY - 3 + 'px';
        });

        const interactiveElements = document.querySelectorAll('a, button, .skill-card, .project-card, .blog-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });

        const skillBars = document.querySelectorAll('.skill-progress');
        const observerOptions = {
            threshold: 0.5
        };

        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const width = entry.target.dataset.width;
                    entry.target.style.width = width + '%';
                }
            });
        }, observerOptions);

        skillBars.forEach(bar => skillObserver.observe(bar));

        const statNumbers = document.querySelectorAll('.stat-number');
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.count);
                    let current = 0;
                    const increment = target / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            entry.target.textContent = target + '+';
                            clearInterval(timer);
                        } else {
                            entry.target.textContent = Math.floor(current) + '+';
                        }
                    }, 30);
                    statObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        statNumbers.forEach(num => statObserver.observe(num));

        const sections = document.querySelectorAll('.section');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'all 0.8s ease';
            sectionObserver.observe(section);
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

/* ============================================================
   全局持久音频 + 迷你播放条 + SPA 无刷新路由
   目的：切换页面时音乐不中断
   ============================================================ */
(function () {
    'use strict';

    // ---- 全局音频元素（持久，不随页面切换销毁） ----
    const globalAudio = document.createElement('audio');
    globalAudio.id = 'globalAudio';
    globalAudio.preload = 'auto';
    document.body.appendChild(globalAudio);
    window.__globalAudio = globalAudio;

    // 全局音乐状态（供 ai_music.js 同步）
    window.__music = {
        songs: [],
        currentIndex: -1,
        mode: 0
    };

    // ---- 迷你播放条（固定底部） ----
    const miniBar = document.createElement('div');
    miniBar.id = 'miniPlayer';
    miniBar.innerHTML = `
        <div class="mini-track" id="miniTrack">未在播放</div>
        <div class="mini-progress"><div class="mini-progress-fill" id="miniFill"></div></div>
        <button class="mini-btn" id="miniPlay" title="播放/暂停">▶</button>
        <button class="mini-btn" id="miniOpen" title="打开播放器">🎵</button>
    `;
    document.body.appendChild(miniBar);

    const miniTrack = document.getElementById('miniTrack');
    const miniFill = document.getElementById('miniFill');
    const miniPlay = document.getElementById('miniPlay');
    const miniOpen = document.getElementById('miniOpen');

    miniPlay.addEventListener('click', () => {
        if (globalAudio.paused) globalAudio.play().catch(() => {});
        else globalAudio.pause();
    });
    miniOpen.addEventListener('click', () => {
        if (location.pathname.endsWith('ai_music.html')) {
            document.querySelector('.music-section')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            spaNavigate('ai_music.html');
        }
    });

    globalAudio.addEventListener('play', () => { miniPlay.textContent = '⏸'; });
    globalAudio.addEventListener('pause', () => { miniPlay.textContent = '▶'; });
    globalAudio.addEventListener('timeupdate', () => {
        const dur = globalAudio.duration || 0;
        miniFill.style.width = (dur ? (globalAudio.currentTime / dur) * 100 : 0) + '%';
    });
    // 全局切歌函数（供 ai_music.js 与 ended 事件调用）
    function playGlobalSong(index) {
        const songs = window.__music.songs;
        if (!songs || index < 0 || index >= songs.length) return;
        const song = songs[index];
        window.__music.currentIndex = index;
        globalAudio.src = song.mp3;
        if (window.__updateMiniTrack) window.__updateMiniTrack(song.name);
        globalAudio.play().catch(() => {});
        // 通知当前页面 UI 同步
        window.dispatchEvent(new CustomEvent('musicchange', { detail: { index, song } }));
    }
    window.__playGlobalSong = playGlobalSong;

    globalAudio.addEventListener('ended', () => {
        const m = window.__music;
        const songs = m.songs;
        if (!songs || !songs.length || m.currentIndex < 0) return;
        if (m.mode === 1) {
            // 单曲循环
            globalAudio.currentTime = 0;
            globalAudio.play().catch(() => {});
        } else if (m.mode === 0) {
            // 列表循环
            playGlobalSong((m.currentIndex + 1) % songs.length);
        } else {
            // 顺序播放
            if (m.currentIndex < songs.length - 1) {
                playGlobalSong(m.currentIndex + 1);
            }
        }
    });

    function updateMiniTrack(name) {
        miniTrack.textContent = name || '未在播放';
    }
    window.__updateMiniTrack = updateMiniTrack;

    // 迷你播放条样式（注入一次）
    if (!document.getElementById('miniPlayerStyle')) {
        const s = document.createElement('style');
        s.id = 'miniPlayerStyle';
        s.textContent = `
            #miniPlayer{position:fixed;left:50%;bottom:0;transform:translateX(-50%);z-index:9997;
                display:flex;align-items:center;gap:10px;padding:6px 16px;
                background:rgba(10,10,15,0.92);border:1px solid rgba(0,245,255,0.25);
                border-bottom:none;border-radius:12px 12px 0 0;
                box-shadow:0 -4px 20px rgba(0,0,0,0.5);width:min(560px,92vw);}
            #miniPlayer .mini-track{flex:1;font-size:12px;color:#e8e8ec;white-space:nowrap;
                overflow:hidden;text-overflow:ellipsis;font-family:'JetBrains Mono',monospace;}
            #miniPlayer .mini-progress{flex:0 0 90px;height:4px;background:rgba(255,255,255,0.12);
                border-radius:2px;overflow:hidden;}
            #miniPlayer .mini-progress-fill{height:100%;width:0;
                background:linear-gradient(90deg,#00f5ff,#ff00aa);transition:width .15s linear;}
            #miniPlayer .mini-btn{background:rgba(0,245,255,0.12);border:1px solid rgba(0,245,255,0.3);
                color:#00f5ff;width:28px;height:28px;border-radius:50%;cursor:pointer;
                font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .2s;}
            #miniPlayer .mini-btn:hover{background:rgba(0,245,255,0.28);}
            @media(max-width:560px){#miniPlayer .mini-progress{display:none;}}
        `;
        document.head.appendChild(s);
    }

    // ---- SPA 无刷新路由 ----
    function isInternalLink(href) {
        if (!href) return false;
        try {
            const url = new URL(href, location.href);
            if (url.origin !== location.origin) return false;
            if (url.pathname.endsWith('.html')) return true;
            return false;
        } catch (e) { return false; }
    }

    // 重新执行页面脚本（跳过 common.js）
    function runPageScripts(doc) {
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(old => {
            if (old.src && old.src.includes('common.js')) return;
            const s = document.createElement('script');
            if (old.src) {
                s.src = old.src;
                // 外部脚本：插入后让浏览器加载执行，稍后再清理节点
                document.body.appendChild(s);
                s.onload = () => s.remove();
            } else {
                s.textContent = old.textContent;
                document.body.appendChild(s);
                s.remove(); // 内联脚本执行后可立即移除
            }
        });
    }

    // 清除旧页面专属 <style>，应用新页面的 <style>
    function swapPageStyles(newDoc) {
        document.querySelectorAll('head style[data-page-style]').forEach(s => s.remove());
        newDoc.querySelectorAll('head style').forEach(st => {
            const clone = st.cloneNode(true);
            clone.setAttribute('data-page-style', '1');
            document.head.appendChild(clone);
        });
    }

    async function spaNavigate(url, pushHistory) {
        // 显示加载态
        document.body.style.opacity = '0.5';
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('fetch failed');
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            document.title = doc.title;

            // 替换 .main-container 中 <nav> 之后的内容
            const mainContainer = document.querySelector('.main-container');
            const nav = mainContainer.querySelector('nav');
            const newMain = doc.querySelector('.main-container');
            const newNav = newMain ? newMain.querySelector('nav') : null;

            if (mainContainer && nav && newMain && newNav) {
                while (nav.nextSibling) mainContainer.removeChild(nav.nextSibling);
                while (newNav.nextSibling) mainContainer.appendChild(newNav.nextSibling);
            } else {
                // 兜底：替换整个 body 内容（保留持久元素）
                location.href = url;
                return;
            }

            swapPageStyles(doc);

            if (pushHistory !== false) {
                history.pushState({ url }, '', url);
            }

            // 滚动到顶部
            window.scrollTo(0, 0);

            // 重新执行页面脚本
            runPageScripts(doc);

        } catch (e) {
            console.warn('SPA 导航失败，回退到整页跳转:', e);
            location.href = url;
        } finally {
            document.body.style.opacity = '1';
        }
    }
    window.spaNavigate = spaNavigate;

    // 拦截站内链接点击
    document.addEventListener('click', (e) => {
        if (e.defaultPrevented) return;
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href) return;
        if (a.target === '_blank' || a.hasAttribute('download')) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (isInternalLink(href)) {
            e.preventDefault();
            spaNavigate(href, true);
        }
    });

    // 浏览器前进/后退
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.url) {
            spaNavigate(e.state.url, false);
        }
    });
})();