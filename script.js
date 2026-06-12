let facingUser = false;

// カメラ切替
document.getElementById('switchCamera').addEventListener('click', () => {
  facingUser = !facingUser;
  const scene = document.querySelector('a-scene');
  const camera = scene.querySelector('a-entity[camera]');
  camera.setAttribute('arjs', 'sourceType', facingUser ? 'user' : 'environment');
});

// 写真撮影
document.getElementById('capture').addEventListener('click', () => {
  const canvas = document.querySelector('canvas');
  const link = document.createElement('a');
  link.download = 'ar-photo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});