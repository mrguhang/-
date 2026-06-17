const students = [
  { id: 1, studentId: '2024001', name: '张三', gender: 'male', class: '计算机1班', age: 20, phone: '13800138001', status: true },
  { id: 2, studentId: '2024002', name: '李四', gender: 'female', class: '计算机2班', age: 19, phone: '13800138002', status: true },
  { id: 3, studentId: '2024003', name: '王五', gender: 'male', class: '计算机1班', age: 21, phone: '13800138003', status: false },
  { id: 4, studentId: '2024004', name: '赵六', gender: 'female', class: '计算机3班', age: 18, phone: '13800138004', status: true },
  { id: 5, studentId: '2024005', name: '钱七', gender: 'male', class: '计算机2班', age: 20, phone: '13800138005', status: true },
  { id: 6, studentId: '2024006', name: '孙八', gender: 'female', class: '计算机1班', age: 19, phone: '13800138006', status: false },
  { id: 7, studentId: '2024007', name: '周九', gender: 'male', class: '软件工程1班', age: 22, phone: '13800138007', status: true },
  { id: 8, studentId: '2024008', name: '吴十', gender: 'female', class: '软件工程2班', age: 20, phone: '13800138008', status: true },
  { id: 9, studentId: '2024009', name: '郑十一', gender: 'male', class: '计算机1班', age: 21, phone: '13800138009', status: true },
  { id: 10, studentId: '2024010', name: '陈十二', gender: 'female', class: '计算机2班', age: 19, phone: '13800138010', status: false },
  { id: 11, studentId: '2024011', name: '林十三', gender: 'male', class: '软件工程1班', age: 23, phone: '13800138011', status: true },
  { id: 12, studentId: '2024012', name: '黄十四', gender: 'female', class: '计算机3班', age: 20, phone: '13800138012', status: true }
]

let nextId = 13

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  const { method } = req
  const url = req.url || ''
  
  // 移除查询参数
  const pathname = url.split('?')[0]
  
  // GET /api/students - 获取列表
  if (pathname === '/api/students' && method === 'GET') {
    const sorted = [...students].sort((a, b) => a.studentId.localeCompare(b.studentId))
    res.status(200).json({ code: 0, data: sorted })
    return
  }
  
  // POST /api/students - 新增
  if (pathname === '/api/students' && method === 'POST') {
    const body = req.body || {}
    const { studentId, name, gender, class: cls, age, phone, status } = body
    
    if (!studentId || !name || age === undefined || !phone) {
      res.status(400).json({ code: 1, message: '请填写完整信息' })
      return
    }
    
    if (students.find(s => s.studentId === studentId)) {
      res.status(400).json({ code: 1, message: '学号已存在' })
      return
    }
    
    const newStudent = {
      id: nextId++,
      studentId,
      name,
      gender: gender || 'male',
      class: cls || '计算机1班',
      age: Number(age),
      phone,
      status: !!status
    }
    
    students.push(newStudent)
    res.status(200).json({ code: 0, data: { id: newStudent.id } })
    return
  }
  
  // /api/students/:id - 单个学生操作
  const match = pathname.match(/^\/api\/students\/(\d+)$/)
  if (match) {
    const id = parseInt(match[1])
    const index = students.findIndex(s => s.id === id)
    
    if (method === 'GET') {
      if (index === -1) {
        res.status(404).json({ code: 1, message: '学生不存在' })
        return
      }
      res.status(200).json({ code: 0, data: students[index] })
      return
    }
    
    if (method === 'PUT') {
      if (index === -1) {
        res.status(404).json({ code: 1, message: '学生不存在' })
        return
      }
      
      const body = req.body || {}
      const { studentId, name, gender, class: cls, age, phone, status } = body
      
      if (!studentId || !name || age === undefined || !phone) {
        res.status(400).json({ code: 1, message: '请填写完整信息' })
        return
      }
      
      const otherStudent = students.find(s => s.studentId === studentId && s.id !== id)
      if (otherStudent) {
        res.status(400).json({ code: 1, message: '学号已存在' })
        return
      }
      
      students[index] = {
        ...students[index],
        studentId,
        name,
        gender: gender || 'male',
        class: cls || '计算机1班',
        age: Number(age),
        phone,
        status: !!status
      }
      
      res.status(200).json({ code: 0, message: '更新成功' })
      return
    }
    
    if (method === 'DELETE') {
      if (index === -1) {
        res.status(404).json({ code: 1, message: '学生不存在' })
        return
      }
      
      students.splice(index, 1)
      res.status(200).json({ code: 0, message: '删除成功' })
      return
    }
  }
  
  res.status(404).json({ code: 1, message: 'API 不存在' })
}
