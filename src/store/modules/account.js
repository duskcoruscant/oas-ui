import { login, logout, detail } from '@/api/account'
import { getToken, setToken, removeToken } from '@/utils/token'

const account = {
  state: {
    token: getToken(),
    accountId: -1,
    email: null,
    nickname: null,
    loginTime: -1,
    registerTime: -1,
    roleNames: [],
    permissionCodeList: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_ACCOUNT: (state, account) => {
      state.accountId = account.id
      state.email = account.email
      state.nickname = account.nickname
      state.loginTime = account.loginTime
      state.registerTime = account.registerTime
      state.roleNames = account.roleName
      state.permissionCodeList = account.permissionCodeList
    },
    RESET_ACCOUNT: (state) => {
      state.token = null
      state.accountId = -1
      state.email = null
      state.nickname = null
      state.loginTime = -1
      state.registerTime = -1
      state.roleNames = []
      state.permissionCodeList = []
    }
  },

  actions: {
    // 登录
    Login({ commit }, loginForm) {
      return new Promise((resolve, reject) => {
        login(loginForm).then(response => {
          if (response.code === 200) {
            // cookie中保存token
            setToken(response.data)
            // vuex中保存token
            commit('SET_TOKEN', response.data)
          }
          // 传递给/login/index.vue : store.dispatch('Login').then(data)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    Detail({ commit }) {
      return new Promise((resolve, reject) => {
        detail().then(response => {
          // 取出角色名称组成新的数组
          response.data.roleNames = response.data.roles.map((item, index) => {
            return item.roleName
          })
          // 储存用户信息
          commit('SET_ACCOUNT', response.data)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout({ commit }) {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          // 清除token等相关角色信息
          commit('RESET_ACCOUNT')
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogout({ commit }) {
      return new Promise(resolve => {
        commit('RESET_ACCOUNT')
        removeToken()
        resolve()
      })
    }
  }
}

export default account
