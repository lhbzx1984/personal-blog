import fitz  # pymupdf
import json
import os

pdf_path = r"AI好教程\WorkBuddy AI智能体办公实战指导手册_V2.pdf"
out_js = r"AI好教程\workbuddy_text.js"

doc = fitz.open(pdf_path)
pages_text = []
full_text = ""
for i, page in enumerate(doc, 1):
    t = page.get_text("text")
    pages_text.append({"page": i, "text": t})
    full_text += f"\n\n===== 第 {i} 页 =====\n\n" + t

doc.close()

# 简单按页/空行分块，便于 RAG 检索
chunks = []
for p in pages_text:
    raw = p["text"]
    # 按双换行分块，过短的合并
    parts = [x.strip() for x in raw.split("\n\n") if x.strip()]
    buf = ""
    for part in parts:
        if len(buf) + len(part) < 600:
            buf += "\n" + part
        else:
            if buf:
                chunks.append({"page": p["page"], "text": buf.strip()})
            buf = part
    if buf:
        chunks.append({"page": p["page"], "text": buf.strip()})

data = {
    "title": "WorkBuddy AI智能体办公实战指导手册",
    "totalPages": len(pages_text),
    "charCount": len(full_text),
    "chunks": chunks,
    "fullText": full_text
}

js_content = "// 《WorkBuddy AI智能体办公实战指导手册》预提取文本（RAG 上下文）\n"
js_content += "// 由 _extract_pdf.py 自动生成，请勿手动编辑\n"
js_content += "window.WORKBUDDY_BOOK = " + json.dumps(data, ensure_ascii=False) + ";\n"

with open(out_js, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"页数: {len(pages_text)}")
print(f"总字符: {len(full_text)}")
print(f"分块数: {len(chunks)}")
print(f"已生成: {out_js}")
