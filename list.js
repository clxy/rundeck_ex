var jobs = [];

function find() {
  if (jobs.length <= 0) return;
  var text = $("#condition").val().trim();
  if (text == '') return show();
  var isOr = false;
  var conds = {};
  $.each(text.split(/[, ]/g), function (i, c) {
    var key = c.toLowerCase();
    if (key == 'or') {
      isOr = true;
      return;
    }
    var p = key.split(/[=]/g);
    if (p.length == 2) conds[p[0]] = p[1];
  });
  show(conds, isOr);
  $(".row-count").text($("#list tbody tr:visible").length);
}

function show(conds, isOr) {
  isOr = isOr || (conds && Object.keys(conds).length == 1);
  $("#list tbody").children('tr').map(function () {
    var $tr = $(this).show();
    if (!conds) return;

    var allMatched = false;
    $tr.children('td').each(function (i, td) {
      var $td = $(td);
      var searhValue = conds[$td.attr('data')];
      if (!searhValue) return;
      var tdMatched = $(td).text().trim().toLowerCase().indexOf(searhValue) >= 0;
      if (tdMatched && isOr) {
        allMatched = true;
        return false;
      }
      if (!tdMatched && !isOr) {
        allMatched = false;
        return false;
      }
      allMatched = allMatched || tdMatched;
    });
    if (!allMatched) $tr.hide();
  });
}

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
    if ($jobs.length <= 0) return;

    showMessage('Job数 :' + $jobs.length);
    $jobs.each(function (i, job) {
      var jobUrl = $(job).find(".hover_show_job_info").attr("href");
      fetch(jobUrl).done(function (jobData) {
        var $jobData = $(jobData);
        jobs.push({
          group: $.trim($jobData.find(".jobInfoSection a.secondary").text()),
          name: $.trim($jobData.find(".jobInfoSection a.primary").text()),
          schedule:
          $jobData
            .find(".crontab .cronselected")
            .map(function () { return $.trim($(this).text()); })
            .get().join(" "),
          nextExecution: $.trim($jobData.find("#schedExDetails .timeabs").text()),
          steps:
          $jobData
            .find(".argString")
            .map(function () { return $.trim($(this).text()); })
            .get().join("<br>"),
          nodes: $.trim($jobData.find("[title='Display matching nodes'] .queryvalue").text()),
          notification:
          $.trim($jobData.find(".displabel").next('td').text())
            .replace(/\n/g, '').replace(/( )+/g, ' ')
        });
      });
      // return false;
    });
  });
}

function doPrint() {
  if (jobs.length <= 0) {
    showMessage("ログイン必要あるかもしれません");
    return;
  } else {
    showMessage("表示中...");
  }

  jobs.sort(function (j1, j2) {
    var g1 = j1.group;
    var g2 = j2.group;
    return ((g1 < g2) ? -1 : ((g1 > g2) ? 1 : 0));
  });

  var $tbody = $("#list").children('tbody');
  $tbody.empty();
  var template = $('.template').html();
  $tbody[0].innerHTML = $.map(
    jobs,
    function (job, i) {
      return "<tr>" + nano(template, { index: i + 1, job: job }) + "</tr>";
    }).join('');

  $(".row-count").text($("#list tbody tr:visible").length);
  showMessage("完了..." + new Date());
}

function showMessage(msg) {
  $('.message').text(msg);
  $("#hoge").prop('disabled', false);
}

$(function () {
  $('.btn-refresh').on('click', fetchAll);
  $('.btn-find').on('click', find);

  $(document)
    .ajaxStart(function () {
      $('.btn-refresh').prop('disabled', true);
      jobs = [];
      showMessage('更新中...');
    })
    .ajaxStop(function () {
      doPrint();
      $('.btn-refresh').prop('disabled', false);
    });

  fetchAll();
});
