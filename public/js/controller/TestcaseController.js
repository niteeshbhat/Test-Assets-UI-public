/**
 * Created by danielsilhavy on 02.08.16.
 */

App.controller.TestcaseController = function () {
  this.model = new App.models.TestcaseModel();
  this.featureModel = new App.models.FeatureModel();
  this.view = new App.views.TestcaseView();
  App.controller.MainController.call(this, this.model, this.view, 'testcase');
  this.registerEvents();
};

App.controller.TestcaseController.prototype = new App.controller.MainController();


App.controller.TestcaseController.prototype.actionCreate = function () {
  var self = this;
  var promises = [];

  promises.push(self.model.getAttributes());
  promises.push(self.featureModel.getElements());

  Q.all(promises)
    .then(function (result) {
      return self.view.renderCreate({attributes: result[0], features: result[1]});
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};


App.controller.TestcaseController.prototype.actionList = function () {
  var self = this;
  var renderData = {};
  var filterPreferences = self.loginModel.getFilterPreferences();

  self.model.getElements()
    .then(function (data) {
      renderData.isAdmin = self.loginModel.isAdmin();
      if (!renderData.isAdmin) {
        data = self.filterInactiveTestcases(data);
      }
      renderData.entries = data;
      return self.model.getAttributes();
    })
    .then(function (data) {
      if (!renderData.isAdmin) {
        data = self.filterInactiveAttributes(data);
      }
      renderData.attributes = data;
      self.view.renderList(renderData, filterPreferences);
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};

App.controller.TestcaseController.prototype.actionEdit = function (id) {
  var self = this;
  var promises = [];

  if (!id) {
    App.handler.Errorhandler.handleError(new Error('Invalid ID specified'));
    self.actionList();
  } else {
    promises.push(self.model.getElementById(id));
    promises.push(self.featureModel.getElements());
    Q.all(promises)
      .then(function (result) {
        self.view.renderEdit({element: result[0], features: result[1],});
      })
      .catch(function (error) {
        App.handler.Errorhandler.handleError(error);
      });
  }
};

App.controller.TestcaseController.prototype.actionMyList = function () {
  var self = this;
  var renderData = {};
  var filterPreferences = self.loginModel.getFilterPreferences();

  self.model.getMyElements()
    .then(function (data) {
      renderData.entries = data;
      renderData.isAdmin = self.loginModel.isAdmin();
      return self.model.getAttributes();
    })
    .then(function (data) {
      renderData.attributes = data;
      self.view.renderMyList(renderData, filterPreferences);
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};

App.controller.TestcaseController.prototype.actionDetail = function (id) {
  var self = this;

  self.model.getDetails(id)
    .then(function (data) {
      data = self.filterData(data);
      self.view.renderDetails(data);
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};

App.controller.TestcaseController.prototype.onDeleteElement = function (callee, id) {
  var self = this;

  //check if there is a feature with that featureGroup
  self.model.getTestvectors(id)
    .then(function (items) {
      if (items.length > 0) {
        throw new Error('Can not delete element since it is referenced in one or more Testvectors');
      } else {
        return self.model.deleteElement(id);
      }
    })
    .then(function () {
      self.view.clearView();
      App.views.MessageView.renderSuccessMessage({message: 'Deleted Testcase'});
      self.actionMyList();
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
      self.actionMyList();
    });
};

App.controller.TestcaseController.prototype.constructor = App.controller.TestcaseController;
