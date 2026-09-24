// 优秀校友 3D 环形旋转展示
(function () {
    const ringContainer = document.getElementById('ringContainer');
    if (!ringContainer) return;

    // 校友数据（10个位置，第1位是刘源，其余待填充）
    const alumni = [
        {
            name: '刘源',
            info: '20级通信工程',
            desc: '技术探索者，热爱编程与户外旅行，个人博客记录学习与成长历程。',
            bg: '优秀校友及项目/刘源_20级通信工程/刘源.jpg',
            link: 'https://blog.yuan0o0.top/',
            linkText: '访问个人主页'
        },
        {
            name: '郭一铭',
            info: '25级智能交互设计',
            desc: '交互设计新锐，专注用户体验与界面美学，个人网站展示设计作品与思考。',
            bg: '优秀校友及项目/郭一铭_25级智能交互设计/郭一铭.jpg',
            link: 'https://guoyiming.website',
            linkText: '访问个人主页'
        },
        // 位置 3-10：空位占位
        ...Array(8).fill(null)
    ];

    const totalCards = alumni.length; // 10
    const angleStep = 360 / totalCards; // 36deg
    const radius = 480; // 环半径
    let currentIndex = 0;

    // 生成卡片
    alumni.forEach((person, i) => {
        const card = document.createElement('div');
        card.className = 'ring-card' + (i === 0 ? ' active-card' : '') + (!person ? ' ring-card-empty' : '');
        card.dataset.index = i;

        if (person) {
            card.innerHTML = `
                <div class="ring-card-bg" style="background-image: url('${person.bg}')"></div>
                <div class="ring-card-overlay">
                    <div class="ring-card-name">${person.name}</div>
                    <div class="ring-card-info">${person.info}</div>
                    <div class="ring-card-desc">${person.desc}</div>
                    <a href="${person.link}" target="_blank" rel="noopener" class="ring-card-link" onclick="event.stopPropagation()">${person.linkText} &#8599;</a>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="ring-card-bg"></div>
                <div class="ring-card-overlay">
                    <div class="ring-card-placeholder">
                        <div class="ring-card-placeholder-icon">&#9711;</div>
                        <div class="ring-card-placeholder-text">期待加入</div>
                        <div class="ring-card-placeholder-sub">位置 ${i + 1}</div>
                    </div>
                </div>
            `;
        }

        // 3D 定位：绕Y轴旋转，沿Z轴推出
        const angle = i * angleStep;
        card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;

        ringContainer.appendChild(card);

        // 点击卡片：非活动卡片则旋转至活动；活动卡片则打开其个人主页
        card.addEventListener('click', () => {
            if (i !== currentIndex) {
                currentIndex = i;
                updateRing();
            } else if (person && person.link) {
                window.open(person.link, '_blank');
            }
        });
    });

    // 生成位置指示器
    const indicatorsEl = document.getElementById('ringIndicators');
    for (let i = 0; i < totalCards; i++) {
        const dot = document.createElement('div');
        dot.className = 'ring-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
            currentIndex = i;
            updateRing();
        });
        indicatorsEl.appendChild(dot);
    }

    // 更新环形旋转
    function updateRing() {
        const rotation = -currentIndex * angleStep;
        ringContainer.style.transform = `rotateY(${rotation}deg)`;

        // 更新卡片状态
        ringContainer.querySelectorAll('.ring-card').forEach((card, i) => {
            card.classList.toggle('active-card', i === currentIndex);
        });

        // 更新指示器
        indicatorsEl.querySelectorAll('.ring-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });

        // 更新位置标签
        document.getElementById('ringCurrent').textContent = currentIndex + 1;
    }

    // 左右导航
    document.getElementById('ringPrev').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateRing();
    });

    document.getElementById('ringNext').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalCards;
        updateRing();
    });

    // 键盘导航
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateRing();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % totalCards;
            updateRing();
        }
    });

    // 鼠标拖拽旋转
    let isDragging = false;
    let startX = 0;
    let startRotation = 0;

    const ringStage = document.querySelector('.ring-stage');

    ringStage.addEventListener('mousedown', (e) => {
        // 不拦截卡片内链接点击
        if (e.target.closest('a')) return;
        isDragging = true;
        startX = e.clientX;
        startRotation = -currentIndex * angleStep;
        ringContainer.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const delta = (e.clientX - startX) * 0.3;
        ringContainer.style.transform = `rotateY(${startRotation + delta}deg)`;
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        ringContainer.style.transition = '';

        const delta = e.clientX - startX;
        if (Math.abs(delta) > 50) {
            if (delta > 0) {
                currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            } else {
                currentIndex = (currentIndex + 1) % totalCards;
            }
        }
        updateRing();
    });

    // 触摸滑动
    let touchStartX = 0;
    ringStage.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        ringContainer.style.transition = 'none';
    });

    ringStage.addEventListener('touchmove', (e) => {
        const delta = (e.touches[0].clientX - touchStartX) * 0.3;
        ringContainer.style.transform = `rotateY(${startRotation + delta}deg)`;
    });

    ringStage.addEventListener('touchend', (e) => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        ringContainer.style.transition = '';
        if (Math.abs(delta) > 50) {
            if (delta > 0) {
                currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            } else {
                currentIndex = (currentIndex + 1) % totalCards;
            }
        }
        updateRing();
    });

    // 自动旋转（5秒间隔）
    let autoRotate = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalCards;
        updateRing();
    }, 5000);

    // 鼠标悬停暂停自动旋转
    ringStage.addEventListener('mouseenter', () => clearInterval(autoRotate));
    ringStage.addEventListener('mouseleave', () => {
        autoRotate = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalCards;
            updateRing();
        }, 5000);
    });

    // 初始化
    updateRing();
})();
