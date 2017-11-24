/**
 * Created by danielsilhavy on 02.08.16.
 */

App.controller.TestvectorController = function () {
  this.model = new App.models.TestvectorModel();
  this.testcaseModel = new App.models.TestcaseModel();
  this.view = new App.views.TestvectorView();
  App.controller.MainController.call(this, this.model, this.view, 'testvector');
  this.registerEvents();
};

App.controller.TestvectorController.prototype = new App.controller.MainController();

App.controller.TestvectorController.prototype.actionCreate = function () {
  var self = this;
  var promises = [];

  promises.push(self.model.getAttributes());
  promises.push(self.testcaseModel.getElements());

  Q.all(promises)
    .then(function (result) {
      return self.view.renderCreate({attributes: result[0], testcases: result[1]});
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};


App.controller.TestvectorController.prototype.actionList = function () {
  var self = this;
  var renderData = {};
  var filterPreferences = self.loginModel.getFilterPreferences();

  self.model.getAttributes()
    .then(function (data) {
      renderData.isAdmin = self.loginModel.isAdmin();
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

App.controller.TestvectorController.prototype.actionMyList = function () {
  var self = this;
  var renderData = {};
  var filterPreferences = self.loginModel.getFilterPreferences();

  self.model.getMyElements()
    .then(function (data) {
      renderData.entries = data;
      return self.model.getAttributes();
    })
    .then(function (data) {
      renderData.attributes = data;
      renderData.isAdmin = self.loginModel.isAdmin();
      self.view.renderMyList(renderData, filterPreferences);
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};

App.controller.TestvectorController.prototype.actionDetail = function (id) {
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

App.controller.TestvectorController.prototype.actionEdit = function (id) {
  var self = this;
  var promises = [];

  if (!id) {
    App.handler.Errorhandler.handleError(new Error('Invalid ID specified'));
    self.actionList();
  } else {
    promises.push(self.model.getElementById(id));
    promises.push(self.testcaseModel.getElements());
    Q.all(promises)
      .then(function (result) {
        self.view.renderEdit({element: result[0], testcases: result[1],});
      })
      .catch(function (error) {
        App.handler.Errorhandler.handleError(error);
      });
  }
};

App.controller.TestvectorController.prototype.actionGroupedList = function () {
  var self = this;
  var renderData = {};
  var filterPreferences = self.loginModel.getFilterPreferences();


  self.model.getAttributes()
    .then(function (data) {
      renderData.attributes = data;
      renderData.isAdmin = self.loginModel.isAdmin();
      self.view.renderGroupedList(renderData, filterPreferences);
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};

App.controller.TestvectorController.prototype.onDeleteElement = function (callee, id) {
  var self = this;

  //check if there is a feature with that featureGroup
  self.model.deleteElement(id)
    .then(function () {
      self.view.clearView();
      App.views.MessageView.renderSuccessMessage({message: 'Deleted Testvector'});
      self.actionMyList();
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
      self.actionMyList();
    });
};


App.controller.TestvectorController.prototype.constructor = App.controller.TestvectorController;
