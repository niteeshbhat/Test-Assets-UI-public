/**
 * Created by danielsilhavy on 02.08.16.
 */

App.controller.FeatureGroupController = function () {
  this.model = new App.models.FeatureGroupModel();
  this.view = new App.views.FeatureGroupView();
  App.controller.MainController.call(this, this.model, this.view, 'featureGroup');
  this.registerEvents();
};

App.controller.FeatureGroupController.prototype = new App.controller.MainController();


App.controller.FeatureGroupController.prototype.actionCreate = function () {
  var self = this;

  self.model.getAttributes()
    .then(function (attributes) {
      return self.view.renderCreate({attributes: attributes});
    });
};


App.controller.FeatureGroupController.prototype.actionList = function () {
  var self = this;
  var renderData = {};
  var filterPreferences = self.loginModel.getFilterPreferences();

  self.model.getElements()
    .then(function (data) {
      renderData.isAdmin = self.loginModel.isAdmin();
      if (!renderData.isAdmin) {
        data = self.filterInactiveFeatureGroups(data);
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

App.controller.FeatureGroupController.prototype.actionMyList = function () {
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

App.controller.FeatureGroupController.prototype.actionDetail = function (id) {
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

App.controller.FeatureGroupController.prototype.onDeleteElement = function (callee, id) {
  var self = this;

  //check if there is a feature with that featureGroup
  self.model.getFeatures(id)
    .then(function (items) {
      if (items.length > 0) {
        throw new Error('Can not delete element since it is referenced in one or more features');
      } else {
        return self.model.deleteElement(id);
      }
    })
    .then(function () {
      self.view.clearView();
      App.views.MessageView.renderSuccessMessage({message: 'Deleted Feature Group'});
      self.actionMyList();
    })
    .catch(function (error) {
      App.handler.Errorhandler.handleError(error);
      self.actionMyList();
    });
};

App.controller.FeatureGroupController.prototype.constructor = App.controller.FeatureController;