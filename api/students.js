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
  const { method, query, body } = req
  const pathParts = query.path ? query.path.split('/').filter(Boolean) : []
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // /api/students - GET (列表) 或 POST (新增)
  if (pathParts[0] === 'students' && !pathParts[1]) {
    if (method === 'GET') {
      const sorted = [...students].sort((a, b) => a.studentId.localeCompare(b.studentId))
      return res.status(200).json({ code: 0, data: sorted })
    }
    if (method === 'POST') {
      const { studentId, name, gender, class: cls, age, phone, status } = body
      if (!studentId || !name || age === undefined || !phone) {
        return res.status(400).json({ code: 1, message: '请填写完整信息' })
      }
      if (students.find(s => s.studentId === studentId)) {
        return res.status(400).json({ code: 1, message: '学号已存在' })
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
      return res.status(200).json({ code: 0, data: { id: newStudent.id } })
    }
  }
  
  // /api/students/:id - GET, PUT, DELETE
  if (pathParts[0] === 'students' && pathParts[1]) {
    const id = parseInt(pathParts[1])
    const index = students.findIndex(s => s.id === id)
    
    if (method === 'GET') {
      const student = students.find(s => s.id === id)
      if (!student) return res.status(404).json({ code: 1, message: '学生不存在' })
      return res.status(200).json({ code: 0, data: student })
    }
    
    if (method === 'PUT') {
      if (index === -1) return res.status(404).json({ code: 1, message: '学生不存在' })
      const { studentId, name, gender, class: cls, age, phone, status } = body
      if (!studentId || !name || age === undefined || !phone) {
        return res.status(400).json({ code: 1, message: '请填写完整信息' })
      }
      const otherStudent = students.find(s => s.studentId === studentId && s.id !== id)
      if (otherStudent) return res.status(400).json({ code: 1, message: '学号已存在' })
      
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
      return res.status(200).json({ code: 0, message: '更新成功' })
    }
    
    if (method === 'DELETE') {
      if (index === -1) return res.status(404).json({ code: 1, message: '学生不存在' })
      students.splice(index, 1)
      return res.status(200).json({ code: 0, message: '删除成功' })
    }
  }
  
  return res.status(404).json({ code: 1, message: 'API 不存在' })
}
