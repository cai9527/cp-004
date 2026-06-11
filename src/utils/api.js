import {
    mockUsers,
    mockProjects,
    mockTasks,
    mockCheckItems,
    mockHazards,
    mockCheckRecords,
    mockStatistics
} from '../mock/index.js'
import { generateId } from './common.js'
import { storage } from './storage.js'

const delay = (data, ms = 500) => new Promise(resolve => setTimeout(() => resolve(data), ms))

export const api = {
    async login(username, password) {
        const user = mockUsers.find(u => u.username === username && u.password === password)
        if (user) {
            const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
            const userInfo = { ...user }
            delete userInfo.password
            return delay({
                code: 200,
                message: '登录成功',
                data: {
                    token,
                    user: userInfo
                }
            })
        }
        return delay({
            code: 401,
            message: '用户名或密码错误',
            data: null
        }, 800)
    },

    async getUserInfo() {
        const user = storage.getUser()
        if (user) {
            return delay({ code: 200, data: user })
        }
        return delay({ code: 401, message: '未登录' })
    },

    async getProjects() {
        const user = storage.getUser()
        let projects = mockProjects
        if (user && user.projectIds && user.projectIds.length > 0) {
            projects = mockProjects.filter(p => user.projectIds.includes(p.id))
        }
        return delay({ code: 200, data: projects })
    },

    async getTasks(params = {}) {
        let tasks = [...mockTasks]
        if (params.status) {
            tasks = tasks.filter(t => t.status === params.status)
        }
        if (params.projectId) {
            tasks = tasks.filter(t => t.projectId === params.projectId)
        }
        if (params.assigneeId) {
            tasks = tasks.filter(t => t.assigneeId === params.assigneeId)
        }
        if (params.keyword) {
            const kw = params.keyword.toLowerCase()
            tasks = tasks.filter(t =>
                t.title.toLowerCase().includes(kw) ||
                t.taskNo.toLowerCase().includes(kw)
            )
        }
        tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        return delay({ code: 200, data: tasks })
    },

    async getTaskDetail(taskId) {
        const task = mockTasks.find(t => t.id === taskId)
        if (!task) {
            return delay({ code: 404, message: '任务不存在' })
        }
        const checkItems = mockCheckItems.filter(ci => task.checkItems.includes(ci.id))
        const records = mockCheckRecords.filter(r => r.taskId === taskId)
        const hazards = mockHazards.filter(h => h.taskId === taskId)
        return delay({
            code: 200,
            data: {
                ...task,
                checkItems,
                records,
                hazards
            }
        })
    },

    async acceptTask(taskId) {
        const task = mockTasks.find(t => t.id === taskId)
        if (task) {
            task.status = 'accepted'
            task.acceptAt = new Date().toISOString().replace('T', ' ').substr(0, 19)
        }
        return delay({ code: 200, message: '任务已接收', data: task })
    },

    async startTask(taskId) {
        const task = mockTasks.find(t => t.id === taskId)
        if (task) {
            task.status = 'processing'
            task.startAt = new Date().toISOString().replace('T', ' ').substr(0, 19)
        }
        return delay({ code: 200, message: '已开始巡检', data: task })
    },

    async completeTask(taskId, result) {
        const task = mockTasks.find(t => t.id === taskId)
        if (task) {
            task.status = 'completed'
            task.completeAt = new Date().toISOString().replace('T', ' ').substr(0, 19)
            task.result = result
        }
        return delay({ code: 200, message: '任务已完成', data: task })
    },

    async getCheckItems(category) {
        let items = [...mockCheckItems]
        if (category) {
            items = items.filter(i => i.category === category)
        }
        return delay({ code: 200, data: items })
    },

    async submitCheckRecord(record) {
        const newRecord = {
            id: generateId('cr'),
            ...record,
            checkTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
        }
        mockCheckRecords.push(newRecord)
        return delay({ code: 200, message: '记录已提交', data: newRecord })
    },

    async getHazards(params = {}) {
        let hazards = [...mockHazards]
        if (params.status) {
            hazards = hazards.filter(h => h.status === params.status)
        }
        if (params.level) {
            hazards = hazards.filter(h => h.level === params.level)
        }
        if (params.projectId) {
            hazards = hazards.filter(h => h.projectId === params.projectId)
        }
        if (params.rectifierId) {
            hazards = hazards.filter(h => h.rectifierId === params.rectifierId)
        }
        if (params.keyword) {
            const kw = params.keyword.toLowerCase()
            hazards = hazards.filter(h =>
                h.title.toLowerCase().includes(kw) ||
                h.hazardNo.toLowerCase().includes(kw)
            )
        }
        hazards.sort((a, b) => new Date(b.reportTime) - new Date(a.reportTime))
        return delay({ code: 200, data: hazards })
    },

    async getHazardDetail(hazardId) {
        const hazard = mockHazards.find(h => h.id === hazardId)
        if (!hazard) {
            return delay({ code: 404, message: '隐患不存在' })
        }
        return delay({ code: 200, data: hazard })
    },

    async reportHazard(hazard) {
        const user = storage.getUser()
        const newHazard = {
            id: generateId('h'),
            hazardNo: `YH${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(mockHazards.length + 1).padStart(3, '0')}`,
            status: 'reported',
            reporterId: user ? user.id : '',
            reporterName: user ? user.name : '',
            reportTime: new Date().toISOString().replace('T', ' ').substr(0, 19),
            rectifierId: null,
            rectifierName: null,
            rectifyDesc: '',
            rectifyImages: [],
            rectifyTime: null,
            reviewerId: null,
            reviewerName: null,
            reviewResult: null,
            reviewTime: null,
            closeTime: null,
            ...hazard
        }
        mockHazards.unshift(newHazard)
        return delay({ code: 200, message: '隐患已上报', data: newHazard })
    },

    async assignRectification(hazardId, rectifierId, rectifierName, deadline) {
        const hazard = mockHazards.find(h => h.id === hazardId)
        if (hazard) {
            hazard.status = 'assigned'
            hazard.rectifierId = rectifierId
            hazard.rectifierName = rectifierName
            hazard.rectifyDeadline = deadline
        }
        return delay({ code: 200, message: '整改已指派', data: hazard })
    },

    async submitRectification(hazardId, desc, images) {
        const hazard = mockHazards.find(h => h.id === hazardId)
        if (hazard) {
            hazard.status = 'review'
            hazard.rectifyDesc = desc
            hazard.rectifyImages = images
            hazard.rectifyTime = new Date().toISOString().replace('T', ' ').substr(0, 19)
        }
        return delay({ code: 200, message: '整改已提交', data: hazard })
    },

    async reviewHazard(hazardId, result, remark = '') {
        const hazard = mockHazards.find(h => h.id === hazardId)
        const user = storage.getUser()
        if (hazard) {
            hazard.reviewerId = user ? user.id : ''
            hazard.reviewerName = user ? user.name : ''
            hazard.reviewResult = result
            hazard.reviewTime = new Date().toISOString().replace('T', ' ').substr(0, 19)
            if (result === 'pass') {
                hazard.status = 'closed'
                hazard.closeTime = hazard.reviewTime
            } else {
                hazard.status = 'rectifying'
            }
        }
        return delay({
            code: 200,
            message: result === 'pass' ? '复查通过，隐患已闭环' : '复查不通过，请重新整改',
            data: hazard
        })
    },

    async getStatistics(type = 'overview') {
        if (type === 'overview') return delay({ code: 200, data: mockStatistics.overview })
        if (type === 'trend') return delay({ code: 200, data: mockStatistics.trend })
        if (type === 'category') return delay({ code: 200, data: mockStatistics.categoryDistribution })
        if (type === 'project') return delay({ code: 200, data: mockStatistics.projectRanking })
        return delay({ code: 200, data: mockStatistics })
    },

    async getWorkbenchData() {
        const user = storage.getUser()
        const assigneeId = user ? user.id : null
        const [allTasks, allHazards] = await Promise.all([
            this.getTasks(assigneeId ? { assigneeId } : {}),
            this.getHazards()
        ])
        const tasks = allTasks.data || []
        const hazards = allHazards.data || []
        const rectifyTasks = hazards.filter(h => h.rectifierId === assigneeId && ['assigned', 'rectifying'].includes(h.status))
        const reviewTasks = hazards.filter(h => ['reported', 'review'].includes(h.status))
        return delay({
            code: 200,
            data: {
                stats: {
                    pendingTasks: tasks.filter(t => t.status === 'pending').length,
                    acceptedTasks: tasks.filter(t => t.status === 'accepted').length,
                    processingTasks: tasks.filter(t => t.status === 'processing').length,
                    todayHazards: hazards.filter(h => h.reportTime && h.reportTime.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
                    myRectify: rectifyTasks.length,
                    pendingReview: reviewTasks.length
                },
                recentTasks: tasks.slice(0, 5),
                recentHazards: hazards.slice(0, 5)
            }
        })
    },

    async syncOfflineData(data) {
        console.log('Syncing offline data:', data)
        return delay({
            code: 200,
            message: '同步成功',
            data: { syncedCount: data.length }
        }, 1500)
    },

    async uploadImages(filePaths) {
        console.log('Uploading images:', filePaths)
        return delay({
            code: 200,
            message: '上传成功',
            data: filePaths
        }, 1000)
    }
}

export default api
