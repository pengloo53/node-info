var Sequelize = require('sequelize');

var centreModel = require('../../models/fom/centre.js');
var deptModel = require('../../models/fom/dept.js');
var officeModel = require('../../models/fom/office.js');

var dutyModel = require('../../models/fom/duty.js');
var gradeModel = require('../../models/fom/grade.js');
var postModel = require('../../models/fom/post.js');
var stateModel = require('../../models/state.js');
var staffModel = require('../../models/fom/staff.js');

var dbGet = require('../../dbController/db-index-get.js');

var getAes = require('../../libs/util/crypto-aes.js').getAes;
var getDAes = require('../../libs/util/crypto-aes.js').getDAes;

module.exports = {
  // 获取中心总人数
  getTotalByCentreId: function(req,res,next){
    var centreId = req.session.user?req.session.user.centreId : 1; 
    // staffModel.findAll({
    //   attributes: [[Sequelize.fn('COUNT', Sequelize.col('sid')), 'total']]
    // }).then(function(p){
    //   // console.log(p.total);
    //   res.locals.total = p;
    //   next();
    // });
    dbGet.getTotalByCentreId(centreId , function(err,rows,fields){
      res.locals.total = rows[0].total;
      next();
    });
  },
  // 根据中心id获取员工List
  getStaffListByCentreId: function(req,res,next){
    var centreId = req.session.user?req.session.user.centreId : 1; 
    dbGet.findStaffByCentreId(centreId, function(err,rows,fields){
      res.locals.staffList = rows;
      next();
    });
  },
  // 获取中心List
  getCentreList: function(req,res,next){
    centreModel.findAll().then(function(p){
      res.locals.centreList = p;
      next();
    });
  },
  // 获取部门List
  getDeptList: function(req,res,next){
    var centreId = req.session.user?req.session.user.centreId : 1;
    deptModel.findAll({where: {centreId : centreId}}).then(function(p){
      res.locals.deptList = p;
      next();
    });
  },
	// 获取科室列表
  getOfficeList: function(req,res,next){
    // 如果是部门管理员，取session；如果非部门管理员，即更高管理员，取query
    var deptId = req.session.user.deptId || req.query.deptId;  
    officeModel.findAll({where: {deptId: deptId}}).then(function(p){
      res.locals.officeList = p;
      next();
    });
  },
  // 获取中心信息
  getCentreInfo: function(req,res,next){
    var centreId = req.session.user?req.session.user.centreId : 1;
    centreModel.findOne({where:{id: centreId}}).then(function(p){
      res.locals.centreInfo = p;
      next();
    });
  },
  // 获取部门信息
  getDeptInfo: function(req,res,next){
    // 如果是部门管理员，取session；如果非部门管理员，即更高管理员，取query
    var deptId = req.session.user.deptId || req.query.deptId;
    deptModel.findOne({where: {id: deptId}}).then(function(p){
      res.locals.deptInfo = p;
      next();
    });
  },
  // 获取职务列表
  getDutyList: function(req,res,next){
    dutyModel.findAll().then(function(p){
      res.locals.dutyList = p;
      next();
    });
  },
  // 获取职级列表
  getGradeList: function(req,res,next){
    gradeModel.findAll().then(function(p){
      res.locals.gradeList = p;
      next();
    });
  },
  // 获取状态列表
  getStateList: function(req,res,next){
    var page = 'fom';
    stateModel.findAll({where:{page: page}}).then(function(p){
      res.locals.stateList = p;
      next();
    });
  },
  // 获取岗位选项
  getPostList: function(req,res,next){
    postModel.findAll().then(function(p){
      res.locals.postList = p;
      next();
    });
  },
  // 获取岗位类型选项
  getPostTypeList: function (req,res,next){
    postModel.findAll({attributes: [Sequelize.literal('DISTINCT `postType`'), 'postType']}).then(function(p){
      res.locals.postTypeList = p;
      next();
    });
  }
}
