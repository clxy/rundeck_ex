var lastUpdate = false;
var jobs = [];

function fetch(api) {
  return $.ajax({
    url: CONFIG.url + api,
    dataType: "html",
    type: 'get'
  });
}

function fetchAll() {
  fetch('/rundeck/project/iSSP/jobs').done(function (jobsData) {
    var $jobs = $(jobsData).find(".sectionhead");
    if ($jobs.length <= 0) {
      lastUpdate = "先にログインしてください";
      return;
    }

    showMessage('Job数 :' + $jobs.length);
    $jobs.each(function (i, job) {
      var jobUrl = $(job).find(".hover_show_job_info").attr("href");
      fetch(jobUrl).done(function (jobData) {
        var $jobData = $(jobData);
        jobs.push({
          group: $.trim($jobData.find(".jobInfoSection a.secondary").text()),
          name: $.trim($jobData.find(".jobInfoSection a.primary").text()),
          schedule: $.trim($jobData.find(".crontab").text()),
          nextExecution: $.trim($jobData.find("#schedExDetails .timeabs").text()),
          steps: $jobData.find(".argString").map(function () { return $.trim($(this).text()); }).get().join("<br>"),
          nodes: $.trim($jobData.find("[title='Display matching nodes'] .queryvalue").text()),
          notification: $.trim($jobData.find(".displabel").next('td').text()).replace(/\n/g, '').replace(/( )+/g, ' ')
        });
      });
      // return false;
    });
  });
}

function doPrint() {
  showMessage(lastUpdate);

  jobs.sort(function (j1, j2) {
    var g1 = j1.group;
    var g2 = j2.group;
    return ((g1 < g2) ? -1 : ((g1 > g2) ? 1 : 0));
  });

  var $tbody = $("#list").children('tbody');
  $tbody.empty();
  var template = $('.template').html();
  $.each(jobs, function (i, job) {
    $tbody.append("<tr>" + nano(template, { index: i, job: job }) + "</tr>");
  });

  lastUpdate = "完了..." + new Date();
  showMessage(lastUpdate);
}

function showMessage(msg) {
  $('.message').text(msg);
  $("#hoge").prop('disabled', false);
}

$(function () {
  $('.btn-refresh').on('click', fetchAll);

  $(document)
    .ajaxStart(function () {
      $('.btn-refresh').prop('disabled', true);
      lastUpdate = '更新中...';
      jobs = [];
      showMessage(lastUpdate);
    })
    .ajaxError(function (event, request, settings) {
      lastUpdate = '失敗...';
    })
    .ajaxSuccess(function (event, request, settings) {
      lastUpdate = '表示中...';
    })
    .ajaxComplete(function () {
      doPrint();
      $('.btn-refresh').prop('disabled', false);
    });

  if (!lastUpdate) fetchAll();
});
