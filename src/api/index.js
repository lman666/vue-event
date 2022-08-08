import request from '@/utils/request'
import store from '@/store'

/**
 *
 * @param {*} param0 { username: 用户名, password: 密码, repassword: 确认密码}
 * @returns Promise对象
 */
export const registerAPI = ({ username, password, repassword }) => {
  return request({
    url: '/api/reg',
    method: 'POST',
    data: {
      username,
      password,
      repassword
    }
  })
}

/**
 *
 * @param {*} param0 { username: 用户名, password: 密码 }
 * @returns Promise对象
 */
export const loginAPI = ({ username, password }) => {
  return request({
    url: '/api/login',
    method: 'POST',
    data: {
      username,
      password
    }
  })
}

export const getUserInfoAPI = () => {
  return request({
    url: '/my/userinfo',
    headers: {
      Authorization: store.state.token
    }
  })
}
