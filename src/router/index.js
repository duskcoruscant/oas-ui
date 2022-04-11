import Vue from 'vue'
import Router from 'vue-router'
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading

/* layout */
import Layout from '../views/layout/Layout'

const _import = require('./_import_' + process.env.NODE_ENV)

Vue.use(Router)

/**
 * icon : the icon show in the sidebar
 * hidden : if `hidden:true` will not show in the sidebar
 * redirect : if `redirect:noRedirect` will not redirect in the levelBar
 * noDropDown : if `noDropDown:true` will not has submenu in the sidebar
 * meta : `{ permission: ['a:xx'] }`  will control the page permission
 **/
export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/404', component: _import('errorPage/404'), hidden: true },
  { path: '/401', component: _import('errorPage/401'), hidden: true },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    icon: 'dashboard',
    noDropDown: true,
    children: [{
      path: 'dashboard',
      name: '控制台',
      component: _import('dashboard/index'),
      meta: { title: 'dashboard', noCache: true }
    }]
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/manageCenter',
    component: Layout,
    redirect: '/manageCenter/employee',
    icon: 'config',
    // noDropDown: true,
    name: '管理中心',
    meta: { permission: ['manage'] },
    children: [{
      path: 'employee',
      name: '员工管理',
      icon: 'user',
      component: _import('hwenbin/employee/list'),
      meta: {
        permission: ['manage:employee:list']
      }
    }, {
      path: 'department',
      name: '部门管理',
      icon: 'tree',
      component: _import('hwenbin/department/list'),
      meta: { permission: ['manage:department:list'] }
    }, {
      path: 'position',
      name: '职位管理',
      icon: 'post',
      component: _import('hwenbin/position/list'),
      meta: { permission: ['manage:position:list'] }
    }, {
      path: 'role',
      name: '角色管理',
      icon: 'peoples',
      component: _import('hwenbin/role/list'),
      meta: { permission: ['manage:role:list'] }
    }]
  },

  {
    path: '/attendanceCenter',
    component: Layout,
    redirect: '/attendanceCenter/attendance',
    icon: 'config',
    name: '考勤中心',
    meta: { permission: ['manage'] },
    children: [{
      path: 'clock',
      name: '考勤',
      icon: 'el-icon-thumb',
      component: _import('hwenbin/attendance/clock')
    }, {
      path: 'record',
      name: '考勤记录',
      icon: 'el-icon-date',
      component: _import('hwenbin/attendance/record')
    }]
  },

  {
    path: '/fileCenter',
    component: Layout,
    redirect: '/fileCenter/personal',
    icon: 'config',
    name: '文件中心',
    meta: { permission: ['manage'] },
    children: [{
      path: 'personal',
      name: '个人文件',
      icon: 'el-icon-files',
      component: _import('hwenbin/file/personal')
    }, {
      path: 'share',
      name: '共享文件',
      icon: 'el-icon-share',
      component: _import('hwenbin/file/share')
    }, {
      path: 'recycleBin',
      name: '回收站',
      icon: 'el-icon-delete',
      component: _import('hwenbin/file/recycleBin')
    }]
  },

  {
    path: '/workLog',
    component: Layout,
    redirect: '/workLog/send',
    icon: 'config',
    name: '工作日志',
    meta: { permission: ['manage'] },
    children: [{
      path: 'send',
      name: '我发出的',
      icon: 'el-icon-files',
      component: _import('hwenbin/worklog/send')
    }, {
      path: 'receive',
      name: '我收到的',
      icon: 'el-icon-files',
      component: _import('hwenbin/worklog/receive')
    }]
  },

  {
    path: '/test',
    component: Layout,
    redirect: '/test/test',
    icon: 'config',
    name: '测试',
    meta: { permission: ['manage'] },
    children: [{
      path: 'test',
      name: '测试1',
      icon: 'el-icon-files',
      component: _import('hwenbin/test/test')
    }, {
      path: 'test2',
      name: '测试2',
      icon: 'el-icon-share',
      component: _import('hwenbin/test/test2')
    }]
  },

  {
    path: '/accountCenter',
    component: Layout,
    redirect: '/accountCenter/index',
    hidden: true,
    children: [{
      path: 'index',
      name: '账户中心',
      component: _import('accountCenter/index')
    }]
  }

]
