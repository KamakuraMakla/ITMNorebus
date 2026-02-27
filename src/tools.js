//coding: utf-8
//sendImage
DEFAULT_URL = "http://localhost:5000/count";

async function sendImage(file, url) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  console.log("person count:", data.count);

    // 画像表示
  const imgEl = document.getElementById("resultImg");
  imgEl.src = "data:image/jpeg;base64," + data.image_b64_jpg;

  document.getElementById("queue").value = data.count;
}
