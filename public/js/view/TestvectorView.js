/**
 * Created by danielsilhavy on 04.08.16.
 */

var IMPORT_MAPPING = {
  'Dash Profile(s)': 'profile',
  'MPD type': 'mpd_type',
  '@minimumUpdatePeriod': 'min_update_period',
  '@timeShiftBufferDepth': 'time_shift_buffer_depth',
  'Num Periods': 'num_periods',
  'Total duration': 'duration',
  'max num. Video Repr.': 'max_num_video',
  'max num. Audio Repr.': 'max_num_audio',
  'Multi-resolution video': 'multi_resolution_video',
  'Max video resolution': 'max_video_resolution',
  'mimeType(s)': 'mime_types',
  'Video codecs': 'video_codec',
  'Audio codecs': 'audio_codec',
  'SegmentTemplate': 'segment_template',
  'SegmentTemplate$Number$': 'segment_template_number',
  'SegmentTemplate$Time$': 'segment_template_time',
  'SegmentTemplate@duration': 'segment_template_duration',
  'ContentProtection@schemeIdUri': 'content_protection_schemeid_uri',
  'EssentialProperty@schemeIdUri': 'essential_property_schemeid_uri',
  'UTCTiming@schemeIdUri': 'utc_timing_schemeid_uri',
  'InbandEventStream@schemeIdUri': 'inband_event_stream_schemeid_uri',
  'cenc:pssh': 'cenc_pssh',
  'Max num. BaseURL': 'max_num_base_url',
  'SegmentTemplate@presentationTimeOffset': 'segment_template_presentation_timeoffset',
  'SegmentBase@presentationTimeOffset': 'segment_base_presentation_timeoffset',
  'SupplementalProperty@schemeIdUri': 'supplemental_property_scheme_id_uri',
  'UTCTiming': 'utc_timing_schemeid_uri',
  'xlink:href': 'period_xlink_href',
  'xlink:actuate': 'period_xlink_actuate',
  'AssetIdentifier': 'asset_identifier',
  'Early Terminated period': 'early_terminated_period',
  'Default Content': 'default_content'
};


App.views.TestvectorView = function () {
  App.views.MainView.call(this, 'testvector');
};

App.views.TestvectorView.prototype = new App.views.MainView();
App.views.TestvectorView.prototype.constructor = App.views.TestvectorView;


App.views.TestvectorView.prototype.renderCreate = function (data) {
  var q = Q.defer();
  var self = this;

  data.features = self.getTestcasesByFeature(data.testcases);
  App.utils.HTTPUtils.get(App.constants.requestParameter[self.type + '_template'].CREATE)
    .then(function (templateData) {
      self.renderHandlebars(templateData, data);
      $('#create-form').parsley().on('form:submit', function () {
        EventBus.dispatch(App.constants.events[self.type].CREATE, this, self.getFieldValues());
        return false;
      });

      $('#import-attributes-button').bind('click', function () {
        self.importAttributes();
      });
      q.resolve();
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });

  return q.promise;

};

App.views.TestvectorView.prototype.renderList = function (data, filterPreferences) {
  var self = this;
  var datatableOptions = {};
  var columns = [
    {data: 'testvector'},
    {data: 'featureGroup'},
    {data: 'feature'},
    {data: 'testcase'},
    {data: 'url'},
    {data: 'play'},
  ];
  data.attributes.forEach(function (item) {
      columns.push({data: item.uiName});
  });
  if (data.isAdmin) {
    columns.push({data: 'createdAt'}, {data: 'updatedAt'});
  }
  datatableOptions.columns = columns;
  datatableOptions.ajax = {
    url: App.constants.requestParameter.testvector.GET
  };
  App.utils.HTTPUtils.get(App.constants.requestParameter[this.type + '_template'].LIST)
    .then(function (templateData) {
      self.renderHandlebars(templateData, data);
      self.initializeDataTableAjax('datatable', data, filterPreferences, datatableOptions);
    });
};

App.views.TestvectorView.prototype.renderDetails = function (data) {
  var self = this;


  data.testvector = self.formatDate([data.testvector])[0];
  App.utils.HTTPUtils.get(App.constants.requestParameter[this.type + '_template'].DETAILS)
    .then(function (templateData) {
      self.renderHandlebars(templateData, data);
    });
};

App.views.TestvectorView.prototype.renderGroupedList = function (data, filterPreferences) {
  var self = this;
  var datatableOptions = {};
  var columns = [
    {data: 'testvector'},
    {data: 'featureGroups'},
    {data: 'features'},
    {data: 'testcases'},
    {data: 'url'},
    {data: 'play'},
  ];
  data.attributes.forEach(function (item) {
      columns.push({data: item.uiName});
  });
  if (data.isAdmin) {
    columns.push({data: 'createdAt'}, {data: 'updatedAt'});
  }
  datatableOptions.columns = columns;
  datatableOptions.ajax = {
    url: App.constants.requestParameter.testvector.GROUPED_LIST
  };
  App.utils.HTTPUtils.get(App.constants.requestParameter[this.type + '_template'].GROUPED_LIST)
    .then(function (templateData) {
      self.renderHandlebars(templateData, data);
      self.initializeDataTableAjax('datatable', data, filterPreferences, datatableOptions);
    });
};

App.views.TestvectorView.prototype.importAttributes = function () {
  var url = $('#url').val();
  var data = [];
  var val;

  if (url !== '') {
    App.utils.HTTPUtils.get(url)
      .then(function (xml) {
        data = getMPDParameters(xml, data);
        data = data || [];
        data.forEach(function (item, index, array) {
          // we iterate through the attributes, check if we have a corresponding Mapping and then take the value of the next item
          if (IMPORT_MAPPING[item]) {
            val = array[index + 1];
            $('#' + IMPORT_MAPPING[item]).val(val);
          }
        });
      });
  }
};

App.views.TestvectorView.prototype.renderEdit = function (data) {
  var q = Q.defer();
  var self = this;

  data.features = self.getTestcasesByFeature(data.testcases);
  App.utils.HTTPUtils.get(App.constants.requestParameter[self.type + '_template'].EDIT)
    .then(function (templateData) {
      self.registerHandlebarsSelectHelper();
      self.renderHandlebars(templateData, data);
      $('#edit-form').parsley().on('form:submit', function () {
        EventBus.dispatch(App.constants.events[self.type].EDIT, this, self.getEditFieldValues());
        return false;
      });
      $('#import-attributes-button').bind('click', function () {
        self.importAttributes();
      });
      q.resolve();
    });
  return q.promise;
};

App.views.TestvectorView.prototype.registerHandlebarsSelectHelper = function () {
  Handlebars.registerHelper("select", function (value, options) {
    return options.fn(this)
      .split('\n')
      .map(function (v) {
        value.forEach(function (item) {
          var t = 'value="' + item._id + '"';
          if (RegExp(t).test(v)) {
            v = v.replace(t, t + ' selected="selected"');
          }
        });
        return v;
      })
      .join('\n');
  });
};

App.views.TestvectorView.prototype.getFieldValues = function () {
  var values = {};

  values.name = $('#name').val();
  values.active = $('input[name=active]:checked').val();
  values.includeInDashjsJson = $('input[name=json]:checked').val();
  values.url = $('#url').val();
  values.attributeInstances = [];
  $('.dynamic-attribute').each(function (i, obj) {
    values.attributeInstances.push({
      value: obj.value,
      attribute: obj.attributes['attribute-id'].value
    });
  });
  values.testcases = [];
  $("#testcase-select option:selected").each(function () {
    values.testcases.push($(this).val());
  });
  return values;
};

App.views.TestvectorView.prototype.getEditFieldValues = function () {
  var values = {};
  var self = this;

  values.name = $('#name').val();
  values.active = $('input[name=active]:checked').val();
  values.includeInDashjsJson = $('input[name=json]:checked').val();
  values.url = $('#url').val();
  values.attributeInstances = [];
  $('.dynamic-attribute').each(function (i, obj) {
    values.attributeInstances.push({
      value: obj.value,
      '_id': obj.attributes['attribute-instance-id'].value
    });
  });
  values.testcases = [];
  $("#testcase-select option:selected").each(function () {
    values.testcases.push($(this).val());
  });
  values.id = self.getIdFromHiddenField();

  return values;
};

App.views.TestvectorView.prototype.getIdFromHiddenField = function () {
  return $('#element-id').val() || null;
};

App.views.TestvectorView.prototype.getIdFromButton = function (element) {
  return element.attributes['element-id'].value;
};

App.views.TestvectorView.prototype.getTestcasesByFeature = function (testcases) {
  var features = [];
  var result = [];

  testcases.forEach(function (item) {
    if (!features[item.feature.name]) {
      features[item.feature.name] = {data: item.feature, testcases: []};
    }
    features[item.feature.name].testcases.push(item);
  });
  // We need to turn it into a numeric array for Handlebars
  for (var key in features) {
    result.push(features[key]);
  }

  return result;
};

App.views.TestvectorView.prototype.initializeDataTableAjax = function (id, data, filterPreferences, datatableOptions) {
  var self = this;
  var buttonCommon = {
    exportOptions: {
      format: {
        body: function (data, row, column, node) {
          // if this is the first column and "details" is in the url it must be the textvector column.
          if (column === 0 && data.indexOf('details') !== -1) {
            return data.replace(/<a\b[^>]*>/i, "").replace(/<\/a>/i, "");
          }
          else if (data.indexOf('</a>') !== -1) {
            data = data.match(/href=([^]*)/)[1];
            if (data.indexOf('>Link</a>')) {
              data = data.replace('>Link</a>', '');
            }
            if (data.indexOf('>Play</a>')) {
              data = data.replace('>Play</a>', '');
            }
          }
          return data;
        }
      }
    }
  };

  datatableOptions = datatableOptions || {};
  datatableOptions.pageLength = 50;
  datatableOptions.deferRender = true;
  datatableOptions.ajax.dataSrc = function (json) {
    var result = [];

    if (data.isAdmin) {
      return json.data;
    }
    else if (json && json.data && json.data.length) {
      result = json.data.filter(function (item) {
        return item.active;
      });
    }

    return result;
  };
  datatableOptions.lengthMenu = [[10, 25, 50, -1], [10, 25, 50, "All"]];
  datatableOptions.scrollX = true;
  datatableOptions.dom = 'Bfrtip';
  datatableOptions.buttons = [
    'pageLength',
    $.extend(true, {}, buttonCommon, {
      extend: 'copyHtml5'
    }),
    $.extend(true, {}, buttonCommon, {
      extend: 'excelHtml5',
      fieldSeparator: ';'
    }),
    $.extend(true, {}, buttonCommon, {
      extend: 'csvHtml5',
      fieldSeparator: ';'
    })];
  datatableOptions.deferRender = true;
  self.createDatatableFilters(id);
  // DataTable
  var table = $('#' + id).DataTable(datatableOptions);

  self.addDatatablesSelect(table);
  self.addDatatablesSearch(table, data, filterPreferences);
  self.setContentHeight();
};

