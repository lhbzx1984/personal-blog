"""
个人名片正面 - 参考合成效果图布局
四角布局: 左上头像/右上校徽+校名/左下学院徽/右下二维码
中间: 个人简介
尺寸: 9cm x 6.5cm @ 300DPI = 1063x768px
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

RES_DIR = r"c:\Users\Dell\Desktop\个人播客\个人名片图片资源"
OUTPUT_DIR = r"c:\Users\Dell\Desktop\个人播客\个人名片"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CARD_W = 1063
CARD_H = 768
BORDER = 30

FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"
FONT_REG = r"C:\Windows\Fonts\msyh.ttc"

NAME = "刘海斌"
TITLE = "硕士 · 副教授 · 人工智能教育专家"
INTRO = "主讲人工智能通识课、机器学习、智能硬件基础、单片机原理及应用等课程。天津科技局入库专家、天津津南区无人智能系统协会副会长、圣保罗大学土格加劳总校区国际交流学院特聘教授，英伟达DLI校园大使和认证讲师、DataWhale社区讲师。"

SCHOOL_NAME_CN = "天津仁爱学院"
SCHOOL_NAME_EN = "TIANJIN RENAI COLLEGE"


def compose_front():
    # 1. 浅灰白背景
    card = Image.new("RGB", (CARD_W, CARD_H), (240, 240, 242))
    draw = ImageDraw.Draw(card)

    # 2. 斜线装饰 (淡紫/淡蓝)
    overlay = Image.new("RGBA", (CARD_W, CARD_H), (240, 240, 242, 0))
    odraw = ImageDraw.Draw(overlay)
    # 左上角斜线
    for i in range(0, 300, 25):
        odraw.line([(i, 0), (i + 200, 200)], fill=(200, 210, 240, 40), width=1)
    # 右上角斜线
    for i in range(0, 300, 25):
        x_start = CARD_W - i
        odraw.line([(x_start, 0), (x_start - 200, 200)], fill=(220, 200, 240, 40), width=1)
    # 右下角斜线
    for i in range(0, 300, 25):
        x_start = CARD_W - i
        y_start = CARD_H
        odraw.line([(x_start, y_start), (x_start - 200, y_start - 200)], fill=(200, 210, 240, 40), width=1)
    # 左下角斜线
    for i in range(0, 300, 25):
        odraw.line([(i, CARD_H), (i + 200, CARD_H - 200)], fill=(220, 200, 240, 40), width=1)

    card = Image.alpha_composite(card.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(card)

    # 字体
    f_name = ImageFont.truetype(FONT_BOLD, 24)
    f_title = ImageFont.truetype(FONT_BOLD, 16)
    f_intro = ImageFont.truetype(FONT_REG, 13)
    f_school_cn = ImageFont.truetype(FONT_BOLD, 18)
    f_school_en = ImageFont.truetype(FONT_REG, 9)
    f_qr_label = ImageFont.truetype(FONT_REG, 10)

    # === 左上角: 个人头像 (矩形证件照) ===
    photo_path = os.path.join(RES_DIR, "个人头像.jpg")
    avatar_w = 110
    avatar_h = 145
    avatar_x = BORDER + 15
    avatar_y = BORDER + 15

    if os.path.exists(photo_path):
        photo = Image.open(photo_path).convert("RGBA")
        pw, ph = photo.size
        # 保持比例裁剪到目标宽高比
        target_ratio = avatar_w / avatar_h
        current_ratio = pw / ph
        if current_ratio > target_ratio:
            new_w = int(ph * target_ratio)
            left = (pw - new_w) // 2
            photo = photo.crop((left, 0, left + new_w, ph))
        else:
            new_h = int(pw / target_ratio)
            top = (ph - new_h) // 2
            photo = photo.crop((0, top, pw, top + new_h))
        photo = photo.resize((avatar_w, avatar_h), Image.LANCZOS)

        # 白色边框
        border_pad = 4
        white_border = Image.new("RGBA", (avatar_w + border_pad * 2, avatar_h + border_pad * 2), (255, 255, 255, 255))
        card.paste(white_border, (avatar_x - border_pad, avatar_y - border_pad), white_border)
        card.paste(photo, (avatar_x, avatar_y), photo)

    # === 右上角: 校徽 + 校名 ===
    school_badge_path = os.path.join(RES_DIR, "校徽.jpg")
    badge_size = 65
    badge_x = CARD_W - BORDER - badge_size - 15
    badge_y = BORDER + 15

    if os.path.exists(school_badge_path):
        badge = Image.open(school_badge_path).convert("RGBA")
        bw, bh = badge.size
        bcs = min(bw, bh)
        bl = (bw - bcs) // 2
        bt = (bh - bcs) // 2
        badge = badge.crop((bl, bt, bl + bcs, bt + bcs))
        badge = badge.resize((badge_size, badge_size), Image.LANCZOS)
        bmask = Image.new("L", (badge_size, badge_size), 0)
        bmask_draw = ImageDraw.Draw(bmask)
        bmask_draw.ellipse((0, 0, badge_size, badge_size), fill=255)
        card.paste(badge, (badge_x, badge_y), bmask)

    # 校名 (校徽左侧, 因为校徽在右上角)
    school_text_x = badge_x - 10
    # 先测量校名宽度
    cn_bbox = draw.textbbox((0, 0), SCHOOL_NAME_CN, font=f_school_cn)
    cn_w = cn_bbox[2] - cn_bbox[0]
    school_text_x = badge_x - cn_w - 12

    draw.text((school_text_x, badge_y + 8), SCHOOL_NAME_CN, fill=(20, 40, 120), font=f_school_cn)
    en_bbox = draw.textbbox((0, 0), SCHOOL_NAME_EN, font=f_school_en)
    en_w = en_bbox[2] - en_bbox[0]
    draw.text((badge_x - en_w - 12, badge_y + 32), SCHOOL_NAME_EN, fill=(20, 40, 120), font=f_school_en)

    # === 中间: 姓名 + 职称 + 简介 ===
    center_x = avatar_x + avatar_w + 25
    center_y = avatar_y + 5
    max_text_w = badge_x - 20 - center_x  # 不超过校名区域

    # 姓名
    draw.text((center_x, center_y), NAME, fill=(30, 30, 30), font=f_name)
    # 职称
    draw.text((center_x, center_y + 32), TITLE, fill=(60, 60, 60), font=f_title)

    # 简介文字 (自动换行)
    intro_y = center_y + 60
    intro_lines = []
    current_line = ""
    for ch in INTRO:
        test_line = current_line + ch
        bbox = draw.textbbox((0, 0), test_line, font=f_intro)
        if bbox[2] - bbox[0] > max_text_w:
            if current_line:
                intro_lines.append(current_line)
            current_line = ch
        else:
            current_line = test_line
    if current_line:
        intro_lines.append(current_line)

    for i, line in enumerate(intro_lines):
        draw.text((center_x, intro_y + i * 20), line, fill=(80, 80, 80), font=f_intro)

    # === 左下角: 学院徽章 ===
    college_path = os.path.join(RES_DIR, "学院徽.png")
    college_size = 55
    college_x = BORDER + 15
    college_y = CARD_H - BORDER - college_size - 15

    if os.path.exists(college_path):
        college = Image.open(college_path).convert("RGBA")
        cw, ch = college.size
        college = college.resize((college_size, college_size), Image.LANCZOS)
        card.paste(college, (college_x, college_y), college)

    # === 右下角: 二维码 ===
    qr_path = os.path.join(RES_DIR, "二维码.jpg")
    qr_size = 90
    qr_x = CARD_W - BORDER - qr_size - 15
    qr_y = CARD_H - BORDER - qr_size - 15

    if os.path.exists(qr_path):
        qr = Image.open(qr_path).convert("RGBA")
        qw, qh = qr.size
        qcs = min(qw, qh)
        ql = (qw - qcs) // 2
        qt = (qh - qcs) // 2
        qr = qr.crop((ql, qt, ql + qcs, qt + qcs))
        qr = qr.resize((qr_size, qr_size), Image.LANCZOS)
        # 白色背景框
        qr_bg = Image.new("RGBA", (qr_size + 10, qr_size + 10), (255, 255, 255, 255))
        card.paste(qr_bg, (qr_x - 5, qr_y - 5), qr_bg)
        card.paste(qr, (qr_x, qr_y), qr)
        draw.text((qr_x, qr_y + qr_size + 3), "扫码访问博客", fill=(100, 100, 100), font=f_qr_label)

    # 保存
    out_path = os.path.join(OUTPUT_DIR, "名片_正面.png")
    card.save(out_path, "PNG", dpi=(300, 300))
    print(f"名片正面已保存: {out_path}")
    print(f"尺寸: {CARD_W}x{CARD_H}px (9cm x 6.5cm @ 300DPI)")
    return out_path


if __name__ == "__main__":
    compose_front()
