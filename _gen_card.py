"""
个人名片设计 - 生成正面和背面
尺寸: 9cm x 6.5cm (横版), 300DPI = 1063x768px
"""
import requests
import os
from PIL import Image, ImageDraw, ImageFont
import io

# ===== 配置 =====
API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
API_KEY = "sk-ZBiXZWj163saZNZ5X6RiTAgPZBWZLdb13L8TZydt2NadIxiX"

RES_DIR = r"c:\Users\Dell\Desktop\个人播客\个人名片图片资源"
OUTPUT_DIR = r"c:\Users\Dell\Desktop\个人播客\个人名片"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 名片尺寸 (300DPI)
CARD_W = 1063  # 9cm
CARD_H = 768   # 6.5cm
BORDER = 35    # 四面留白(px)

# 字体路径
FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"    # 微软雅黑粗体
FONT_REG = r"C:\Windows\Fonts\msyh.ttc"       # 微软雅黑
FONT_MONO = r"C:\Windows\Fonts\consola.ttf"   # 等宽字体

# 个人简介
TITLE = "硕士 · 副教授 · 人工智能教育专家"
INTRO = "主讲人工智能通识课、机器学习、智能硬件基础、单片机原理及应用等课程。天津科技局入库专家、天津津南区无人智能系统协会副会长、圣保罗大学土格加劳总校区国际交流学院特聘教授，英伟达DLI校园大使和认证讲师、DataWhale社区讲师。"

# ===== 第一步: 用Agnes AI生成正面背景 =====
def generate_front_bg():
    prompt = (
        "极简风格名片正面背景设计, 浅灰白色主色调, "
        "左上角和右下角有非常淡的浅蓝色和浅紫色几何装饰线条, "
        "大量留白, 干净整洁, 学术风格, 高级感, "
        "纯色背景为主, 不要有任何文字, 不要有任何logo, "
        "名片设计模板风格"
    )
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    data = {
        "model": "agnes-image-2.1-flash",
        "prompt": prompt,
        "size": "1024x768",
        "n": 1
    }
    print("正在调用 Agnes AI 生成名片正面背景...")
    resp = requests.post(API_URL, headers=headers, json=data, timeout=300)
    result = resp.json()
    if "data" in result and len(result["data"]) > 0:
        img_url = result["data"][0]["url"]
        print(f"下载背景图: {img_url}")
        img_resp = requests.get(img_url, timeout=300)
        if img_resp.status_code == 200:
            bg_path = os.path.join(OUTPUT_DIR, "_front_bg.png")
            with open(bg_path, "wb") as f:
                f.write(img_resp.content)
            print(f"背景图已保存: {bg_path}")
            return bg_path
    print("生成失败:", result)
    return None

# ===== 第二步: 合成名片正面 =====
def compose_front(bg_path):
    # 创建画布
    card = Image.new("RGB", (CARD_W, CARD_H), (255, 255, 255))

    # 放置背景图 (缩放至名片尺寸)
    if bg_path and os.path.exists(bg_path):
        bg = Image.open(bg_path).convert("RGB")
        bg = bg.resize((CARD_W, CARD_H), Image.LANCZOS)
        # 降低背景饱和度使其更浅
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Color(bg)
        bg = enhancer.enhance(0.15)  # 大幅降低饱和度
        enhancer = ImageEnhance.Brightness(bg)
        bg = enhancer.enhance(1.3)   # 提高亮度
        card.paste(bg, (0, 0))

    draw = ImageDraw.Draw(card)

    # 四面留白边框 (叠加白色半透明区域)
    overlay = Image.new("RGBA", (CARD_W, CARD_H), (255, 255, 255, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    # 内边距区域之外保持背景, 之内也保持但有边框效果
    # 实际上"四面留白"意思是内容区域有边距, 背景在最外层

    # 字体
    f_title = ImageFont.truetype(FONT_BOLD, 22)
    f_intro = ImageFont.truetype(FONT_REG, 14)
    f_name = ImageFont.truetype(FONT_BOLD, 26)

    # === 左上角: 个人头像 ===
    photo_path = os.path.join(RES_DIR, "个人照片.jpg")
    avatar_size = 130
    avatar_x = BORDER + 10
    avatar_y = BORDER + 5

    if os.path.exists(photo_path):
        photo = Image.open(photo_path).convert("RGBA")
        # 正方形裁剪 (从中心)
        w, h = photo.size
        crop_size = min(w, h)
        left = (w - crop_size) // 2
        top = (h - crop_size) // 2
        photo = photo.crop((left, top, left + crop_size, top + crop_size))
        photo = photo.resize((avatar_size, avatar_size), Image.LANCZOS)

        # 圆形遮罩
        mask = Image.new("L", (avatar_size, avatar_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((0, 0, avatar_size, avatar_size), fill=255)

        # 头像边框
        border_ring = Image.new("RGBA", (avatar_size + 8, avatar_size + 8), (0, 0, 0, 0))
        border_draw = ImageDraw.Draw(border_ring)
        border_draw.ellipse((0, 0, avatar_size + 7, avatar_size + 7), fill=(0, 100, 180, 255))
        card.paste(border_ring, (avatar_x - 4, avatar_y - 4), border_ring)
        card.paste(photo, (avatar_x, avatar_y), mask)

    # === 头像右边: 校徽 ===
    school_badge_path = os.path.join(RES_DIR, "校徽.jpg")
    badge_size = 80
    badge_x = avatar_x + avatar_size + 20
    badge_y = avatar_y + 25

    if os.path.exists(school_badge_path):
        badge = Image.open(school_badge_path).convert("RGBA")
        bw, bh = badge.size
        bcs = min(bw, bh)
        bl = (bw - bcs) // 2
        bt = (bh - bcs) // 2
        badge = badge.crop((bl, bt, bl + bcs, bt + bcs))
        badge = badge.resize((badge_size, badge_size), Image.LANCZOS)
        # 圆形遮罩
        bmask = Image.new("L", (badge_size, badge_size), 0)
        bmask_draw = ImageDraw.Draw(bmask)
        bmask_draw.ellipse((0, 0, badge_size, badge_size), fill=255)
        card.paste(badge, (badge_x, badge_y), bmask)

    # === 头像下面: 姓名和标题 ===
    name_y = avatar_y + avatar_size + 15
    draw.text((avatar_x, name_y), "刘海斌", fill=(30, 30, 30), font=f_name)
    draw.text((avatar_x, name_y + 35), TITLE, fill=(60, 60, 60), font=f_title)

    # === 简介文字 (头像下方, 自动换行) ===
    intro_y = name_y + 70
    intro_x = avatar_x
    max_intro_w = CARD_W - avatar_x - 180  # 右边留给二维码

    # 手动换行
    intro_lines = []
    current_line = ""
    for ch in INTRO:
        test_line = current_line + ch
        bbox = draw.textbbox((0, 0), test_line, font=f_intro)
        if bbox[2] - bbox[0] > max_intro_w:
            intro_lines.append(current_line)
            current_line = ch
        else:
            current_line = test_line
    if current_line:
        intro_lines.append(current_line)

    for i, line in enumerate(intro_lines):
        draw.text((intro_x, intro_y + i * 22), line, fill=(80, 80, 80), font=f_intro)

    # === 左下角: 学院徽章 ===
    college_badge_path = os.path.join(RES_DIR, "学院徽.png")
    college_size = 70
    college_x = BORDER + 10
    college_y = CARD_H - BORDER - college_size - 5

    if os.path.exists(college_badge_path):
        college = Image.open(college_badge_path).convert("RGBA")
        cw, ch = college.size
        ccs = min(cw, ch)
        cl = (cw - ccs) // 2
        ct = (ch - ccs) // 2
        college = college.crop((cl, ct, cl + ccs, ct + ccs))
        college = college.resize((college_size, college_size), Image.LANCZOS)
        card.paste(college, (college_x, college_y), college)

    # === 简介右边: 博客二维码 ===
    qr_path = os.path.join(RES_DIR, "个人博客二维码.jpg")
    qr_size = 110
    qr_x = CARD_W - BORDER - qr_size - 10
    qr_y = name_y - 5

    if os.path.exists(qr_path):
        qr = Image.open(qr_path).convert("RGBA")
        qw, qh = qr.size
        qcs = min(qw, qh)
        ql = (qw - qcs) // 2
        qt = (qh - qcs) // 2
        qr = qr.crop((ql, qt, ql + qcs, qt + qcs))
        qr = qr.resize((qr_size, qr_size), Image.LANCZOS)
        # 白色背景框
        qr_bg = Image.new("RGBA", (qr_size + 12, qr_size + 12), (255, 255, 255, 255))
        card.paste(qr_bg, (qr_x - 6, qr_y - 6), qr_bg)
        card.paste(qr, (qr_x, qr_y), qr)
        # 二维码下方标注
        f_qr = ImageFont.truetype(FONT_REG, 11)
        draw.text((qr_x - 5, qr_y + qr_size + 5), "扫码访问博客", fill=(100, 100, 100), font=f_qr)

    # 保存
    front_path = os.path.join(OUTPUT_DIR, "名片_正面.png")
    card.save(front_path, "PNG", dpi=(300, 300))
    print(f"名片正面已保存: {front_path}")
    return front_path

# ===== 第三步: 合成名片背面 =====
def compose_back():
    back_path_source = os.path.join(RES_DIR, "背面.jpg")
    card = Image.new("RGB", (CARD_W, CARD_H), (255, 255, 255))

    if os.path.exists(back_path_source):
        back = Image.open(back_path_source).convert("RGB")
        back = back.resize((CARD_W, CARD_H), Image.LANCZOS)
        card.paste(back, (0, 0))

    draw = ImageDraw.Draw(card)

    # 右上角: 校训 "实事求是，果毅立行" 竖排版
    motto = "实事求是，果毅立行"
    f_motto = ImageFont.truetype(FONT_BOLD, 28)

    # 竖排: 从右到左, 每列1字
    char_h = 38
    start_x = CARD_W - BORDER - 30
    start_y = BORDER + 20

    for i, ch in enumerate(motto):
        # 跳过标点
        if ch in "，。、":
            continue
        x = start_x - (i // 8) * 40  # 每8字换列(实际不会触发,因为只有10字)
        y = start_y + (i % 8) * char_h
        # 简化: 所有字排成一列
        draw.text((start_x, start_y + i * char_h), ch, fill=(50, 50, 50), font=f_motto, anchor="mm")

    # 重新计算 - 竖排所有字
    # 先清除, 重新画
    card2 = Image.new("RGB", (CARD_W, CARD_H), (255, 255, 255))
    if os.path.exists(back_path_source):
        back = Image.open(back_path_source).convert("RGB")
        back = back.resize((CARD_W, CARD_H), Image.LANCZOS)
        card2.paste(back, (0, 0))

    draw2 = ImageDraw.Draw(card2)
    f_motto = ImageFont.truetype(FONT_BOLD, 26)
    char_spacing = 36
    motto_x = CARD_W - BORDER - 35
    motto_y = BORDER + 15

    y_pos = 0
    for ch in motto:
        draw2.text((motto_x, motto_y + y_pos * char_spacing), ch, fill=(40, 40, 40), font=f_motto, anchor="mm")
        y_pos += 1

    back_output = os.path.join(OUTPUT_DIR, "名片_背面.png")
    card2.save(back_output, "PNG", dpi=(300, 300))
    print(f"名片背面已保存: {back_output}")
    return back_output

# ===== 主流程 =====
if __name__ == "__main__":
    # 1. 生成正面背景 (如果已有则复用)
    bg_path = os.path.join(OUTPUT_DIR, "_front_bg.png")
    if not os.path.exists(bg_path):
        bg_path = generate_front_bg()

    # 2. 合成正面
    front_path = compose_front(bg_path)

    # 3. 合成背面
    back_path = compose_back()

    print("\n===== 完成 =====")
    print(f"正面: {front_path}")
    print(f"背面: {back_path}")
    print(f"尺寸: {CARD_W}x{CARD_H}px (9cm x 6.5cm @ 300DPI)")
