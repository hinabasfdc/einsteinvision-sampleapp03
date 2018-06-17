let IMAGESIZE_MAX = 960;

function changeTab(tab) {
  let elTabImageClassification = document.getElementById("tabImageClassification");
  let elTabLabelImageClassification = document.getElementById("tabLabelImageClassification");
  let elTabObjectDetection = document.getElementById("tabObjectDetection");
  let elTabLabelObjectDetection = document.getElementById("tabLabelObjectDetection");

  if (tab == "tabImageClassification") {
    elTabLabelObjectDetection.classList.remove('slds-is-active');
    elTabLabelImageClassification.classList.add('slds-is-active');

    elTabImageClassification.classList.remove('slds-hide');
    elTabImageClassification.classList.add('slds-show');

    elTabObjectDetection.classList.remove('slds-show');
    elTabObjectDetection.classList.add('slds-hide');

  } else if (tab == "tabObjectDetection") {
    elTabLabelImageClassification.classList.remove('slds-is-active');
    elTabLabelObjectDetection.classList.add('slds-is-active');

    elTabObjectDetection.classList.remove('slds-hide');
    elTabObjectDetection.classList.add('slds-show');

    elTabImageClassification.classList.remove('slds-show');
    elTabImageClassification.classList.add('slds-hide');

  }
}

/****
 * ファイルがドロップされた時の処理
 ****/
function drop_handler(ev) {
  ev.preventDefault();

  var dt = ev.dataTransfer;
  var file;
  //itemsが存在する場合はitemsから、存在しない場合はfilesから実態を取得
  if (dt.items) {
    if (dt.items[0].kind == "file") {
      file = dt.items[0].getAsFile();
    }
  } else {
    file = dt.files[i].getAsFile();
  }

  //画像描画ロジックにまわす
  drawImage(file);
}

//ファイルがドラッグ中の処理
function dragover_handler(ev) {
  ev.preventDefault();
}

/****
* カメラorファイルから画像を読み込み、サイズを縮小した上で表示
****/
function drawImage(file) {

  document.getElementById('tableResult').innerHTML = '';
  document.getElementById('textareaResult').innerHTML = '';

  //fileがまだない場合(ドロップ処理から来た場合ではない)は本文のinputからファイルを取得
  if (!file) {
    file = document.getElementById('file-upload-input-01').files[0];
  }

  //読み込むファイルを取得&画像ファイルでなければファンクション終了
  if (!file.type.match(/^image\/(png|jpeg|gif)$/)) return;

  //結果エリアの表示内容を空に
  //results.innerHTML = '';

  var image = new Image();
  var reader = new FileReader();

  //ファイル読み込み後のアクションを定義
  reader.onload = function (evt) {

    //画像読み込み後のアクションを定義
    //指定したサイズより大きければ、指定サイズになるようにリサイズする
    image.onload = function () {

      //HTML5 CANVASオブジェクトを取得
      var canvas = document.getElementById('cvs');
      var ctx = canvas.getContext('2d');

      var w = image.width;
      var h = image.height;

      if (w > IMAGESIZE_MAX || h > IMAGESIZE_MAX) {
        if (w > h) {
          ratio = IMAGESIZE_MAX / w;
          w = IMAGESIZE_MAX;
          h = h * ratio;
        } else {
          ratio = IMAGESIZE_MAX / h;
          h = IMAGESIZE_MAX;
          w = w * ratio;
        }
      }

      //CANVASのサイズをリサイズ後のサイズに合わせた後に描画実行
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(image, 0, 0, w, h);

      //表示用のイメージオブジェクトに、リサイズした画像データを転記
      document.getElementById('img_target').src = canvas.toDataURL('image/jpeg');
    }
    //画像ファイルをimgオブジェクトのソースに指定
    image.src = evt.target.result;
  }
  //ファイルを読み込み
  reader.readAsDataURL(file);
}

/****
* 画像をクリック or タップしたら右に90度回転
****/
function rotateImage() {

  //CANVASオブジェクトを取得
  let canvas = document.getElementById('cvs');
  let ctx = canvas.getContext('2d');
  let image = new Image();

  image.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = image.height;
    canvas.height = image.width;

    ctx.rotate(90 * Math.PI / 180);
    ctx.translate(0, -image.height);
    ctx.drawImage(image, 0, 0);
    ctx.restore();

    document.getElementById('img_target').src = canvas.toDataURL('image/jpeg');
  }
  image.src = document.getElementById('img_target').src;
}

function drawBox(res) {
  //CANVASオブジェクトを取得
  let canvas = document.getElementById('cvs');
  let ctx = canvas.getContext('2d');
  let image = new Image();
  let boxes = JSON.parse(res);

  image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.beginPath();
    ctx.font = "14px serif";
    ctx.fillStyle = "rgb(237, 255, 77)";
    ctx.strokeStyle = "rgb(237, 255, 77)";
    ctx.lineWidth = 2;
    for (var j = 0; j < boxes.probabilities.length; j++) {
      ctx.fillText(`${boxes.probabilities[j].label}(${(boxes.probabilities[j].probability * 100).toFixed(0)}%)`, boxes.probabilities[j].boundingBox.minX, boxes.probabilities[j].boundingBox.minY - 8);
      ctx.strokeRect(boxes.probabilities[j].boundingBox.minX, boxes.probabilities[j].boundingBox.minY, boxes.probabilities[j].boundingBox.maxX - boxes.probabilities[j].boundingBox.minX, boxes.probabilities[j].boundingBox.maxY - boxes.probabilities[j].boundingBox.minY);
    }
    document.getElementById('img_target').src = canvas.toDataURL('image/jpeg');
  };
  image.src = document.getElementById('img_target').src;
}

function setResult(res, func) {
  document.getElementById('tableResult').innerHTML = '';
  document.getElementById('textareaResult').innerHTML = res;

  let json = JSON.parse(res);
  let pre_tableResult = '<table class="slds-table slds-table_bordered slds-table_cell-buffer"><thead><tr class="slds-text-title_caps"><th scope="col"><div class="slds-truncate" title="Label">Label</div></th><th scope="col"><div class="slds-truncate" title="Probability">Probability</div></th></tr></thead><tbody>';
  for (let i = 0; i < json.probabilities.length; i++) {
    let label = json.probabilities[i].label;
    let probability = (json.probabilities[i].probability * 100).toFixed(0) + "%";
    pre_tableResult += `<tr><th scope="row" data-label="Label"><div class="slds-truncate" title="${label}">${label}</div></th><td data-label="Probability"><div class="slds-truncate" title="${probability}">${probability}</div></td></tr>`;
  }
  pre_tableResult += '</tbody></table>';
  document.getElementById('tableResult').innerHTML = pre_tableResult;

  if (func == "OBJECTDETECTION") {
    drawBox(res);
  }
}

function callVisionApi(callFunction) {  
  let canvas = document.getElementById('cvs');
  let func = '';
  let modelId = '';

  if (callFunction == 'IMAGECLASSIFICATION') {
    func = 'IMAGECLASSIFICATION';
    modelId = document.getElementById('selectModelImageClassification').value
  } else if (callFunction == 'OBJECTDETECTION') {
    func = 'OBJECTDETECTION';
    modelId = document.getElementById('selectModelObjectDetection').value
  }

  if (func != '' && modelId != '') {
    document.getElementById('tableResult').innerHTML = '<div class="slds-align_absolute-center" style="height: 6rem;"><div role="status" class="slds-spinner slds-spinner_medium slds-spinner_inline"><span class="slds-assistive-text">Loading</span><div class="slds-spinner__dot-a"></div><div class="slds-spinner__dot-b"></div></div></div>';
    document.getElementById('textareaResult').innerHTML = '';
  
    socket.emit('callVisionApi', {
      func: func,
      modelId: modelId,
      base64img: canvas.toDataURL('image/jpeg')
    }, (res) => {
      setResult(res, func);
    });
  } else {
    window.alert('Please check function or model selection.');
  }
}