export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return ''
    const d = typeof date === 'object' ? date : new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

export function formatRelativeTime(date) {
    if (!date) return ''
    const now = Date.now()
    const target = typeof date === 'object' ? date.getTime() : new Date(date).getTime()
    const diff = now - target
    
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day
    const month = 30 * day
    
    if (diff < minute) return '刚刚'
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
    if (diff < day) return `${Math.floor(diff / hour)}小时前`
    if (diff < week) return `${Math.floor(diff / day)}天前`
    if (diff < month) return `${Math.floor(diff / week)}周前`
    return formatDate(date, 'YYYY-MM-DD')
}

export function getDaysBetween(start, end) {
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    return Math.ceil((endTime - startTime) / (24 * 60 * 60 * 1000))
}

export function isToday(date) {
    const d = new Date(date)
    const today = new Date()
    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
}

export function getTodayStr(format = 'YYYY-MM-DD') {
    return formatDate(new Date(), format)
}

export function getDateRange(days) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days + 1)
    return {
        start: formatDate(start, 'YYYY-MM-DD'),
        end: formatDate(end, 'YYYY-MM-DD')
    }
}
