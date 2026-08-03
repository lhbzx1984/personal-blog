# -*- coding: utf-8 -*-
"""生成个人博客二维码海报:真实可扫描二维码 + AI博客风格背景 + 标题卡片"""
import qrcode
from PIL import Image, ImageDraw, ImageFont

URL = "https://lhbzx1984.github.io/personal-blog/"
BANNER = r"c:\Users\Dell\Desktop\个人播客\blog-banner.jpg"
OUT = r"c:\Users\Dell\Desktop\个人播客\blog-qrcode-poster.png"
FONT_REG = r"C:\Windows\Fonts\msyh.ttc"      # 微软雅黑
FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"    # 微软雅黑粗体

# 1. 生成真实可扫描二维码(高容错,霓虹绿模块+白底)
qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=2,
)
qr.add_data(URL)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="#00a854", back_color="white").convert("RGB")
qr_img = qr_img.resize((600, 600), Image.NEAREST)

# 2. 构建白色圆角卡片:标题 + 二维码 + 副标题 + URL
card_w, card_h = 760, 980
card = Image.new("RGB", (card_w, card_h), "white")
# 卡片外层淡灰描边
draw = ImageDraw.Draw(card)

title_font = ImageFont.truetype(FONT_BOLD, 64)
sub_font = ImageFont.truetype(FONT_REG, 34)
url_font = ImageFont.truetype(FONT_REG, 26)

# 标题
title = "刘海斌 · 个人博客"
tw = draw.textlength(title, font=title_font)
draw.text(((card_w - tw) / 2, 60), title, fill="#0a0a0f", font=title_font)
# 副标题
sub = "全栈开发工程师 · 机器学习研究员"
sw = draw.textlength(sub, font=sub_font)
draw.text(((card_w - sw) / 2, 150), sub, fill="#5b6b7c", font=sub_font)
# 二维码居中
qr_x = (card_w - 600) // 2
card.paste(qr_img, (qr_x, 240))
# 扫码提示
tip = "▽ 扫码访问个人博客 ▽"
tw2 = draw.textlength(tip, font=sub_font)
draw.text(((card_w - tw2) / 2, 880), tip, fill="#00a854", font=sub_font)
# URL
uw = draw.textlength(URL, font=url_font)
draw.text(((card_w - uw) / 2, 935), URL, fill="#9aa7b4", font=url_font)

# 3. 合成最终海报:顶部AI背景 + 底部二维码卡片
banner = Image.open(BANNER).convert("RGB")
W = 1080
banner_h = int(banner.height * W / banner.width)
banner = banner.resize((W, banner_h), Image.LANCZOS)

poster_h = banner_h + 60 + card_h + 60
poster = Image.new("RGB", (W, poster_h), "#0a0a0f")
poster.paste(banner, (0, 0))
# 卡片居中放置在背景下方
card_x = (W - card_w) // 2
card_y = banner_h + 60
# 给卡片加一圈柔和阴影/边框
shadow = Image.new("RGBA", (card_w + 40, card_h + 40), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.rounded_rectangle([0, 0, card_w + 39, card_h + 39], radius=28, fill=(0, 0, 0, 120))
poster.paste(shadow, (card_x - 20, card_y - 20), shadow)
# 圆角卡片本体
mask = Image.new("L", (card_w, card_h), 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([0, 0, card_w - 1, card_h - 1], radius=24, fill=255)
poster.paste(card, (card_x, card_y), mask)

poster.save(OUT, "PNG", optimize=True)
print("OK", OUT, poster.size)
