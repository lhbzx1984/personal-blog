        // 证书点击放大查看功能
        document.addEventListener('DOMContentLoaded', function() {
            const certificateModal = document.getElementById('certificateModal');
            if (!certificateModal) return;
            const modalImage = document.getElementById('modalImage');
            const modalCaption = document.getElementById('modalCaption');
            const modalClose = document.getElementById('modalClose');
            const modalOverlay = document.getElementById('modalOverlay');

            // 为所有证书卡片添加点击事件
            document.querySelectorAll('.certificate-card').forEach(card => {
                card.addEventListener('click', function() {
                    const img = this.querySelector('.certificate-image');
                    const caption = this.querySelector('.certificate-name');

                    if (img) {
                        modalImage.src = img.src;
                        modalImage.alt = img.alt;
                    }

                    if (caption) {
                        modalCaption.textContent = caption.textContent;
                    }

                    certificateModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            });

            // 点击关闭按钮关闭模态框
            modalClose.addEventListener('click', closeModal);

            // 点击遮罩层关闭模态框
            modalOverlay.addEventListener('click', closeModal);

            // 按ESC键关闭模态框
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && certificateModal.classList.contains('active')) {
                    closeModal();
                }
            });

            function closeModal() {
                certificateModal.classList.remove('active');
                document.body.style.overflow = '';
                modalImage.src = '';
                modalImage.alt = '';
                modalCaption.textContent = '';
            }
        });