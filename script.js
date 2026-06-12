let facingUser = true;
const scene = document.querySelector('a-scene');
const statusEl = document.getElementById('status');
const marker = document.getElementById('marker');

let arStarted = false;

// ユーザー操作でカメラ起動
document.getElementById('startAR').addEventListener('click', async () => {
  if (!arStarted) {
    try {
      await scene.components['arjs'].start();
      statusEl.textContent = 'マーカーを探しています';
      arStarted = true;
    } catch (err) {
      alert('カメラの起動に失敗しました: ' + err);
    }
  }
});

// カメラ切替
document.getElementById('switchCamera').addEventListener('click', () => {
  if (!arStarted) return;
  facingUser = !facingUser;
  const camera = scene.querySelector('a-entity[camera]');
  camera.setAttribute('arjs', 'sourceType', facingUser ? 'user' : 'environment');
});

// 写真撮影
document.getElementById('capture').addEventListener('click', () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return alert('カメラ映像がまだ準備できていません');
  const link = document.createElement('a');
  link.download = 'ar-photo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// マーカー認識イベント
marker.addEventListener('markerFound', () => {
  statusEl.textContent = 'マーカー認識中';
});
marker.addEventListener('markerLost', () => {
  statusEl.textContent = 'マーカーを探しています';
});

// カメラ映像を透明背景で強制表示
function forceTransparentRenderer() {
  if (!scene || !scene.renderer) return;
  scene.object3D.background = null;
  scene.renderer.setClearColor(0x000000, 0);
  scene.renderer.autoClear = true;
  const canvas = scene.renderer.domElement;
  if (canvas) canvas.style.background = 'transparent';
}

scene.addEventListener('loaded', forceTransparentRenderer);
scene.addEventListener('renderstart', forceTransparentRenderer);
window.addEventListener('load', () => {
  setTimeout(forceTransparentRenderer, 500);
  setTimeout(forceTransparentRenderer, 1500);
  setTimeout(forceTransparentRenderer, 3000);
});
