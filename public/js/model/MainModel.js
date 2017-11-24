/**
 * Created by danielsilhavy on 02.08.16.
 */

App.models.MainModel = function (type) {
  this.loginModel = App.models.LoginModel.getInstance();
  this.type = type;
};

App.models.MainModel.prototype.getElements = function () {
  var q = Q.defer();
  var token = this.loginModel.getToken();
  var url = App.constants.requestParameter[this.type].GET_MULTI;

  App.utils.HTTPUtils.get(url, token)
    .then(function (data) {
      q.resolve(data);
    })
    .catch(function (error) {
      q.reject(error);
    });

  return q.promise;
};


App.models.MainModel.prototype.createElements = function (data) {
  var q = Q.defer();
  var token = this.loginModel.getToken();
  var url = App.constants.requestParameter[this.type].CREATE;

  data.createdAt = new Date();
  App.utils.HTTPUtils.post(url, data, token)
    .then(function () {
      q.resolve();
    })
    .catch(function (error) {
      q.reject(error);
    });

  return q.promise;
};

App.models.MainModel.prototype.editElement = function (data) {
  var q = Q.defer();
  var token = this.loginModel.getToken();
  var url = App.constants.requestParameter[this.type].EDIT;

  App.utils.HTTPUtils.put(url + '/' + data.id, data, token)
    .then(function () {
      q.resolve();
    })
    .catch(function (error) {
      q.reject(error);
    });

  return q.promise;
};

App.models.MainModel.prototype.deleteElement = function (id) {
  var q = Q.defer();
  var token = this.loginModel.getToken();
  var url = App.constants.requestParameter[this.type].DELETE;

  App.utils.HTTPUtils.delete(url + '/' + id, token)
    .then(function () {
      q.resolve();
    })
    .catch(function (error) {
      q.reject(error);
    });

  return q.promise;
};

App.models.MainModel.prototype.getElementById = function (id) {
  var q = Q.defer();
  var token = this.loginModel.getToken();
  var url = App.constants.requestParameter[this.type].GET;

  App.utils.HTTPUtils.get(url + '/' + id, token)
    .then(function (data) {
      q.resolve(data);
    })
    .catch(function (error) {
      q.reject(error);
    });

  return q.promise;
};

App.models.MainModel.prototype.getMyElements = function () {
  var q = Q.defer();
  var token = this.loginModel.getToken();
  var url = App.constants.requestParameter[this.type].MYLIST;

  App.utils.HTTPUtils.get(url, token)
    .then(function (data) {
      q.resolve(data);
    })
    .catch(function (error) {
      q.reject(error);
    });

  return q.promise;
};