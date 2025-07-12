<script>
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
        status.style.color = "#7dcfff";
        startBtn.disabled = true;
        stopBtn.disabled = false;
        startBtn.style.background = "#232323";
        stopBtn.style.background = "linear-gradient(90deg,#444 60%,#c74646 100%)";
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
    startBtn.style.background = "linear-gradient(90deg,#323232 80%,#2e4a7d 100%)";
    stopBtn.style.background = "linear-gradient(90deg,#444 70%,#8f2222 100%)";
};
</script>
