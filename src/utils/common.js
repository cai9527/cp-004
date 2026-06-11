export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => deepClone(item))
    const cloned = {}
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key])
        }
    }
    return cloned
}

export function debounce(fn, delay = 300) {
    let timer = null
    return function(...args) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}

export function throttle(fn, delay = 300) {
    let last = 0
    return function(...args) {
        const now = Date.now()
        if (now - last >= delay) {
            last = now
            fn.apply(this, args)
        }
    }
}

export function getStatusColor(status) {
    const map = {
        pending: '#FB8C00',
        processing: '#1E88E5',
        completed: '#43A047',
        cancelled: '#999999',
        overdue: '#E53935',
        high: '#E53935',
        medium: '#FB8C00',
        low: '#43A047',
        critical: '#B71C1C'
    }
    return map[status] || '#666666'
}

export function getStatusText(status, type = 'task') {
    const taskMap = {
        pending: '待接收',
        accepted: '待巡检',
        processing: '巡检中',
        completed: '已完成',
        cancelled: '已取消',
        overdue: '已逾期'
    }
    const hazardMap = {
        reported: '已上报',
        assigned: '已指派',
        rectifying: '整改中',
        review: '待复查',
        closed: '已闭环',
        rejected: '已驳回'
    }
    const levelMap = {
        critical: '重大隐患',
        high: '较大隐患',
        medium: '一般隐患',
        low: '轻微隐患'
    }
    if (type === 'hazard') return hazardMap[status] || status
    if (type === 'level') return levelMap[status] || status
    return taskMap[status] || status
}

export function getLevelTagClass(level) {
    const map = {
        critical: 'tag-red',
        high: 'tag-red',
        medium: 'tag-yellow',
        low: 'tag-green'
    }
    return map[level] || 'tag-gray'
}

export function validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone)
}

export function validateIdCard(idCard) {
    return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard)
}

export function truncateText(text, maxLen = 20) {
    if (!text) return ''
    return text.length > maxLen ? text.substr(0, maxLen) + '...' : text
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function pick(obj, keys) {
    const result = {}
    keys.forEach(key => {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key]
        }
    })
    return result
}

export function omit(obj, keys) {
    const result = { ...obj }
    keys.forEach(key => {
        delete result[key]
    })
    return result
}
