function checkPartner() {
  var inputId = document.getElementById('partnerId').value;
  var resultDisplay = document.getElementById('resultDisplay');

  if (inputId === "") {
    resultDisplay.innerHTML = "IDを入力してください！";
    return;
  }

  // JSONファイルをフェッチして照合
  fetch('./assets/partners.json')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(function(data) {
      if (data[inputId]) {
        var partnerName = data[inputId];
        resultDisplay.innerHTML = "あなたがプレゼントをあげるのは...<br><span style='font-size:2.4rem; font-weight:bold; display:block; margin-top:10px;'>" + partnerName + " さん</span>";
      } else {
        resultDisplay.innerHTML = "該当するIDが見つかりません。<br>入力間違ってない？";
      }
    })
    .catch(function(error) {
      console.error('Error:', error);
      resultDisplay.innerHTML = "データの読み込みに失敗しました。";
    });
}

// グローバルスコープに公開（念のため）
window.checkPartner = checkPartner;

