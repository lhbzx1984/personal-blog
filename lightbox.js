    (function() {
        var overlay = document.getElementById('lightbox');
        if (!overlay) return;
        var imgEl = document.getElementById('lightbox-image');
        var closeBtn = document.getElementById('lightbox-close');
        var prevBtn = document.getElementById('lightbox-prev');
        var nextBtn = document.getElementById('lightbox-next');
        var counterEl = document.getElementById('lightbox-counter');
        var gallery = [];
        var currentIdx = 0;

        // 收集所有可查看的图片
        function buildGallery() {
            gallery = [];
            // 证书图片 (img 标签)
            var certs = document.querySelectorAll('.certificate-image');
            certs.forEach(function(img) {
                gallery.push({ src: img.src, alt: img.alt || '图片' });
            });
            // 项目背景图 (CSS background-image)
            var projects = document.querySelectorAll('.project-image');
            projects.forEach(function(el) {
                var bg = getComputedStyle(el).backgroundImage;
                var match = bg.match(/url\(["']?(.*?)["']?\)/);
                if (match && match[1]) {
                    gallery.push({ src: match[1], alt: '项目背景图' });
                }
            });
            // 博客/公众号背景图 (CSS background-image)
            var blogs = document.querySelectorAll('.blog-image');
            blogs.forEach(function(el) {
                var bg = getComputedStyle(el).backgroundImage;
                var match = bg.match(/url\(["']?(.*?)["']?\)/);
                if (match && match[1]) {
                    gallery.push({ src: match[1], alt: '文章背景图' });
                }
            });
        }

        function show(idx) {
            if (gallery.length === 0) return;
            currentIdx = (idx + gallery.length) % gallery.length;
            var item = gallery[currentIdx];
            imgEl.src = item.src;
            imgEl.alt = item.alt;
            counterEl.textContent = (currentIdx + 1) + ' / ' + gallery.length;
            overlay.classList.add('active');
        }

        function close() {
            overlay.classList.remove('active');
        }

        function prev() { show(currentIdx - 1); }
        function next() { show(currentIdx + 1); }

        // 绑定点击事件
        function bindClicks() {
            // 证书图片
            document.querySelectorAll('.certificate-image').forEach(function(img) {
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', function(e) {
                    e.stopPropagation();
                    buildGallery();
                    var idx = gallery.findIndex(function(g) { return g.src === img.src; });
                    show(idx >= 0 ? idx : 0);
                });
            });
            // 项目背景图
            document.querySelectorAll('.project-image').forEach(function(el) {
                el.style.cursor = 'zoom-in';
                el.addEventListener('click', function(e) {
                    // 如果点击的是"访问项目"链接，不拦截
                    if (e.target.closest('.project-overlay a')) return;
                    e.preventDefault();
                    e.stopPropagation();
                    buildGallery();
                    var bg = getComputedStyle(el).backgroundImage;
                    var match = bg.match(/url\(["']?(.*?)["']?\)/);
                    var src = match ? match[1] : '';
                    var idx = gallery.findIndex(function(g) { return g.src === src; });
                    show(idx >= 0 ? idx : 0);
                });
            });
            // 博客/公众号背景图
            document.querySelectorAll('.blog-image').forEach(function(el) {
                el.style.cursor = 'zoom-in';
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    buildGallery();
                    var bg = getComputedStyle(el).backgroundImage;
                    var match = bg.match(/url\(["']?(.*?)["']?\)/);
                    var src = match ? match[1] : '';
                    var idx = gallery.findIndex(function(g) { return g.src === src; });
                    show(idx >= 0 ? idx : 0);
                });
            });
        }

        // 按钮事件
        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', function(e) { e.stopPropagation(); prev(); });
        nextBtn.addEventListener('click', function(e) { e.stopPropagation(); next(); });
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay || e.target === imgEl) close();
        });

        // 键盘导航
        document.addEventListener('keydown', function(e) {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'ArrowRight') next();
        });

        // 触摸滑动支持
        var touchStartX = 0;
        overlay.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        overlay.addEventListener('touchend', function(e) {
            var dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 50) {
                if (dx > 0) prev(); else next();
            }
        }, { passive: true });

        // 页面加载后绑定
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindClicks);
        } else {
            bindClicks();
        }
    })();