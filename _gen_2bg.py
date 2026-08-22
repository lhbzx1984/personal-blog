"""生成两张新项目背景图"""
import requests, os

API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
API_KEY = "sk-ZBiXZWj163saZNZ5X6RiTAgPZBWZLdb13L8TZydt2NadIxiX"
OUTPUT_DIR = r"c:\Users\Dell\Desktop\个人播客\项目背景图"

projects = [
    {
        "file": "11_AI服务设计人工智能培训.png",
        "prompt": "3D产品渲染风格, AI人工智能培训服务设计场景, 现代化教室全息投影AI教学界面, 虚拟讲师形象, 课程设计流程图HUD, 深蓝紫渐变背景, 霓虹青色品红色光效, 科技感, 高清细节, 不要文字"
    },
    {
        "file": "12_OpenCV计算机视觉实验.png",
        "prompt": "3D产品渲染风格, OpenCV计算机视觉实验平台, 摄像头实时捕捉画面叠加人脸检测边界框和特征点, 图像处理算法可视化, 代码编辑器界面, 深蓝紫渐变背景, 霓虹青色品红色光效, 科技感, 高清细节, 不要文字"
    }
]

headers = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}

for p in projects:
    print(f"正在生成: {p['file']}")
    data = {"model": "agnes-image-2.1-flash", "prompt": p["prompt"], "size": "1024x1024", "n": 1}
    resp = requests.post(API_URL, headers=headers, json=data, timeout=300)
    result = resp.json()
    if "data" in result and len(result["data"]) > 0:
        img_url = result["data"][0]["url"]
        img_resp = requests.get(img_url, timeout=300)
        if img_resp.status_code == 200:
            path = os.path.join(OUTPUT_DIR, p["file"])
            with open(path, "wb") as f:
                f.write(img_resp.content)
            print(f"  已保存: {path} ({len(img_resp.content)//1024}KB)")
    else:
        print(f"  生成失败: {result}")
print("完成!")
