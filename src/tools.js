//coding: utf-8
//sendImage
const DEFAULT_URL = "https://kyotonorebus.kamakuramakla.org/norebus.php?action=count";

async function sendImage(file, url) {
  const formData = new FormData();
  formData.append("image", file);

 const res = await fetch("https://kyotonorebus.kamakuramakla.org/norebus.php?action=count", {
  method: "POST",
  body: formData,
});

const json = await res.json();

const count = json.data?.count;
const imageBase64 = json.data?.image_b64_jpg;

console.log("person count:", count);

document.querySelector("#person-count").textContent = count ?? 0;

if (imageBase64) {
  document.querySelector("#result-image").src =
    `data:image/jpeg;base64,${imageBase64}`;
}

  document.getElementById("queue").value = data.count;
}
