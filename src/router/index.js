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
      icon: 'user',
      component: _import('hwenbin/attendance/clock')
    }, {
      path: 'record',
      name: '考勤记录',
      icon: 'post',
      component: _import('hwenbin/attendance/record')
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
