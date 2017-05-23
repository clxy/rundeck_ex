var $table = $("#list");

function parse(xml) {
  var objs = xmlToJson($(xml).find('joblist')[0]);
  console.log(JSON.stringify(objs));
}

$.ajax({
  url: 'http://isspsvdev01/rundeck/api/16/project/iSSP/jobs/export?authtoken=QU6scRkJTOi4hBJyBlNQunRDMu0cegyi&format=json',
  type: 'get',
  success: function (xml) {
    parse(xml);
  }
});