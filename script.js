// script.js

window.addEventListener("DOMContentLoaded", () => {
  const sceneEl = document.querySelector("a-scene");
  const statusEl = document.getElementById("status");
  const startBtn = document.getElementById("startAR");
  const switchBtn = document.getElementById("switchCamera");
  const captureBtn = document.getElementById("capture");

  let arStarted = false;

  // 初期カメラ
  // "environment" = アウトカメラ
  // "user" = インカメラ
  let currentFacingMode = "environment";

  // MindARがカメラを起動するときの facingMode を上書きする
  const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

  navigator.mediaDevices.getUserMedia = function (constraints) {
    const newConstraints = {
      ...constraints,
      video: {
        ...(typeof constraints.video === "object" ? constraints.video : {}),
        facingMode: currentFacingMode
      }
    };

    return originalGetUserMedia(newConstraints);
  };

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function getMindARSystem() {
    if (!sceneEl || !sceneEl.systems) return null;

    // MindAR A-Frame版は通常こちら
    if (sceneEl.systems["mindar-image-system"]) {
      return sceneEl.systems["mindar-image-system"];
    }

    // 念のため旧記述にも対応
    if (sceneEl.systems["mindar-image"]) {
      return sceneEl.systems["mindar-image"];
    }

    return null;
  }

  async function waitForMindARSystem(timeoutMs = 5000) {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const timer = setInterval(() => {
        const system = getMindARSystem();

        if (system) {
          clearInterval(timer);
          resolve(system);
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          clearInterval(timer);
          resolve(null);
        }
      }, 100);
    });
  }

  function hideDefaultVRButton() {
    const vrButton = document.querySelector(".a-enter-vr");
    if (vrButton) {
      vrButton.style.display = "none";
      vrButton.style.pointerEvents = "none";
    }
  }

  function forceFullScreenCameraView() {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.style.position = "fixed";
      video.style.top = "0";
      video.style.left = "0";
      video.style.width = "100vw";
      video.style.height = "100vh";
      video.style.objectFit = "cover";
      video.style.zIndex = "0";
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
  }

  sceneEl.addEventListener("loaded", () => {
    hideDefaultVRButton();
    setStatus("AR開始を押してください");
  });

  sceneEl.addEventListener("renderstart", () => {
    hideDefaultVRButton();
    forceFullScreenCameraView();
  });

  window.addEventListener("load", () => {
    hideDefaultVRButton();
    setTimeout(hideDefaultVRButton, 500);
    setTimeout(hideDefaultVRButton, 1500);
    setTimeout(forceFullScreenCameraView, 500);
    setTimeout(forceFullScreenCameraView, 1500);
    setTimeout(forceFullScreenCameraView, 3000);
  });

  // AR開始
  startBtn.addEventListener("click", async () => {
    if (arStarted) {
      setStatus("ARは起動済みです");
      return;
    }

    setStatus("MindARを準備しています...");

    const mindarSystem = await waitForMindARSystem();

    if (!mindarSystem) {
      alert(
        "MindARシステムがまだロードされていません。\n\n" +
        "確認してください：\n" +
        "1. index.html の mind-ar 読み込みURLが正しいか\n" +
        "2. GitHub Pagesに最新のindex.htmlが反映されているか\n" +
        "3. ブラウザのキャッシュを消す、またはシークレットモードで開く"
      );
      setStatus("MindARの読込に失敗");
      return;
    }

    try {
      setStatus("カメラを起動しています...");

      await mindarSystem.start();

      arStarted = true;
      setStatus("マーカーを探しています");

      hideDefaultVRButton();
      setTimeout(forceFullScreenCameraView, 500);
      setTimeout(forceFullScreenCameraView, 1500);
    } catch (err) {
      console.error(err);
      alert("カメラの起動に失敗しました: " + err);
      setStatus("カメラ起動失敗");
    }
  });

  // カメラ切替
  switchBtn.addEventListener("click", async () => {
    const mindarSystem = getMindARSystem();

    if (!mindarSystem) {
      alert("MindARシステムがまだ準備できていません");
      return;
    }

    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";

    try {
      setStatus(currentFacingMode === "environment" ? "アウトカメラへ切替中..." : "インカメラへ切替中...");

      if (arStarted && typeof mindarSystem.stop === "function") {
        await mindarSystem.stop();
      }

      await mindarSystem.start();

      arStarted = true;
      setStatus("マーカーを探しています");

      hideDefaultVRButton();
      setTimeout(forceFullScreenCameraView, 500);
    } catch (err) {
      console.error(err);
      alert("カメラ切替に失敗しました: " + err);
      setStatus("カメラ切替失敗");
    }
  });

  // 写真撮影
  captureBtn.addEventListener("click", () => {
    const canvas = document.querySelector("canvas");

    if (!canvas) {
      alert("カメラ映像がまだ準備できていません");
      return;
    }

    try {
      const link = document.createElement("a");
      link.download = "ar-photo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("写真撮影に失敗しました: " + err);
    }
  });

  // マーカー認識イベント
  const targetEntity = document.querySelector("[mindar-image-target]");

  if (targetEntity) {
    targetEntity.addEventListener("targetFound", () => {
      setStatus("マーカー認識中");
    });

    targetEntity.addEventListener("targetLost", () => {
      setStatus("マーカーを探しています");
    });
  } else {
    console.warn("mindar-image-target が見つかりません。index.html のターゲット記述を確認してください。");
  }
});
