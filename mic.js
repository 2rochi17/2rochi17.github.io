// mic.js
let audioContext;
let mediaStream;
let source;

const startBtn = document.getElementById('startMicBtn');
const stopBtn = document.getElementById('stopMicBtn');
const status = document.getElementById('micStatus');

startBtn.onclick = async () => {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(audioContext.destination); // 마이크 → 스피커
        status.textContent = '마이크 소리를 재생 중입니다.';
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } catch (err) {
        status.textContent = '마이크 접근 실패: ' + err.message;
    }
};

stopBtn.onclick = () => {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
        audioContext.close();
    }
    status.textContent = '중지됨.';
    startBtn.disabled = false;
    stopBtn.disabled = true;
};
