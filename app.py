import os
import subprocess
import sys

# 1. 필요한 패키지 자동 설치
def install_packages():
    required = ["flask", "spleeter", "librosa", "soundfile", "numpy"]
    for pkg in required:
        try:
            __import__(pkg if pkg != "soundfile" else "soundfile")
        except ImportError:
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])

install_packages()

# 2. 나머지 로직 실행
from flask import Flask, request, jsonify
import librosa
import soundfile as sf
import numpy as np
from spleeter.separator import Separator
import json

app = Flask(__name__)

# 설정
MP3_FILE = 'static/iu.good_day.mp3'
WAV_FILE = 'static/iu_temp.wav'
SPLIT_FOLDER = 'separated'
STEM_DIR = os.path.join(SPLIT_FOLDER, 'iu.good_day')
OUTPUT_FILE = 'static/iu_mixed.wav'
INSTRUMENTS = ['vocals', 'drums', 'bass', 'piano', 'other']

# 폴더 생성
os.makedirs('static', exist_ok=True)
os.makedirs(SPLIT_FOLDER, exist_ok=True)

@app.route('/api/mix', methods=['POST'])
def mix_audio():
    settings = json.loads(request.data.decode())
    print("📥 받은 설정:", settings)

    sr = 22050

    # 1. mp3 → wav 변환
    y, _ = librosa.load(MP3_FILE, sr=sr)
    sf.write(WAV_FILE, y, sr)

    # 2. Spleeter 분리 (최초 1회)
    if not os.path.exists(os.path.join(STEM_DIR, 'vocals.wav')):
        print("🎧 Spleeter 실행 중...")
        separator = Separator('spleeter:5stems')
        separator.separate_to_file(WAV_FILE, SPLIT_FOLDER)

    # 3. 악기별 조정
    signals = []
    for inst in INSTRUMENTS:
        path = os.path.join(STEM_DIR, f"{inst}.wav")
        y, _ = librosa.load(path, sr=sr)

        dB = settings.get(inst, {}).get('volume', 0)
        pitch = settings.get(inst, {}).get('pitch', 0)

        y *= 10 ** (dB / 20)
        if pitch != 0:
            y = librosa.effects.pitch_shift(y, sr=sr, n_steps=pitch)

        y = y / np.max(np.abs(y)) if np.max(np.abs(y)) > 0 else y
        signals.append(y)

    # 4. 믹싱
    max_len = max(len(s) for s in signals)
    aligned = [np.pad(s, (0, max_len - len(s))) for s in signals]
    mixed = np.sum(aligned, axis=0)
    mixed = mixed / np.max(np.abs(mixed))
    sf.write(OUTPUT_FILE, mixed, sr)

    return jsonify({"status": "success", "url": "/" + OUTPUT_FILE})

@app.route('/')
def home():
    return '🎶 Flask Audio Mixer is running! Visit index.html to use.'

if __name__ == '__main__':
    # mp3가 없으면 안내
    if not os.path.exists(MP3_FILE):
        print(f"⚠️  음원 파일이 없습니다: {MP3_FILE} 을 넣어주세요.")
    else:
        print("✅ 서버 실행 중... http://localhost:5000")
        app.run(debug=True)
