// js/mic.js (외부 파일에 script 태그 없이 작성)

let audioContext;
let mediaStream;
let source;

window.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startMicBtn');
    const stopBtn = document.getElementById('stopMicBtn');
    const status = document.getElementById('micStatus');

    if (!startBtn || !stopBtn || !status) return;

    startBtn.onclick = async () => {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            source = audioContext.createMediaStreamSource(mediaStream);
            source.connect(audioContext.destination);

            status.textContent = '마이크 소리를 재생 중입니다.';
            status.style.color = "#7dcfff";
            startBtn.disabled = true;
            stopBtn.disabled = false;

            // 눌림 효과 추가
            startBtn.classList.add('active-mic');
            stopBtn.classList.remove('active-mic');
            startBtn.innerHTML = "🎤 ON";
            stopBtn.innerHTML = "🛑 마이크 중지";
        } catch (err) {
            status.textContent = '마이크 접근 실패: ' + err.message;
            status.style.color = "#c74646";
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
        status.style.color = "#bbbbbb";
        startBtn.disabled = false;
        stopBtn.disabled = true;

        // 눌림 효과 해제
        startBtn.classList.remove('active-mic');
        stopBtn.classList.add('active-mic');
        startBtn.innerHTML = "🎤 마이크 시작";
        stopBtn.innerHTML = "🛑 OFF";
    };
});
