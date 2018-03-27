var express = require('express');
var router = express.Router();

var sequelize = require('../models/util/dbConnect.js');

var staffModel = require('../models/fom/staff.js');
var centreModel = require('../models/fom/centre.js');
var deptModel = require('../models/fom/dept.js');
var officeModel = require('../models/fom/office.js');
var stateModel = require('../models/state.js');
var postModel = require('../models/fom/post.js');

var dbGet = require('../dbController/db-index-get.js');

var checkLogin = require('../libs/middle/checkLogin.js').checkLogin;

// 获取中心，部门信息，科室列表
function getData(req,res,next){
  var deptId = req.session.user.deptId;
  // var deptId = 2;    //  便于测试，暂时禁止权限控制
  deptModel.findOne({where: {id: deptId}}).then(function(p1){
    res.locals.deptInfo = p1;
    var centreId = p1.centreId;
    officeModel.findAll({where: {deptId: deptId}}).then(function(p2){
      res.locals.officeList = p2;
      centreModel.findOne({where: {id: centreId}}).then(function(p3){
        res.locals.centreInfo = p3;
        next();
      });
    });
  });
}
// 获取状态选项
function getState(req,res,next){
  var page = 'fom';
  stateModel.findAll({where:{page: page}}).then(function(p){
    res.locals.stateList = p;
    next();
  });
}
// 获取岗位类别选项
function getPost(req,res,next){
  postModel.findAll().then(function(p){
    res.locals.postList = p;
    next();
  });
};

// 获取部门List
function getCentreList(req,res,next){
  centreModel.findAll().then(function(p){
    res.locals.centreList = p;
    next();
  });
}

// 权限控制
router.use(checkLogin);

// page: users index.
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// page: FOM表格页面
router.get('/fom', getData,getCentreList, function(req,res,next){
	res.render('user/fom.ejs',{
		title: '更新人员FOM表'
	});
});

// data: 获取FOM dept table数据
router.get('/fom/bootstrapTable',function(req,res,next){
  var deptId = req.session.user.deptId;
  // var deptId = 2;    //  便于测试，暂时禁止权限控制
  dbGet.findStaffByDeptId(deptId, function(err,rows,fields){
    res.send(rows);
  });
});

// data: 根据centreId异步获取部门列表deptList
router.get('/fom/get/deptList', function(req,res,next){
  var centreId = req.query.centreId;
  deptModel.findAll({where: {centreId : centreId}}).then(function(p){
    res.send(p);
  });
});

// data: 根据deptId异步获取科室列表officeList
router.get('/fom/get/officeList', function(req,res,next){
  var deptId = req.query.deptId;
  officeModel.findAll({where: {deptId : deptId}}).then(function(p){
    res.send(p);
  });
});

// page: 获取添加人员表单
router.get('/fom/add',getData, getState, getPost, function(req,res,next){
  res.render('user/fom-add.ejs', {
    title: '添加新入职员工'
  });
});

// action: 新入职
router.post('/fom/add', function(req,res,next){
  var centreId = req.body.centre || 0;
  var deptId = req.body.dept || 0;
  var officeId = req.body.office || 0;
  var name = req.body.name || '';
  var userid = req.body.userid || '';
  var gender = req.body.gender || '';
  var school = req.body.school || '';
  var major = req.body.major || '';
  var education = req.body.education || '';
  var graduation_date = req.body.graduation_date || '';
  var work_date = req.body.work_date || '';
  var enter_date = req.body.enter_date || '';
  var birthday = req.body.birthday || '';
  var birth_place = req.body.birth_place || '';
  var domicile_place = req.body.domicile_place || '';
  var grade = req.body.grade || '';
  var mainPost = req.body.mainPost || '';
  var state = req.body.state;
  var bz = req.body.bz;
  if(centreId && deptId && officeId && name && userid && gender && state && mainPost && grade){
    staffModel.create({
      centreId : centreId,
      deptId : deptId,
      officeId: officeId,
      name : name,
      userid: userid,
      gender: gender,
      school: school,
      major: major,
      education: education,
      graduation_date: graduation_date,
      work_date: work_date,
      enter_date: enter_date,
      birthday: birthday,
      birth_place: birth_place,
      domicile_place: domicile_place,
      grade: grade,
      mainPost: mainPost,
      state: state,
      bz: bz
    }).then(function (p) {
      console.log('created.' + JSON.stringify(p));
      // 添加log
      
      req.flash('success', '添加成功');
      res.redirect('/user/fom');
    }).catch(function (err) {
      console.log('failed: ' + err);
    });
  }else{
    req.flash('error','请填写完整再提交');
    res.redirect('/user/fom/add');
  }
});

// action: 离职
router.post('/fom/dimission', function(req,res,next){
  var id = req.body.id;
  var leave_date = req.body.leave_date;
  var bz = req.body.bz;
  staffModel.update(
    {'sbz': bz,'leave_date': leave_date},
    {'where': {sid: id}},
    {'fields': ['leave_date','sbz']}
  ).then(function(){
    staffModel.destroy({where:{sid: id}}).then(function(){
      req.flash('success', '离职操作成功');
      res.redirect('/user/fom');
    });
  });
});

// action: 调转
router.post('/fom/change', function(req,res,next){
  var id = req.body.id;
  var centreId = req.body.centre;
  var deptId = req.body.dept;
  var officeId = req.body.office;
  // console.log('centreId is %d, deptId is %d , officeId is %d', centreId ,deptId , officeId);
  staffModel.update(
    {centreId : centreId, deptId : deptId, officeId: officeId},
    {where: {sid: id}},
    {fields: [centreId,deptId,officeId]}
  ).then(function(){
      req.flash('success', '调转操作成功');
      res.redirect('/user/fom');
  });
});

module.exports = router;
