// script.js

let facingUser = true;
const scene = document.querySelector('a-scene');
const statusEl = document.getElementById('status');
const marker = scene.querySelector('a-marker');

// カメラ切替
document.getElementById('switchCamera').addEventListener('click', () => {
  facingUser = !facingUser;
  const camera = scene.querySelector('a-entity[camera]');
  camera.setAttribute('arjs', 'sourceType', facingUser ? 'user' : 'environment');
  console.log('カメラ切替:', facingUser ? 'インカメラ' : 'アウトカメラ');
});

// 写真撮影
document.getElementById('capture').addEventListener('click', () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return alert('カメラ映像がまだ準備できていません');
  const link = document.createElement('a');
  link.download = 'ar-photo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  console.log('写真撮影完了');
});

// マーカー認識
marker.addEventListener('markerFound', () => {
  statusEl.textContent = 'マーカー認識中';
});
marker.addEventListener('markerLost', () => {
  statusEl.textContent = 'マーカーを探しています';
});

// カメラ映像が必ず表示されるよう強制
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
