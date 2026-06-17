<template>
  <div class="container">
    <!-- 登录弹窗 -->
    <div class="login-overlay" v-if="showLoginModal">
      <div class="login-modal">
        <div class="login-header">
          <h3>学生信息管理系统</h3>
          <p class="login-subtitle">请登录以继续使用</p>
        </div>
        <div class="login-body">
          <div class="login-form-group">
            <label>账号</label>
            <input type="text" class="login-input" v-model="loginForm.username" placeholder="请输入账号" />
          </div>
          <div class="login-form-group">
            <label>密码</label>
            <div class="password-wrapper">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                class="login-input" 
                v-model="loginForm.password" 
                placeholder="请输入密码" 
              />
              <button
                type="button"
                class="password-toggle"
                @click="togglePassword"
                :title="showPassword ? '隐藏密码' : '显示密码'"
              >
                <svg v-if="showPassword" class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="login-error" v-if="loginError">{{ loginError }}</div>
        </div>
        <div class="login-footer">
          <button class="btn btn-login" @click="handleLogin">登录</button>
          <button class="btn btn-register" @click="handleRegister">注册</button>
        </div>
      </div>
    </div>

    <!-- 主内容区域（登录后显示） -->
    <template v-if="isLoggedIn">
      <div class="header">
        <h1>学生信息管理系统</h1>
        <p>管理学生信息，高效便捷</p>
        <button class="btn btn-logout" @click="handleLogout">退出登录</button>
      </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">学生列表</span>
        <button class="btn btn-primary" @click="openAddModal">+ 新增学生</button>
        </div>
      <div class="search-bar">
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜索姓名、学号或班级..." 
          v-model="searchKeyword"
        />
        <select class="form-control" style="width: 150px;" v-model="searchClass">
          <option value="">全部班级</option>
          <option v-for="cls in classes" :key="cls" :value="cls">{{ cls }}</option>
        </select>
      </div>

      <!-- 桌面端表格视图 -->
      <table class="table" v-if="filteredStudents.length > 0 && !isMobile">
        <thead>
          <tr>
            <th>学号</th>
            <th>姓名</th>
            <th>性别</th>
            <th>班级</th>
            <th>年龄</th>
            <th>电话号码</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in paginatedStudents" :key="student.id">
            <td>{{ student.studentId }}</td>
            <td>{{ student.name }}</td>
            <td>{{ student.gender === 'male' ? '男' : '女' }}</td>
            <td>{{ student.class }}</td>
            <td>{{ student.age }}</td>
            <td>{{ student.phone }}</td>
            <td>
              <span :class="['status-badge', student.status ? 'status-active' : 'status-inactive']">
                {{ student.status ? '在读' : '休学' }}
              </span>
            </td>
            <td>
              <button class="btn btn-warning btn-sm" @click="openEditModal(student)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="deleteStudent(student.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 移动端卡片视图 -->
      <div class="card-list" v-if="filteredStudents.length > 0 && isMobile">
        <div class="student-card" v-for="student in paginatedStudents" :key="student.id">
          <div class="card-top">
            <div class="card-name">{{ student.name }}</div>
            <span :class="['status-badge', student.status ? 'status-active' : 'status-inactive']">
              {{ student.status ? '在读' : '休学' }}
            </span>
          </div>
          <div class="card-info">
            <div class="info-row">
              <span class="info-label">学号</span>
              <span class="info-value">{{ student.studentId }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">性别</span>
              <span class="info-value">{{ student.gender === 'male' ? '男' : '女' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">班级</span>
              <span class="info-value">{{ student.class }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">年龄</span>
              <span class="info-value">{{ student.age }}岁</span>
            </div>
            <div class="info-row">
              <span class="info-label">电话</span>
              <span class="info-value">{{ student.phone }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-warning btn-sm" @click="openEditModal(student)">编辑</button>
            <button class="btn btn-danger btn-sm" @click="deleteStudent(student.id)">删除</button>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <div>暂无学生数据</div>
      </div>

      <div class="pagination" v-if="filteredStudents.length > 0">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <button 
          v-for="page in totalPages" 
          :key="page" 
          @click="currentPage = page"
          :class="{ active: currentPage === page }"
        >{{ page }}</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>

    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEdit ? '编辑学生' : '新增学生' }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>学号</label>
              <input type="text" class="form-control" v-model="form.studentId" placeholder="请输入学号" />
            </div>
            <div class="form-group">
              <label>姓名</label>
              <input type="text" class="form-control" v-model="form.name" placeholder="请输入姓名" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>性别</label>
              <select class="form-control" v-model="form.gender">
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
           </div>
            <div class="form-group">
              <label>年龄</label>
              <input type="number" class="form-control" v-model="form.age" placeholder="请输入年龄" @input="checkAge" />
              <span class="error-text" :class="{ visible: ageError }">{{ ageError }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>班级</label>
            <select class="form-control" v-model="form.class">
              <option v-for="cls in classes" :key="cls" :value="cls">{{ cls }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>电话号码</label>
            <input type="tel" class="form-control" v-model="form.phone" placeholder="请输入电话号码" @input="checkPhone" />
            <span class="error-text" :class="{ visible: phoneError }">{{ phoneError }}</span>
          </div>
          <div class="form-group">
            <label><input type="checkbox" v-model="form.status" /> 在读状态</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-success" @click="saveStudent">保存</button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { studentApi } from './api/student'

// 登录相关状态
const showLoginModal = ref(true)
const isLoggedIn = ref(false)
const loginError = ref('')
const showPassword = ref(false)
const loginForm = reactive({
  username: '',
  password: ''
})

// 切换密码可见性
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 用户数据 - 从 localStorage 读取或使用默认数据
const getDefaultUsers = () => [
  { username: 'admin', password: '123456' },
  { username: 'teacher', password: '123456' }
]

const users = ref(getDefaultUsers())

// 初始化用户数据
const initUsers = () => {
  const savedUsers = localStorage.getItem('users')
  if (savedUsers) {
    users.value = JSON.parse(savedUsers)
  } else {
    // 首次使用，保存默认用户到 localStorage
    users.value = getDefaultUsers()
    localStorage.setItem('users', JSON.stringify(users.value))
  }
}

// 保存用户数据到 localStorage
const saveUsers = () => {
  localStorage.setItem('users', JSON.stringify(users.value))
}

// 登录处理
const handleLogin = () => {
  loginError.value = ''
  if (!loginForm.username || !loginForm.password) {
    loginError.value = '请输入账号和密码'
    return
  }
  const user = users.value.find(u => 
    u.username === loginForm.username && u.password === loginForm.password
  )
  if (user) {
    isLoggedIn.value = true
    showLoginModal.value = false
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', loginForm.username)
    loadStudents()
  } else {
    loginError.value = '账号或密码错误'
  }
}

// 注册处理
const handleRegister = () => {
  loginError.value = ''
  if (!loginForm.username || !loginForm.password) {
    loginError.value = '请输入账号和密码'
    return
  }
  if (loginForm.password.length < 6) {
    loginError.value = '密码至少需要6位'
    return
  }
  const exists = users.value.find(u => u.username === loginForm.username)
  if (exists) {
    loginError.value = '该账号已存在'
    return
  }
  users.value.push({
    username: loginForm.username,
    password: loginForm.password
  })
  saveUsers() // 保存到 localStorage
  alert('注册成功，请登录')
  loginForm.password = ''
}

// 退出登录
const handleLogout = () => {
  isLoggedIn.value = false
  showLoginModal.value = true
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  loginForm.username = ''
  loginForm.password = ''
  loginError.value = ''
}

const students = ref([])
const loading = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 600
}

// 加载学生列表
const loadStudents = async () => {
  loading.value = true
  try {
    students.value = await studentApi.list()
  } catch (err) {
    alert('加载学生列表失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  initUsers() // 初始化用户数据
  // 检查是否已登录
  const savedLogin = localStorage.getItem('isLoggedIn')
  if (savedLogin === 'true') {
    isLoggedIn.value = true
    showLoginModal.value = false
    loadStudents()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const searchKeyword = ref('')
const searchClass = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const currentPage = ref(1)
const pageSize = ref(7)
const editId = ref(null)
const ageError = ref('')
const phoneError = ref('')

const classes = ['计算机1班', '计算机2班', '计算机3班', '软件工程1班', '软件工程2班']

const form = reactive({
  studentId: '',
  name: '',
  gender: 'male',
  class: '计算机1班',
  age: '',
  phone: '',
  status: true
})

const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchKeyword = !searchKeyword.value || 
      student.name.includes(searchKeyword.value) ||
      student.studentId.includes(searchKeyword.value) ||
      student.class.includes(searchKeyword.value)
    const matchClass = !searchClass.value || student.class === searchClass.value
    return matchKeyword && matchClass
  }).sort((a, b) => a.studentId.localeCompare(b.studentId))
})

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / pageSize.value))

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStudents.value.slice(start, start + pageSize.value)
})

const openAddModal = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(form, { studentId: '', name: '', gender: 'male', class: '计算机1班', age: '', phone: '', status: true })
  showModal.value = true
}

const openEditModal = (student) => {
  isEdit.value = true
  editId.value = student.id
  Object.assign(form, {
    studentId: student.studentId,
    name: student.name,
    gender: student.gender,
    class: student.class,
    age: student.age,
    phone: student.phone,
    status: student.status
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editId.value = null
  ageError.value = ''
  phoneError.value = ''
}

const checkAge = () => {
  const age = Number(form.age)
  if (isNaN(age)) {
    ageError.value = ''
  } else if (age < 0) {
    ageError.value = '年龄不能为负数'
    form.age = 0
  } else if (age === 0) {
    ageError.value = '年龄不能再小了'
  } else {
    ageError.value = ''
  }
}

const checkPhone = () => {
  const phone = form.phone
  if (!phone) {
    phoneError.value = ''
  } else if (phone.length !== 11) {
    phoneError.value = '电话号码格式不对，需为11位'
  } else {
    phoneError.value = ''
  }
}

const saveStudent = async () => {
  if (!form.studentId || !form.name || !form.age || !form.phone) {
    alert('请填写完整信息')
    return
  }
  if (form.age < 0) {
    alert('年龄不能为负数')
    return
  }
  if (phoneError.value) {
    alert('电话号码格式不正确')
    return
  }
  try {
    if (isEdit.value) {
      await studentApi.update(editId.value, { ...form })
    } else {
      await studentApi.create({ ...form })
    }
    await loadStudents()
    closeModal()
  } catch (err) {
    alert('保存失败: ' + err.message)
  }
}

const deleteStudent = async (id) => {
  if (!confirm('确定要删除该学生吗？')) return
  try {
    await studentApi.remove(id)
    await loadStudents()
    if (paginatedStudents.value.length === 0 && currentPage.value > 1) currentPage.value--
  } catch (err) {
    alert('删除失败: ' + err.message)
  }
}

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Microsoft YaHei', sans-serif; background-color: #f5f7fa; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.error-text { color: #ff4d4f; font-size: 12px; margin-bottom: 5px; display: block; height: 18px; line-height: 18px; opacity: 0; transition: opacity 0.3s; }
.error-text.visible { opacity: 1; }

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}
.header h1 { font-size: 24px; font-weight: 600; }
.header p { font-size: 14px; opacity: 0.9; margin-top: 5px; }

.card { background: white; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 24px; margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
.card-title { font-size: 18px; font-weight: 600; color: #333; }

.btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s ease; outline: none; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
.btn-success { background-color: #52c41a; color: white; }
.btn-success:hover { background-color: #43a047; }
.btn-warning { background-color: #faad14; color: white; }
.btn-warning:hover { background-color: #f59e0b; }
.btn-danger { background-color: #ff4d4f; color: white; }
.btn-danger:hover { background-color: #d9363e; }
.btn-sm { padding: 4px 12px; font-size: 12px; margin-right: 8px; }
.btn-sm:last-child { margin-right: 0; }

.search-bar { display: flex; gap: 10px; margin-bottom: 20px; }
.search-input { flex: 1; padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; transition: border-color 0.3s; }
.search-input:focus { border-color: #667eea; outline: none; }

.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
.table th { background-color: #fafafa; font-weight: 600; color: #666; }
.table tr:hover { background-color: #f9fafc; }
.table tr:last-child td { border-bottom: none; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; color: #333; }
.form-control { width: 100%; padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; transition: border-color 0.3s; }
.form-control:focus { border-color: #667eea; outline: none; }
.form-row { display: flex; gap: 20px; }
.form-row .form-group { flex: 1; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.2s ease; }
.modal { background: white; border-radius: 8px; width: 90%; max-width: 500px; overflow: hidden; animation: slideUp 0.3s ease; }
.modal-header { padding: 16px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 16px; font-weight: 600; }
.modal-close { width: 30px; height: 30px; border: none; background: rgba(255,255,255,0.2); color: white; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; justify-content: center; align-items: center; }
.modal-close:hover { background: rgba(255,255,255,0.3); }
.modal-body { padding: 20px; }
.modal-footer { padding: 15px 20px; background: #fafafa; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #eee; }

.status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.status-active { background-color: #f6ffed; color: #52c41a; }
.status-inactive { background-color: #fff2e8; color: #fa8c16; }

.empty-state { text-align: center; padding: 60px 20px; color: #999; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 5px; margin-top: 20px; }
.pagination button { padding: 6px 12px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 14px; }
.pagination button:hover:not(:disabled) { background: #f5f7fa; }
.pagination button.active { background: #667eea; color: white; border-color: #667eea; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* 移动端卡片视图样式 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.student-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.student-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.card-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-label {
  color: #888;
  flex-shrink: 0;
}

.info-value {
  color: #333;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.card-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.card-actions .btn {
  flex: 1;
  max-width: 80px;
}

/* 移动端响应式样式 */
@media screen and (max-width: 599px) {
  .container {
    padding: 12px;
  }

  .header {
    padding: 15px 20px;
    margin-bottom: 15px;
  }

  .header h1 {
    font-size: 20px;
  }

  .header p {
    font-size: 12px;
  }

  .card {
    padding: 15px;
    border-radius: 8px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .card-title {
    font-size: 16px;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-bar select {
    width: 100% !important;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }

  .pagination button {
    padding: 8px 12px;
    font-size: 13px;
  }

  .modal {
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .empty-state {
    padding: 40px 20px;
    font-size: 14px;
  }
}

/* 登录弹窗样式 */
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.login-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 25px;
}

.login-header h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #888;
  font-size: 14px;
}

.login-body {
  margin-bottom: 20px;
}

.login-form-group {
  margin-bottom: 20px;
}

.login-form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.login-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.login-input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.password-wrapper {
  position: relative;
  width: 100%;
}

.password-wrapper .login-input {
  padding-right: 45px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.5;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  opacity: 1;
}

.icon-eye {
  width: 20px;
  height: 20px;
  color: #666;
}

.login-error {
  color: #ff4d4f;
  font-size: 13px;
  text-align: center;
  padding: 10px;
  background: #fff2f0;
  border-radius: 4px;
  margin-bottom: 15px;
}

.login-footer {
  display: flex;
  gap: 15px;
}

.btn-login {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-register {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
}

.btn-logout {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header {
  position: relative;
}
</style>