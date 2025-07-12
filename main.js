const instruments = ["vocals", "drums", "bass", "piano", "other"];
const slidersContainer = document.getElementById("sliders-container");
const sliders = {};

instruments.forEach(inst => {
  const wrap = document.createElement("div");
  wrap.style.marginBottom = "12px";

  const volLabel = document.createElement("label");
  volLabel.innerText = `${inst} volume (dB): `;
  const volVal = document.createElement("span");
  volVal.innerText = "0";

  const vol = document.createElement("input");
  vol.type = "range";
  vol.min = -36;
  vol.max = 36;
  vol.value = 0;
  vol.oninput = () => volVal.innerText = vol.value;

  const pitchLabel = document.createElement("label");
  pitchLabel.innerText = ` | pitch: `;
  const pitchVal = document.createElement("span");
  pitchVal.innerText = "0";

  const pitch = document.createElement("input");
  pitch.type = "range";
  pitch.min = -12;
  pitch.max = 12;
  pitch.value = 0;
  pitch.oninput = () => pitchVal.innerText = pitch.value;

  sliders[inst] = { vol, pitch };

  wrap.append(volLabel, vol, volVal, pitchLabel, pitch, pitchVal);
  slidersContainer.appendChild(wrap);
});

function sendMix() {
  const settings = {};
  instruments.forEach(inst => {
    settings[inst] = {
      volume: parseInt(sliders[inst].vol.value),
      pitch: parseInt(sliders[inst].pitch.value)
    };
  });

  document.getElementById("status").innerText = "⏳ 믹싱 중...";

  fetch("/api/mix", {
    method: "POST",
    body: JSON.stringify(settings)
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("status").innerText = "✅ 믹싱 완료!";
      document.getElementById("player").src = data.url + "?t=" + Date.now();
    })
    .catch(err => {
      console.error(err);
      document.getElementById("status").innerText = "❌ 오류 발생";
    });
}
