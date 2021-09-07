/**
 * 试卷配置信息
 */
var configs = {
  fullMarks: 100, //总分
  counts: 100, // 默认100道题
  min: 0, // 和或被减数最小值
  max: 20, // 和或被减数最大值
  addonMin: 0, // 一个加数或被减数的最小值
  hasZero: false, // 是否可以有0值
  hasMinis: true, // 是否包含减法
  hasAdd: true, // 是否包含加法
  scorePerEquation: 1, // 每道题分值
  secondsPerEquation: 10, // 每个体的解答时间（秒）
  equations: [], // 所有题目
  errors: [], // 错题
  currentEquationIndex: -1, // 当前题目索引号。
  isErrorOnly: false, // 是否只做错题
  currentErrorEquationIndex: -1, // 当前错题索引号。
  currentScore: 0, // 当前得分
  timerIntervalId: 0, // 倒计时定时器ID。
  answerCount: 0, // 答题次数。
};
/**
 * 定义一道题目
 */
var equation = {
  equation: '2+3=?', // 题目字符串
  isError: false, // 是否是答错的题
  answer: '5', // 正确结果
  firstNumber: '2', // 算式第一个数字
  secondNumber: '3', // 算式第二个数字
  symbol: '+', // 算式符号
  answers: [ // 定义可选答案
    {
      answer: '3',
      type: 'error'
    },
    {
      answer: '4',
      type: 'error'
    },
    {
      answer: '5',
      type: 'correct'
    },
  ]
};

/**
 * 设置对话框。
 */
var configModal = false;
/**
 * 生成减法试题
 */
function generateEquation(type) {
  let sum = 0;
  let addon1 = 0;

  do {
    sum = Math.floor(Math.random() * (configs.max + 1));
  } while (sum < Math.max(Math.abs(configs.min), 2));

  do {
    addon1 = Math.floor(Math.random() * (configs.max + 1));
  } while (addon1 > sum || addon1 < Math.abs(configs.addonMin) || ((!configs.hasZero) && addon1 == sum) || ((!configs.hasZero) && addon1 == 0));

  let addon2 = sum - addon1;

  let firstNumber = addon1;
  let secondeNumber = addon2;
  let result = sum;
  let symbol = '+';

  if (type == 'minis') {
    firstNumber = sum;
    secondeNumber = addon1;
    result = addon2;
    equation = `${firstNumber} + ${secondeNumber}`;
    symbol = '-';
  } else { // 默认是加法
  }


  let answers = [];

  let wrongResults = [];
  if (result < 5) {
    for (let num = 0; num < result; num++) {
      wrongResults.push(num);
    }
  } else {
    for (let num = result - 5; num < result; num++) {
      wrongResults.push(num);
    }
  }
  for (let num = result + 1; num < result + 6; num++) {
    wrongResults.push(num);
  }

  if (wrongResults.length < 10) {
    for (let num = 0; num < 10 - wrongResults.length; num++) {
      wrongResults.push(result + 6 + num);
    }
  }

  for (let index = 0; index < 3; index++) { 
    let wrongResultIndex = Math.floor(Math.random() * (wrongResults.length));
    answers.push({
      answer: wrongResults[wrongResultIndex],
      type: 'error'
    });
    wrongResults.splice(wrongResultIndex, 1);
  }

  let randomIndex = Math.floor(Math.random() * 4);
  answers.splice(randomIndex, 0, {
    answer: result,
    type: 'correct'
  });
  configs.equations.push(
    {
      equation: `${firstNumber} ${symbol} ${secondeNumber}`, // 题目字符串
      isError: false, // 是否是答错的题
      answer: result, // 正确结果
      answers: answers, // 所有可选答案
      firstNumber: `${firstNumber}`, // 算式第一个数字
      secondNumber: `${secondeNumber}`, // 算式第二个数字
      symbol: `${symbol}`, // 算式符号
    }
  );
}
/**
 * 生成题目。
 */
function generateEquations() {
  configs.equations = [];
  for (let count = 0; count < configs.counts; count++) {
    if (configs.hasAdd && configs.hasMinis) {
      let type = Math.floor(Math.random() * 2);
      if (type < 1) {
        generateEquation('add');
      } else {
        generateEquation('minis');
      }
    } else if (configs.hasAdd) {
      generateEquation('add');
    } else if (configs.hasMinis) {
      generateEquation('minis');
    } else {
      return;
    }
  }
}

/**
 * 重置试卷配置信息
 */
function resetConfigModel() {
  configs.fullMarks = parseInt($("#fullMarks").val());
  configs.secondsPerEquation = parseInt($("#secondsPerEquation").val());
  configs.counts = parseInt($("#counts").val());
  configs.max = parseInt($("#max").val());
  configs.max = (configs.max < 2) ? 20 : configs.max;
  configs.min = parseInt($("#min").val());
  configs.min = (configs.min < 0) ? 0 : configs.min;
  configs.addonMin = parseInt($("#addonMin").val());
  configs.addonMin = (configs.addonMin < 0) ? 0 : configs.addonMin;
  configs.hasAdd = $("#hasAdd").val();
  configs.hasAdd = configs.hasAdd === "true";
  configs.hasMinis = $("#hasMinis").val();
  configs.hasMinis = configs.hasMinis === "true";
  configs.hasZero = $("#hasZero").val();
  configs.hasZero = configs.hasZero === "true";
}

function createConfigMadal(isPc) {
  let madalStartString = `
  <div class="modal fade" id="configModal" tabindex="-1" aria-labelledby="configModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="configModalLabel">设置</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
  `;
  let madalPcString = `
          <div class="mb-1 row">
            <label for="fullMarks" class="col-4 col-form-label">总分：</label>
            <div class="col-8">
              <input type="number" class="form-control" id="fullMarks" value="100">
            </div>
          </div>
          <div class="mb-1 row">
            <label for="currentScore" class="col-4 col-form-label">当前得分：</label>
            <div class="col-8">
              <input type="number" readonly class="form-control-plaintext" id="currentScore" value="10">
            </div>
          </div>
          <div class="mb-1 row">
            <label for="secondsPerEquation" class="col-4 col-form-label">每题秒数：</label>
            <div class="col-8">
              <input type="number" class="form-control" id="secondsPerEquation" value="10">
            </div>
          </div>
          <div class="mb-1 row">
            <label for="answerCount" class="col-4 col-form-label">答题次数：</label>
            <div class="col-8">
              <input type="text" readonly class="form-control-plaintext" id="answerCount" value="10">
            </div>
          </div>  
  `;
  let madalMainString = `
          <div class="mb-1 row">
            <label for="counts" class="col-4 col-form-label">题目数量：</label>
            <div class="col-8">
              <input type="number" class="form-control" id="counts" value="100">
            </div>
          </div>
          <div class="mb-1 row">
            <label for="max" class="col-4 col-form-label">和或被减数最大值(含)：</label>
            <div class="col-8">
              <input type="number" class="form-control" id="max" value="20">
            </div>
          </div>
          <div class="mb-1 row">
            <label for="min" class="col-4 col-form-label">和或被减数最小值(含)：</label>
            <div class="col-8">
              <input type="number" class="form-control" id="min" value="2">
            </div>
          </div>
          <div class="mb-1 row">
            <label for="addonMin" class="col-4 col-form-label">某个加数或被减数最小值(含)：</label>
            <div class="col-8">
              <input type="number" class="form-control" id="addonMin" value="0">
            </div>
          </div>
          <div class="mb-1 row">
            <label for="hasAdd" class="col-4 col-form-label">包含加法：</label>
            <div class="col-8">
              <select class="form-select" id="hasAdd">
                <option selected value=true>试题中包含</option>
                <option value=false>试题中不含</option>
              </select>
            </div>
          </div>
          <div class="mb-1 row">
            <label for="hasMinis" class="col-4 col-form-label">包含减法：</label>
            <div class="col-8">
              <select class="form-select" id="hasMinis">
                <option selected value=true>试题中包含</option>
                <option value=false>试题中不含</option>
              </select>
            </div>
          </div>
          <div class="mb-1 row">
            <label for="hasZero" class="col-4 col-form-label">是否有 0：</label>
            <div class="col-8">
              <select class="form-select" id="hasZero">
                <option value=true>加数或减数有“0”</option>
                <option selected value=false>加数或减数没有“0”</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
          <button type="button" id="config-comfirm-btn" class="btn btn-primary">确定</button>
        </div> 
      </div>
    </div>
  </div> 
  `;

  if (isPc) {
    $('body').append(madalStartString + madalPcString + madalMainString);
  } else {
    $('body').append(madalStartString + madalMainString);
  }

}
