/**
 * Created by 22150 on 2017/6/21.
 */

// var currentUserId = "1021";
// var currentFriend = "1022";

$(document).ready(function () {
    //showMsgHistory();
    //alert(currentFriend);
    //  alert($("#gender").val());


})



function showMsgHistory(msgList) {
    //var msgList=[{"messageid":"1001","text":"你好啊"},{"messageid":"1002","text":"你好啊,haha"},{"messageid":"1003","text":"你好啊,hhhhhhh"}];
    $("#msgHistory").empty();
    if(!msgList || msgList.length<=0)
        return ;
    var str = '<form action="" method="post"></form> <label>'
    for(var i=0; i<msgList.length; i++)
    {
        var msg = msgList[i].SENDER+":"+ msgList[i].TEXT +"--"+ msgList[i].TIME;
        str+=' <input type="checkbox" name = "checkItem" value= "' + msgList[i].MESSAGEID + '"/>' + msg + '<br/>';
    }
    str+='</label></form><br/>';
    str+=' <label>全选：<input id= "isSelectALL" type="checkbox" value="select" onclick="selectAllOrNot()"/></label>'
    $("#msgHistory").append(str);
}


function selectAllOrNot()
{
    if($("#isSelectALL").prop("checked"))
        $("[name=checkItem]:checkbox").attr("checked",true);
    else
        $("[name=checkItem]:checkbox").attr("checked",false);
}



function selectAll() {
    $("[name=checkItem]:checkbox").attr("checked",true);
}
function reSelect() {
    $("[name=checkItem]:checkbox").attr("checked",false);
}

function deleteMsg() {
    var msgList=[];
    $("[name=checkItem]:checkbox").each(function () {
        if($(this).is(":checked"))
        {
            msgList.push($(this).attr("value"));
        }
    });
    if(msgList.length>0)
    {
        $.ajax({
            type: "POST",
            url: "../DeleteHistoryServlet",
            async: false,
            dataType: "json",
            data: {
                "accountid": currentUserId,
                "messageid":msgList
            },

            success: function(Data) {
                msgHistory=Data;
            },
            error: function(e){
                alert(e.name + ": " + e.message + "\n链接失败");
            }
        });
    }
    askMsgHistroy();
}

function askMsgHistroy()
{
    var msgHistory;
    $.ajax({
        type: "POST",
        url: "../ChatHistoryServlet",
        async: false,
        dataType: "json",
        data: {
            "accountid": currentUserId,
            "friendid":currentFriend
        },
        success: function(Data) {
            msgHistory=Data;
        },
        error: function(e){
            alert(e.name + ": " + e.message + "\n链接失败");
        }
    });
    showMsgHistory(msgHistory);
    $('#ChatHistoryModal').modal('show');
}


function  loadInfo() {
    var info = readFriendInfo(currentUserId);
    var gender = info.GENDER;
    var birthday = info.BIRTHDAY;
    birthday = birthday.substr(0,10);
    var index = 0;
    if(gender == "女 ")
        index = 1;
    if(info)
    {
        $("#nickname").val(info.NICKNAME);
        document.getElementById("gender").options[index].selected = true;
        $("#birthday").val(birthday);
    }
    $('#ChangeInfoModal').modal('show');
}
function changeInfo()
{
    $.ajax({
        type: "POST",
        url: "../UpdateAccountInfoServlet",
        async: false,
        dataType: "json",
        data: {
            "accountid":currentUserId,
            "nickname":  $("#nickname").val(),
            "gender"  :  $("#gender").val(),
            "birthday":  $("#birthday").val()
        },
        success:function (data) {
            if(data)
                alert("修改成功");
        },
        errer:function () {
            alert("修改失败");
        }
    })
    loadInfo();
}


function loadChangePwd(){
    $("#oldPwd").val("");
    $("#newPwd").val("");
    $("#chkNewPwd").val("");
    $("#changePwdInfo").hide();
    $('#ChangePwdModal').modal('show');
}
function changePwd() {
    var oldpwd =  $("#oldPwd").val();
    var newpwd =  $("#newPwd").val();
    var checkpwd =  $("#chkNewPwd").val()
    $.ajax({
        type: "POST",
        url: "../EditPasswordServlet",
        async: false,
        dataType: "json",
        data: {
            "accountid":currentUserId,
            "oldpass": oldpwd,
            "newpass": newpwd,
        },
        beforeSend:function () {
            if(!newpwd||!checkpwd||!oldpwd) {
                $("#changePwdInfo").empty().text("选项不能为空！").show();
                return false;
            }
            if(newpwd != checkpwd){
                $("#changePwdInfo").empty().text("确认新密码不正确！").show();
                return false;
            }

        },
        success:function (data) {
            if(data[0].EditPassword == '1'){
                $("#oldPwd").val("");
                $("#newPwd").val("");
                $("#chkNewPwd").val("");
                $("#changePwdInfo").hide();
                alert("修改成功");
            }else if(data[0].EditPassword == '-1')
            {
                $("#oldPwd").val("");
                $("#newPwd").val("");
                $("#chkNewPwd").val("");
                $("#changePwdInfo").empty().text("原密码不正确！").show();
            }else if(data[0].EditPassword == '-2')
            {
                $("#changePwdInfo").empty().text("由于未知原因修改失败！").show();
            }else
            {
                $("#changePwdInfo").empty().text("此用户不存在！").show();
            }
        },
        errer:function () {
            alert("修改失败");
        }
    })
}


function loadGroup()
{
    var grouplist;
    $.ajax({
        type:"POST",
        url:"../ShowAllGroupsServlet",
        async:false,
        dataType:"json",
        data: {
            "accountid": currentUserId
        },
        success:function (data) {
            grouplist = data;
        }
    });
    //grouplist = [{"GROUPID":"1","GROUPNAME":"我的好友"},{"GROUPID":"2","GROUPNAME":"朋友"},{"GROUPID":"3","GROUPNAME":"家人"}]
    var str = '<li class="list-group-item" style="background: transparent; border: none; border-radius: 0; "> '
        + '<div class="input-group input-group-md" style="width: 300px">'
        + '<input type="text" class="form-control"  />'
        + '<span  class="input-group-addon " onclick="addGroup.call($(this))"><span  class="glyphicon glyphicon-plus" style=""></span></span>'
        + '</div>'
        + '</li>';
    for(var i in grouplist)
    {
        str += '<li class="list-group-item" style="background: transparent; border: none; border-radius: 0; ">'
            + '<div class="input-group input-group-md" style="width: 300px">'
            + '<input id = "GROUP'+grouplist[i].GROUPID + '" type="text" class="form-control" disabled="true" value="'+ grouplist[i].NAME + '" />'
            + '<span  class="input-group-addon " style=" " ><span  class="glyphicon glyphicon-minus" onclick="removeGroup.call($(this))"></span></span>'
            + '<span  class="input-group-addon " style=" "><span  class="glyphicon glyphicon-edit" onclick="editGroup.call($(this))"></span></span>'
            // '<span  class="input-group-addon " style=" "><span id="user1022" class="glyphicon glyphicon-ok"></span></span>'
            + '</div>'
            + '</li>'
    }
    $("#editGroupList").empty().append(str);
    $('#ChangeGroupdModal').modal('show');
}

function addGroup()
{
    var groupName=$(this).prev().val();
    $.ajax({
        type:"POST",
        url:"../AddGroupServlet",
        async:false,
        dataType:"json",
        data: {
            "accountid":currentUserId,
            "groupname":groupName
        },
        beforeSend:function () {
            if(!groupName)
                return false;
        },
        success:function (data) {
            if(data[0].ADDGroup=="1")
            {
                $("#groupAlertInfo").text("添加分组成功！");
                $("#groupInfoModal").modal("show");
            }else
            {
                $("#groupAlertInfo").text("添加分组失败！");
                $("#groupInfoModal").modal("show");
            }
        }
    });
    loadGroup();
}

function removeGroup()
{

    var groupid = $(this).parent().prev().attr("id");
    groupid = groupid.substr(5);
    $.ajax({
        type:"POST",
        url:"../DeleteGroupServlet",
        async:false,
        dataType:"json",
        data: {
            "groupid": groupid,
            "accountid":currentUserId
        },
        beforeSend:function () {;
        },
        success:function (data) {
            if(data[0].DeleteGroup=="1" || data[0].DeleteGroup =="2")
            {
                $("#groupAlertInfo").text("移除分组成功！");
                $("#groupInfoModal").modal("show");
            }else if(data[0].DeleteGroup== "-1")
            {
                $("#groupAlertInfo").text("禁止移除默认分组！");
                $("#groupInfoModal").modal("show");
            }else
            {
                $("#groupAlertInfo").text("移除分组失败！");
                $("#groupInfoModal").modal("show");
            }
        }
    });
    loadGroup();
}


function editGroup()
{
    $(this).parent().prev().prev().attr("disabled",false);
    $(this).attr("class","glyphicon glyphicon-ok").attr("onclick","updateGroup.call($(this))")

}

function updateGroup()
{
    //$(this).parents("input").attr("disabled",false);
   //$(this).attr("class","glyphicon glyphicon-edit").attr("onclick","updateGroup");
    var groupName =  $(this).parent().prev().prev().val();
    var groupid =$(this).parent().prev().prev().attr("id");
    groupid = groupid.substr(5);
    $.ajax({
        type:"POST",
        url:"../EditGroupNameServlet",
        async:false,
        dataType:"json",
        data: {
            "groupid":  groupid,
            "groupname":groupName
        },
        beforeSend:function () {
            if(!groupName)
                return false;
        },
        success:function (data) {
            if(data[0].EditGroupName == "1" )
            {
                $("#groupAlertInfo").text("修改分组名成功！");
                $("#groupInfoModal").modal("show");
            }else
            {
                $("#groupAlertInfo").text("修改分组名失败！");
                $("#groupInfoModal").modal("show");
            }
        }
    });
    loadGroup();
}