

/**
 * canvas容器
 */
let canvasDiv = false;
/**
 * canvas标签
 */
let canvases = [];
let canvasContexes = [];

const pageColumns = 4; // 每页4列
const equationCountsPerPage = 100; // 每页试题数量

// canvas绘图区域大小
const canvasHeight = 3508;
const canvasWidth = 2479;
// canvas绘图区域页面设置
const pageLeftMargin = 239.5;
const pageColumnWidth = 374.75;
const pageColumnGutter = 167;
const pageTopMargin = 254;
const pageLineHeight = 120;
// canvas每个算式组成元素的位置定义
const equationNumberWidth = 50;
const equationSymbolWidth = 50;
const equationNumbersMarginTop = 10;
const equationAnswerWidth = 174.75;
const equationAnswerMarginTop = 20;

// canvas在html中显示的大小。
let canvasCssHeight = 0;
let canvasCssWidth = 0;

// pdf A4 纸张大小
const pdfA4Height = 841.89;
const pdfA4Width = 595.28;

// pdf 构造器。
const { jsPDF } = window.jspdf;
const pdf = new jsPDF('', 'pt', 'a4');


/**
 * 显示试卷配置信息窗口
 */
function showConfig() {
  if (!configModal) {
    configModal = new bootstrap.Modal(document.getElementById('configModal'));
  }
  configModal.show();
}

// 绘制 canvas

function createCanvas() {

  // 清空canvas div容器。
  canvasDiv.html("");

  // if (canvases.length > 0) {
  //   for (let index = 0; index < canvases.length; index++) {
  //     canvasContexes[index].clearRect(0, 0, canvasWidth, canvasHeight);
  //     $(canvases[index]).remove();
  //   }
  // }

  canvases = [];
  canvasContexes = [];

  const equationCounts = configs.counts;
  const pageCount = Math.floor(equationCounts / equationCountsPerPage) + (equationCounts % equationCountsPerPage == 0 ? 0 : 1);

  for (let index = 0; index < pageCount; index++) {
    const canvasContainer = document.createElement("canvas");
    canvasContainer.height = canvasHeight;
    canvasContainer.width = canvasWidth;
    canvasContainer.style.width = canvasCssWidth + 'px';
    canvasContainer.style.height = canvasCssHeight + 'px';
    canvasContainer.classList.add("border", "my-2");
    canvasDiv.append(canvasContainer);
    canvases.push(canvasContainer);

    const canvasContext = canvasContainer.getContext("2d");

    // 绘制背景颜色
    canvasContext.fillStyle = "#ffffff";
    canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

    // 设置字体和颜色
    canvasContext.fillStyle = "#000000";
    canvasContext.strokeStyle = "#000000";
    canvasContext.font = '48px "monospace"';
    canvasContext.textAlign = "center";
    canvasContexes.push(canvasContext);
  }

  for (let index = 0; index < equationCounts; index++) {
    // 确定公式的位置
    let pageEquationIndex = index % equationCountsPerPage;
    let equationStartX = pageLeftMargin + (pageEquationIndex % 4) * pageColumnGutter + pageColumnWidth + (pageEquationIndex % 4 - 1) * + pageColumnWidth;
    let eqautionStartY = pageTopMargin + (Math.floor(pageEquationIndex / 4)) * pageLineHeight;

    const canvasContext = canvasContexes[Math.floor(index / equationCountsPerPage)];

    // 绘制第一个数字
    let penX = equationStartX;
    let penY = eqautionStartY + equationNumbersMarginTop;
    canvasContext.fillText(configs.equations[index].firstNumber, penX, penY, equationNumberWidth);

    // 绘制符号
    penX += equationNumberWidth;
    canvasContext.fillText(configs.equations[index].symbol, penX, penY, equationSymbolWidth);

    // 绘制第二个数字
    penX += equationSymbolWidth;
    canvasContext.fillText(configs.equations[index].secondNumber, penX, penY, equationNumberWidth);

    // 绘制等于号
    penX += equationNumberWidth;
    canvasContext.fillText('=', penX, penY, equationSymbolWidth);

    // 绘制答案横线
    penX += equationSymbolWidth;
    penY = eqautionStartY + equationAnswerMarginTop;
    canvasContext.beginPath();
    canvasContext.moveTo(penX, penY);
    canvasContext.lineTo(penX + equationAnswerWidth, penY);
    canvasContext.stroke();
    canvasContext.stroke();
  }
}

// 创建pdf文件。
function createPdf() {

  for (let index = 0; index < canvases.length; index++) {
    let canvasContainer = canvases[index];
    const pageData = canvasContainer.toDataURL('image/jpeg', 1.0);
    pdf.addImage(pageData, 'JPEG', 0, 0, pdfA4Width, pdfA4Height);
    if (index < canvases.length - 1) {
      pdf.addPage();
    }
  }

  const now = new Date();
  let month = now.getMonth() + 1;
  month = month < 10 ? ("0" + month) : month;
  let date = now.getDate();
  date = date < 10 ? ("0" + date) : date;
  const dateString = "" + now.getFullYear() + month + date + "-" + now.getTime();
  pdf.save('口算练习-' + dateString + '.pdf');
}

// 页面加载完成
$(function () {

  createConfigMadal(false);

  generateEquations();


  canvasDiv = $("#canvas-div");

  canvasCssWidth = canvasDiv.width();
  canvasCssHeight = canvasCssWidth * canvasHeight / canvasWidth;

  createCanvas();

  $("#config-btn").click(() => {
    showConfig();
  });
  $("#download-btn").click(() => {
    createPdf();
  });
  $("#config-comfirm-btn").click(() => {
    resetConfigModel();
    if (configs.max > 0 && (configs.hasAdd || configs.hasMinis)) {
      configModal.hide();
      generateEquations();
      createCanvas();
    }
  });
});
