import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const request = axios.create({
  baseURL,
  timeout: 10000
})

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res && res.code === 0) {
      return res
    }
    return Promise.reject(new Error(res?.message || '请求失败'))
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络异常'
    return Promise.reject(new Error(message))
  }
)

export const studentApi = {
  list: () => request.get('/students').then(r => r.data),
  create: (data) => request.post('/students', data).then(r => r.data),
  update: (id, data) => request.put(`/students/${id}`, data).then(r => r.data),
  remove: (id) => request.delete(`/students/${id}`).then(r => r.data)
}

export default request
