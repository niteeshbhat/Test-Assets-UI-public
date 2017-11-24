/**
 * Created by danielsilhavy on 02.08.16.
 */

App.controller.FeatureController = function () {
  this.model = new App.models.FeatureModel();
  this.featureGroupModel = new App.models.FeatureGroupModel();
  this.view = new App.views.FeatureView();
  App.controller.MainController.call(this, this.model, this.view, 'feature');
  this.registerEvents();
};

App.controller.FeatureController.prototype = new App.controller.MainController();


App.controller.FeatureController.prototype.actionCreate = function () {
  var self = this;
  var promises = [];

  promises.push(self.model.getAttributes());
  promises.push(self.featureGroupModel.getElements());

  Q.all(promises)
    .then(function (result) {
      return self.view.renderCreate({attributes: result[0], featureGroups: result[1]});
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
    });
};


App.controller.FeatureController.prototype.actionList = function () {
  var self = this;
  var renderData = {};
  var filterPreferences = self.loginModel.getFilterPreferences();

  self.model.getElements()
    .then(function (data) {
      renderData.isAdmin = self.loginModel.isAdmin();
      if (!renderData.isAdmin) {
        data = self.filterInactiveFeatures(data);
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

App.controller.FeatureController.prototype.actionMyList = function () {
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

App.controller.FeatureController.prototype.actionDetail = function (id) {
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

App.controller.FeatureController.prototype.onDeleteElement = function (callee, id) {
  var self = this;

  //check if there is a feature with that featureGroup
  self.model.getTestcases(id)
    .then(function (items) {
      if (items.length > 0) {
        throw new Error('Can not delete element since it is referenced in one or more Testcases');
      } else {
        return self.model.deleteElement(id);
      }
    })
    .then(function () {
      self.view.clearView();
      App.views.MessageView.renderSuccessMessage({message: 'Deleted feature'});
      self.actionMyList();
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
      self.actionMyList();
    });
};

App.controller.FeatureController.prototype.actionEdit = function (id) {
  var self = this;
  var promises = [];

  if (!id) {
    App.handler.Errorhandler.handleError(new Error('Invalid ID specified'));
    self.actionList();
  } else {
    promises.push(self.model.getElementById(id));
    promises.push(self.featureGroupModel.getElements());
    Q.all(promises)
      .then(function (result) {
        self.view.renderEdit({element: result[0], featureGroups: result[1],});
      })
      .catch(function (error) {
        App.handler.Errorhandler.handleError(error);
      });
  }
};

App.controller.FeatureController.prototype.constructor = App.controller.FeatureController;
