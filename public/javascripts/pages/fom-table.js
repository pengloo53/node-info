// $.fn.editable.defaults.mode = 'inline';
$(function () {
    var $table = $('#table');
    var deptId = $('#dataSpan').data('deptid');
    window.operator = {
        'click [title=离职]': function (e, value, row, index) {
            $('#dimission').modal('show');
            $('#dimission form input.sid').val(row.sid);
        },
        'click [title=调转]': function (e, value, row, index) {
            $('#change').modal('show');
            $('#change form input.sid').val(row.sid);
            $('select[name=centre]').val('');
        },
        'click [title=更改]': function (e, value, row, index) {
            alert('你点了「更改」，但是功能还没有完成');
        }
    };
    $table.bootstrapTable({
        url: '/fom/bootstrapTable',
        height: window.innerHeight - 70,
        // height: 300,
        responseHandler: function (res) {
            for (var i = 0; i < res.length; i++) {
                res[i].rid = i + 1;
            }
            return res;
        },
        queryParams: function (params) {
            return {
                uid: 1
            };
        },
        pageNumber: 1,
        pageSize: 20,
        pageList: '[20, 50, 100, ALL]',
        pagination: true,
        paginationLoopz: true,
        search: true,
        idField: 'sid',
        showColumns: true,
        showExport: true,
        showRefresh: true,
        toolbar: '#toolbar',
        cache: false,
        detailView: true,
        detailFormatter: function (value, row , index) {
             return '<p><b>' + row.postType + '</b></p>' +
            '<p>' + row.postDescribe.replace(new RegExp('\n','gm'),'<br/>') + '</p>';
        },
        columns: [{
            field: 'rid',
            title: '#',
            align: 'center',
            valign: 'middle',
            // visible: false
        }, {
            field: 'dept',
            title: '部门',
            align: 'center',
            valign: 'middle',
            // visible: false
        }, {
            field: 'office',
            title: '科室',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'name',
            title: '姓名',
            align: 'center',
            valign: 'middle',
        },{
            field: 'userid',
            title: '员工号',
            align: 'center',
            valign: 'middle',
        },{
            field: 'gender',
            title: '性别',
            align: 'center',
            valign: 'middle'
        },{
            field: 'grade',
            title: '职级',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'mainPost',
            title: '主岗',
            align: 'center',
            valign: 'middle'
        },{
            field: 'subPost',
            title: '次岗',
            align: 'center',
            valign: 'middle'
        },{
            field: 'postType',
            title: '岗位类别',
            align: 'center',
            valign: 'middle',
            visible: false
        },{
            field: 'postDescribe',
            title: '岗位描述',
            align: 'center',
            valign: 'middle',
            visible: false
        },{
            field: 'state',
            title: '状态',
            align: 'center',
            valign: 'middle'
        },{  
            field: 'bz',
            title: '备注',
            visible: false,
            align: 'center',
            valign: 'middle',
            // editable: {
            //     type: 'textarea',
            //     url: '/todo/update'
            // }
        },{
            field: 'operator',
            title: '操作',
            events: operator,
            align: 'center',
            valign: 'middle',
            // width: '10%',
            visible: false,
            formatter: function (value, row, index) {
                return '<div class="btn-group" role="btn-group">' +
                    '<button class="op btn btn-default btn-sm" title="离职">' +
                    '<i class="glyphicon glyphicon-remove"></i></button>' +
                    '<button class="op btn btn-default btn-sm" title="调转" ' +
                    'data-target="#editModal" data-toggle="modal">' +
                    '<i class="glyphicon glyphicon-repeat"></i></button>' +
                    '<button class="op btn btn-default btn-sm" title="更改">' +
                    '<i class="glyphicon glyphicon-pencil"></i></button>' +
                    '</div>';
            }
        }]
    });
    // 获取当前人数
    $table.on('load-success.bs.table', function(){
        var staffNum = $table.bootstrapTable('getData').length;
        $('#staffNum').html(staffNum);
    });
    
    // --------------------- datepicker -------------------
    // 日期选择框
    $('input.date').datepicker({
        format: "yyyy-mm-dd",
        weekStart: 7,
        maxViewMode: 1,
        language: "zh-CN",
        // daysOfWeekDisabled: "0,6",
        // daysOfWeekHighlighted: "0,6",
        autoclose: true,
        todayHighlight: true,
        // startDate: new Date()
    }).on('show', function (e) {
        e.preventDefault();
        e.stopPropagation(); // 禁止触发父元素事件
    }).on('hide', function (e) {
        e.stopPropagation(); // 禁止触发父元素事件
    });
    // 日期选择
    $table.on('editable-shown.bs.table', function (editable, field, row, $el) {
        $('.selfDate .editable-input input').datepicker({
            format: "yyyy-mm-dd",
            weekStart: 7,
            maxViewMode: 1,
            language: "zh-CN",
            // daysOfWeekDisabled: "0,6",
            // daysOfWeekHighlighted: "0,6",
            autoclose: true,
            todayHighlight: true,
            // startDate: new Date()
        });
    });
    
    // 根据中心获取部门
    $('#change').on('shown.bs.modal', function () {
        $('select[name=centre]').change(function(){
            var centreId = $(this).val();
            $.ajax({
                url: '/user/fom/get/deptList?centreId=' + centreId,
                success: function(result){
                    $('select[name=dept] option:gt(0)').remove();
                    for(var i = 0 ; i< result.length; i++){
                        var $optionHtml = $('<option value="' + result[i].id + '">' + result[i].dept + '</option>');
                        $('select[name=dept]').append($optionHtml);
                    }
                }
            });
        });
        $('select[name=dept]').change(function(){
            var deptId = $(this).val();
            $.ajax({
                url: '/user/fom/get/officeList?deptId=' + deptId,
                success: function(result){
                    $('select[name=office] option:gt(0)').remove();
                    for(var i = 0 ; i< result.length; i++){
                        var $optionHtml = $('<option value="' + result[i].id + '">' + result[i].office + '</option>');
                        $('select[name=office]').append($optionHtml);
                    }
                }
            });
        });
    });
});