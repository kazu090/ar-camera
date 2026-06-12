const scene = document.querySelector('a-scene');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startAR');
const switchBtn = document.getElementById('switchCamera');
const captureBtn = document.getElementById('capture');

let arStarted = false;
let facingUser = true;

// AR開始
startBtn.addEventListener('click', async () => {
  if (arStarted) return;
  const mindarSystem = scene.systems['mindar-image'];
  if (!mindarSystem) {
    alert('MindARシステムがまだロードされていません。ページをリロードしてください');
    return;
  }

  try {
    await mindarSystem.start();
    arStarted = true;
    statusEl.textContent = 'マーカーを探しています';
  } catch (err) {
    alert('カメラの起動に失敗しました: ' + err);
  }
});

// カメラ切替
switchBtn.addEventListener('click', async () => {
  if (!arStarted) return;
  facingUser = !facingUser;
  const mindarSystem = scene.systems['mindar-image'];
  if (!mindarSystem) return;
  mindarSystem.arController.video.srcObject.getTracks().forEach(track => track.stop());
  await mindarSystem.arController._startCamera(facingUser ? "user" : "environment");
});

// 写真撮影
captureBtn.addEventListener('click', () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return alert('カメラ映像が準備できていません');
  const link = document.createElement('a');
  link.download = 'ar-photo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// マーカー認識イベント
const markerEntity = scene.querySelector('a-marker');
markerEntity.addEventListener('targetFound', () => {
  statusEl.textContent = 'マーカー認識中';
});
markerEntity.addEventListener('targetLost', () => {
  statusEl.textContent = 'マーカーを探しています';
});
