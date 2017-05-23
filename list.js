var lastUpdate = false;
var jobs = [];

function fetch(api, args) {
  var param = $.extend({
    authtoken: CONFIG.authtoken,
    format: 'json'
  }, args || {});

  return $.ajax({
    url: CONFIG.url + api + '?' + $.param(param),
    type: 'get'
  })
}

function fetchAll() {
  fetch('project/iSSP/jobs').done(function (data) {
    showMessage('Job数 :' + data.length);

    [data[0]].forEach(function (d) {
      fetch('job/' + d.id, { format: 'yaml' }).done(function (jobYaml) {
        var job = jsyaml.load(jobYaml)[0];
        jobs.push($.extend(job, { scheduleString: JSON.stringify(job.schedule) }));
      });
    });
  });
}

function doPrint() {
  // showMessage(localStorage.getItem("lastUpdate"));
  showMessage(lastUpdate);

  var $table = $("#list");
  $table.children('tbody').empty();
  // console.log(localStorage.getItem("jobs"));
  console.log(jobs);
}

function showMessage(msg) {
  $('.message').text(msg);
  $("#hoge").prop('disabled', false);
}

// cacheしようとする
// function saveData() {
//   localStorage.setItem("lastUpdate", lastUpdate + " - " + new Date());
//   localStorage.setItem("jobs", jobs);
// }

$(function () {
  $('.btn-refresh').on('click', fetchAll);

  $(document)
    .ajaxStart(function () {
      $('.btn-refresh').prop('disabled', true);
      lastUpdate = '更新中...';
      jobs = [];
      showMessage(lastUpdate);
    })
    .ajaxError(function () {
      lastUpdate = '失敗...';
    })
    .ajaxComplete(function () {
      doPrint();
      $('.btn-refresh').prop('disabled', false);
    });

  if (!lastUpdate) fetchAll();
  doPrint();
});
