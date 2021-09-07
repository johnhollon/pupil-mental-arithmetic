
/**
 * 显示试卷配置信息窗口
 */
function showConfig() {
  if (!configModal) {
    configModal = new bootstrap.Modal(document.getElementById('configModal'));
  }
  configModal.show();
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
  
  createConfigMadal(true);

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
    resetConfigModel();
    if (configs.max > 0 && (configs.hasAdd || configs.hasMinis)) {
      configModal.hide();
      resetAll();
    }
  });
});
