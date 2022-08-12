import Vue from 'vue'
import Vuex from 'vuex'
import { createVuexPersistedState } from 'vue-persistedstate'
import { getUserInfoAPI } from '@/api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '', // 保存token字符串
    userInfo: {} // 保存用户信息{id, username, nickname, email, user_pic}
  },
  getters: {
    username: state => state.userInfo.username,
    nickname: state => state.userInfo.nickname,
    user_pic: state => state.userInfo.user_pic
  },
  mutations: {
    // 保存token
    updateToken (state, val) {
      state.token = val
    },
    // 更新用户信息
    updateUserInfo (state, info) {
      state.userInfo = info
    }
  },
  actions: {
    async getUserInfoActions (store) {
      const { data: res } = await getUserInfoAPI()
      if (res.code === 0) {
        store.commit('updateUserInfo', res.data)
        console.log(res)
      }
    }
  },
  modules: {
  },
  plugins: [
    // 注入持久化插件
    createVuexPersistedState()
  ]
})
