/**
 * 试卷配置信息
 */
var configs = {
  fullMarks: 100, //总分
  counts: 100, // 默认100道题
  min: 0, // 数字最小值
  max: 20, // 数字最大值
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
var configModel = false;
/**
 * 显示试卷配置信息窗口
 */
function showConfig() {
  if(!configModel){
    configModel = new bootstrap.Modal(document.getElementById('configModal'));
  }
  configModel.show();
}
/**
 * 生成加法试题
 */
function generateAddEquation() {
  let sum = Math.floor(Math.random() * (configs.max + 1));
  let addon1 = Math.floor(Math.random() * (configs.max + 1));

  do {
    addon1 = Math.floor(Math.random() * (configs.max + 1));
  } while (addon1 > sum);

  let addon2 = sum - addon1;
  let answers = [];

  for (let index = 0; index < 7; index++) {
    let sumError = Math.floor(Math.random() * (configs.max + 1));
    do {
      sumError = Math.floor(Math.random() * (configs.max + 1));
    } while (sumError == sum);
    answers.push({
      answer: sumError,
      type: 'error'
    });
  }

  let randomIndex = Math.floor(Math.random() * 4);
  answers.splice(randomIndex, 0, {
    answer: sum,
    type: 'correct'
  });
  configs.equations.push(
    {
      equation: `${addon1} + ${addon2}`, // 题目字符串
      isError: false, // 是否是答错的题
      answer: sum, // 正确结果
      answers: answers, // 所有可选答案
    }
  );
}
/**
 * 生成减法试题
 */
function generateMinisEquation() {
  let minuend = Math.floor(Math.random() * (configs.max + 1));

  do {
    minuend = Math.floor(Math.random() * (configs.max + 1));
  } while (minuend < Math.max(Math.abs(configs.min), 1));

  let subtrahend = Math.floor(Math.random() * (configs.max + 1));

  do {
    subtrahend = Math.floor(Math.random() * (configs.max + 1));
  } while (subtrahend > minuend);

  let result = minuend - subtrahend;

  let answers = [];

  for (let index = 0; index < 7; index++) {
    let resultError = Math.floor(Math.random() * (minuend + 1));
    do {
      resultError = Math.floor(Math.random() * (minuend + 1));
    } while (resultError == result);
    answers.push({
      answer: resultError,
      type: 'error'
    });
  }

  let randomIndex = Math.floor(Math.random() * 4);
  answers.splice(randomIndex, 0, {
    answer: result,
    type: 'correct'
  });
  configs.equations.push(
    {
      equation: `${minuend} - ${subtrahend}`, // 题目字符串
      isError: false, // 是否是答错的题
      answer: result, // 正确结果
      answers: answers, // 所有可选答案
    }
  );
}
/**
 * 生成题目。
 */
function generateEquations() {
  for (let count = 0; count < configs.counts; count++) {
    if (configs.hasAdd && configs.hasMinis) {
      let type = Math.floor(Math.random() * 2);
      if (type < 1) {
        generateAddEquation();
      } else {
        generateMinisEquation();
      }
    } else if (configs.hasAdd) {
      generateAddEquation();
    } else if (configs.hasMinis) {
      generateMinisEquation();
    } else {
      return;
    }
  }
}
/**
 * 停止倒计时
 */
function stopTimer() {
  if (configs.timerIntervalId) {
    clearInterval(configs.timerIntervalId);
  }
  configs.timerIntervalId = 0;
}
/**
 * 开始倒计时
 */
function startTimer() {
  if (configs.timerIntervalId) {
    clearInterval(configs.timerIntervalId);
  }
  configs.timerIntervalId = 0;
  let currentTime = 0;
  $("#timer").css("width", "100%");
  configs.timerIntervalId = setInterval(() => {
    currentTime += 25;
    if (currentTime > configs.secondsPerEquation * 1000) {
      stopTimer();
      setAnswer("timeout");
      return;
    }
    let percent = (100 - currentTime / (configs.secondsPerEquation * 10));
    $("#timer").css("width", percent + "%");
  }, 25);
}
/**
 * 重置试卷
 */
function resetAll() {
  stopTimer();
  configs.scorePerEquation = configs.fullMarks / configs.counts;
  configs.errors = [];
  configs.equations = [];
  configs.isErrorOnly = false;
  configs.currentEquationIndex = -1;
  configs.currentErrorEquationIndex = -1;
  configs.currentScore = 0;
  configs.answerCount = 0;
  generateEquations();
  $("#total-no").html(configs.counts);
  $("#current-no").html(1);
  $("#answerCount").val(0);
  $("#score").html(0);
  $("#currentScore").val(0);
  toNextEquation();
}
/**
 * 重置题目信息
 * @param equation 题目信息
 */
function resetEquation(equation) {
  $("#equation").html(equation.equation);
  let results = equation.answers;
  $(".results").removeClass("answered");
  let resultDoms = $(".result");
  resultDoms.removeClass("error");
  resultDoms.removeClass("correct");
  resultDoms.removeClass("clicked");
  let resultLength = Math.min(results.length, resultDoms.length);
  for (let index = 0; index < resultLength; index++) {
    let result = results[index];
    let resultDom = $(resultDoms[index]);
    resultDom.find("span").html(result.answer);
    resultDom.addClass(result.type);
  }
  startTimer();
}
/**
 * 重做错题
 */
function toErrors() {
  if (configs.errors.length < 1) {
    for (let index = 0; index < configs.equations.length; index++) {
      let equation = configs.equations[index];
      if (equation.isError) {
        configs.errors.push(equation);
      }
    }
  }
  if (configs.errors.length > 0) {
    let errors = [];
    for (let index = 0; index < configs.errors.length; index++) {
      let equation = configs.errors[index];
      if (equation.isError) {
        errors.push(equation);
      }
    }
    configs.errors = errors;
  }
  if (configs.errors.length < 1) {
    showAllResult();
    return;
  }
  configs.isErrorOnly = true;
  configs.currentErrorEquationIndex = -1;
  toNextErrorEquation();
}
/**
 * 跳转到下一题
 */
function toNextEquation() {
  stopTimer();
  configs.currentEquationIndex = configs.currentEquationIndex + 1;
  if (configs.currentEquationIndex >= configs.equations.length) {
    toErrors();
    return;
  }
  $("#current-no").html(configs.currentEquationIndex + 1);
  resetEquation(configs.equations[configs.currentEquationIndex]);
}
/**
 * 跳转到下一错题
 */
function toNextErrorEquation() {
  stopTimer();
  configs.currentErrorEquationIndex = configs.currentErrorEquationIndex + 1;
  if (configs.currentErrorEquationIndex >= configs.errors.length) {
    toErrors();
    return;
  }
  resetEquation(configs.errors[configs.currentErrorEquationIndex]);
}
/**
 * 显示试卷最终结果。
 */
function showAllResult() {
  showConfig();
}
/**
 * 答题-设置答案
 * @param {number} answer 
 */
function setAnswer(answer) {
  $(".results").addClass("answered");
  stopTimer();
  let equation = {};
  if (configs.isErrorOnly) {
    equation = configs.errors[configs.currentErrorEquationIndex];
  } else {
    equation = configs.equations[configs.currentEquationIndex];
  }
  configs.answerCount = configs.answerCount + 1;
  $("#answerCount").val(configs.answerCount + "/" + configs.counts + "(题目总数)");
  if (answer == equation.answer) {
    equation.isError = false;
    configs.currentScore = configs.currentScore + configs.scorePerEquation;
    $("#currentScore").val(configs.currentScore);
    $("#score").html(configs.currentScore);
  } else {
    equation.isError = true;
  }
  setTimeout(() => {
    if (configs.isErrorOnly) {
      toNextErrorEquation();
    } else {
      toNextEquation();
    }
  }, 1000);
}

// 页面加载完成
$(function () {
  resetAll();
  $(".result").click(function () {
    let $this = $(this);
    if ($this.parent().hasClass("answered")) {
      return;
    }
    $this.addClass("clicked");
    let answer = $this.find("span").html();
    setAnswer(answer);
  });
  $("#config-btn").click(() => {
    showConfig();
  });
  $("#config-comfirm-btn").click(() => {
    configs.max = parseInt($("#max").val());
    configs.secondsPerEquation = parseInt($("#secondsPerEquation").val());
    configs.hasAdd = $("#hasAdd").val();
    configs.hasAdd = configs.hasAdd === "true";
    configs.hasMinis = $("#hasMinis").val();
    configs.hasMinis = configs.hasMinis === "true";
    configs.fullMarks = parseInt($("#fullMarks").val());
    configs.counts = parseInt($("#counts").val());
    if(configs.max > 0 && (configs.hasAdd || configs.hasMinis)){
      configModel.hide();
      resetAll();
    }
  });
});
