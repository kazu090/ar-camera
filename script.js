// script.js

let facingUser = true; // インカメラ初期
const scene = document.querySelector('a-scene');
const statusEl = document.getElementById('status');

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

// マーカー認識イベント
const marker = scene.querySelector('a-marker');
marker.addEventListener('markerFound', () => {
  statusEl.textContent = 'マーカー認識中';
});
marker.addEventListener('markerLost', () => {
  statusEl.textContent = 'マーカーを探しています';
});
