/**
 * Created by danielsilhavy on 01.08.16.
 */

App.controller.MainController = function (model, view, type) {
  this.model = model;
  this.view = view;
  this.type = type;
  this.loginModel = App.models.LoginModel.getInstance();
};

App.controller.MainController.prototype.registerEvents = function () {
  var self = this;

  EventBus.addEventListener(App.constants.events[self.type].CREATE, self.onCreateElement.bind(this));
  EventBus.addEventListener(App.constants.events[self.type].EDIT, self.onEditElement.bind(this));
  EventBus.addEventListener(App.constants.events[self.type].DELETE, self.onDeleteElement.bind(this));
  EventBus.addEventListener(App.constants.events[self.type].TOGGLE_COLUMN, self.onToggleColumn.bind(this));
};

App.controller.MainController.prototype.onToggleColumn = function (callee, data) {
  this.loginModel.setFilterPreferences(data.type, data.attributes);
};

App.controller.MainController.prototype.onCreateElement = function (callee, data) {
  var self = this;
  // We need to add the createdby field
  data.createdby = self.loginModel.getLoginData()._id;
  self.model.createElements(data)
    .then(function () {
      self.view.clearView();
      App.views.MessageView.renderSuccessMessage({message: 'Created element'});
      self.actionCreate();
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
      self.actionCreate();
    });
};

App.controller.MainController.prototype.onEditElement = function (callee, data) {
  var self = this;

  self.model.editElement(data)
    .then(function () {
      self.view.clearView();
      App.views.MessageView.renderSuccessMessage({message: 'Edited element'});
      self.view.setRoute(self.type.toLowerCase() + '/mylist');
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
      self.actionEdit();
    });
};

App.controller.MainController.prototype.onDeleteElement = function (callee, id) {
  var self = this;

  self.model.deleteElement(id)
    .then(function () {
      self.view.clearView();
      App.views.MessageView.renderSuccessMessage({message: 'Deleted element'});
      self.actionMyList();
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
      self.actionMyList();
    });
};

App.controller.MainController.prototype.handleRequest = function (route) {
  var action;
  var id;

  action = typeof route[1] !== 'undefined' ? route[1] : 'default';
  switch (action) {
    // get all the attributes and list them
    case 'list':
      this.actionList();
      break;
    case 'groupedList':
      this.actionGroupedList();
      break;
    case 'create':
      this.actionCreate();
      break;
    case 'edit':
      id = typeof route[2] !== 'undefined' ? route[2] : null;
      this.actionEdit(id);
      break;
    case 'mylist':
      this.actionMyList();
      break;
    case 'details':
      id = typeof route[2] !== 'undefined' ? route[2] : null;
      this.actionDetail(id);
      break;
    default:
      this.actionList();
  }
};

App.controller.MainController.prototype.actionList = function () {
  var renderData = {};
  var self = this;
  var filterPreferences = self.loginModel.getFilterPreferences();

  self.model.getElements()
    .then(function (data) {
      renderData.entries = data;
      renderData.isAdmin = self.loginModel.isAdmin();
      self.view.renderList(renderData, filterPreferences);
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};

App.controller.MainController.prototype.actionCreate = function () {
  return this.view.renderCreate();
};

App.controller.MainController.prototype.actionEdit = function (id) {
  var self = this;

  if (!id) {
    App.handler.Errorhandler.handleError(new Error('Invalid ID specified'));
  } else {
    self.model.getElementById(id)
      .then(function (data) {
        self.view.renderEdit(data);
      })
      .catch(function (error) {
        App.handler.Errorhandler.handleError(error);
      });
  }
};

App.controller.MainController.prototype.actionMyList = function () {
  var renderData = {};
  var self = this;
  var filterPreferences = self.loginModel.getFilterPreferences();

  self.model.getMyElements()
    .then(function (data) {
      renderData.entries = data;
      renderData.isAdmin = self.loginModel.isAdmin();
      self.view.renderMyList(renderData, filterPreferences);
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};

App.controller.MainController.prototype.filterInactiveAttributes = function (items) {
  return items.filter(function (item) {
    return item.active;
  })
};

App.controller.MainController.prototype.filterInactiveTestcases = function (items) {
  var result;

  result = items.filter(function (tc) {
    var valid = false;

    if (!tc.active) {
      return false;
    }
    if (tc.hasOwnProperty('feature')) {
      if (tc.feature.active && tc.feature.hasOwnProperty('featureGroup') && tc.feature.featureGroup.active) {
        valid = true;
      }
    } else {
      valid = true;
    }
    return valid;
  });
  return result;
};

App.controller.MainController.prototype.filterInactiveFeatures = function (items) {
  var result;

  result = items.filter(function (feature) {
      var valid = false;

      if (!feature.active) {
        return false;
      }
      if (feature.hasOwnProperty('featureGroup')) {
        if (feature.featureGroup.active) {
          valid = true;
        }
      } else {
        valid = true;
      }
      return valid;
    }
  );
  return result;
};

App.controller.MainController.prototype.filterInactiveFeatureGroups = function (items) {
  return items.filter(function (item) {
    return item.active;
  });
};

App.controller.MainController.prototype.filterInactiveTestvectors = function (items) {
  var result;

  result = items.filter(function (item) {
    var valid = false;

    if (!item.active) {
      return false;
    }
    if (item.hasOwnProperty('testcases')) {
      item.testcases.forEach(function (tc) {
        if (tc.active) {
          if (tc.hasOwnProperty('feature') && tc.feature.active) {
            if (tc.feature.hasOwnProperty('featureGroup') && tc.feature.featureGroup.active) {
              valid = true;
            }
          }
        }
      });
    } else {
      valid = true;
    }
    return valid;
  });
  return result;
};

App.controller.MainController.prototype.filterData = function (items) {
  var self = this;

  if (items.hasOwnProperty('featureGroups')) {
    items.featureGroups = self.filterInactiveFeatureGroups(items.featureGroups);
  }
  if (items.hasOwnProperty('features')) {
    items.features = self.filterInactiveFeatures(items.features);
  }
  if (items.hasOwnProperty('testcases')) {
    items.testcases = self.filterInactiveTestcases(items.testcases);
  }
  if (items.hasOwnProperty('testvectors')) {
    items.testvectors = self.filterInactiveTestvectors(items.testvectors);
  }
  return items;
};




