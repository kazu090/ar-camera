// script.js

window.addEventListener("DOMContentLoaded", () => {
  const sceneEl = document.getElementById("arScene") || document.querySelector("a-scene");
  const statusEl = document.getElementById("status");
  const reloadBtn = document.getElementById("startAR");
  const switchBtn = document.getElementById("switchCamera");
  const captureBtn = document.getElementById("capture");
  const targetEntity = document.getElementById("target") || document.querySelector("[mindar-image-target]");

  let markerFound = false;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function getCurrentFacingMode() {
    const params = new URLSearchParams(location.search);
    return params.get("cam") === "user" ? "user" : "environment";
  }

  function hideDefaultButtons() {
    document.querySelectorAll(".a-enter-vr, .a-enter-ar, .a-orientation-modal, .a-enter-vr-button, .a-enter-ar-button").forEach((el) => {
      el.style.display = "none";
      el.style.pointerEvents = "none";
      el.style.opacity = "0";
      el.style.visibility = "hidden";
    });
  }

  function forceFullScreenCameraView() {
    document.querySelectorAll("video").forEach((video) => {
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.style.position = "fixed";
      video.style.top = "0";
      video.style.left = "0";
      video.style.width = "100vw";
      video.style.height = "100vh";
      video.style.objectFit = "cover";
      video.style.zIndex = "0";
      video.style.background = "transparent";
    });

    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.zIndex = "1";
      canvas.style.background = "transparent";
    }

    if (sceneEl && sceneEl.renderer) {
      sceneEl.object3D.background = null;
      sceneEl.renderer.setClearColor(0x000000, 0);
    }
  }

  function markCameraPossiblyStarted() {
    document.body.classList.add("ar-started");
    if (!markerFound) setStatus("マーカーを探しています");
    hideDefaultButtons();
    forceFullScreenCameraView();
  }

  function reloadWithCamera(facingMode) {
    const url = new URL(location.href);
    url.searchParams.set("cam", facingMode);
    url.searchParams.set("v", Date.now().toString());
    location.href = url.toString();
  }

  // このボタンは、手動startではなく、安全な再読み込みにする。
  // MindARはページ読込時に自動でカメラを開始する構成。
  reloadBtn.addEventListener("click", () => {
    const current = getCurrentFacingMode();
    reloadWithCamera(current);
  });

  // カメラ切替は、MindAR内部APIを直接触らず、facingModeを変えて再読込する。
  // スマホブラウザではこの方が安定する。
  switchBtn.addEventListener("click", () => {
    const next = getCurrentFacingMode() === "environment" ? "user" : "environment";
    setStatus(next === "environment" ? "アウトカメラへ切替中..." : "インカメラへ切替中...");
    reloadWithCamera(next);
  });

  // 写真撮影：カメラ映像とAR canvasを合成して保存
  captureBtn.addEventListener("click", () => {
    const video = document.querySelector("video");
    const arCanvas = document.querySelector("canvas");

    if (!video || !arCanvas) {
      alert("カメラ映像がまだ準備できていません");
      return;
    }

    try {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const out = document.createElement("canvas");
      out.width = width * window.devicePixelRatio;
      out.height = height * window.devicePixelRatio;

      const ctx = out.getContext("2d");
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // videoを画面いっぱいobject-fit: cover相当で描画
      const vw = video.videoWidth || width;
      const vh = video.videoHeight || height;
      const scale = Math.max(width / vw, height / vh);
      const sw = width / scale;
      const sh = height / scale;
      const sx = (vw - sw) / 2;
      const sy = (vh - sh) / 2;
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);

      ctx.drawImage(arCanvas, 0, 0, width, height);

      const link = document.createElement("a");
      link.download = "ar-photo.png";
      link.href = out.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("写真撮影に失敗しました: " + err);
    }
  });

  if (sceneEl) {
    sceneEl.addEventListener("loaded", () => {
      hideDefaultButtons();
      setStatus("カメラ許可が出たら許可してください");
    });

    sceneEl.addEventListener("renderstart", () => {
      markCameraPossiblyStarted();
    });

    sceneEl.addEventListener("arReady", () => {
      markCameraPossiblyStarted();
    });

    sceneEl.addEventListener("arError", (event) => {
      console.error("MindAR arError", event);
      setStatus("カメラ起動エラー");
      alert("カメラ起動でエラーが出ました。URLがhttpsか、カメラ権限が許可されているか確認してください。");
    });
  }

  if (targetEntity) {
    targetEntity.addEventListener("targetFound", () => {
      markerFound = true;
      setStatus("マーカー認識中");
    });

    targetEntity.addEventListener("targetLost", () => {
      markerFound = false;
      setStatus("マーカーを探しています");
    });
  } else {
    console.warn("mindar-image-target が見つかりません。index.htmlを確認してください。");
  }

  window.addEventListener("load", () => {
    hideDefaultButtons();
    setTimeout(hideDefaultButtons, 500);
    setTimeout(hideDefaultButtons, 1500);
    setTimeout(forceFullScreenCameraView, 500);
    setTimeout(forceFullScreenCameraView, 1500);
    setTimeout(forceFullScreenCameraView, 3000);
  });

  setInterval(() => {
    hideDefaultButtons();
    forceFullScreenCameraView();
  }, 1200);
});
