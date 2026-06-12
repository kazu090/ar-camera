// script.js

let facingUser = true; // 初期値：インカメラ

// カメラ切替ボタン
document.getElementById('switchCamera').addEventListener('click', () => {
  facingUser = !facingUser;
  const scene = document.querySelector('a-scene');
  const camera = scene.querySelector('a-entity[camera]');
  camera.setAttribute('arjs', 'sourceType', facingUser ? 'user' : 'environment');
  console.log('カメラ切替:', facingUser ? 'インカメラ' : 'アウトカメラ');
});

// 写真撮影ボタン
document.getElementById('capture').addEventListener('click', () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    alert('カメラ映像がまだ準備できていません');
    return;
  }
  const link = document.createElement('a');
  link.download = 'ar-photo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  console.log('写真撮影完了');
});
