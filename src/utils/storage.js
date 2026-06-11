const TOKEN_KEY = 'smart_site_token'
const USER_KEY = 'smart_site_user'
const OFFLINE_DATA_KEY = 'smart_site_offline_data'
const SYNC_QUEUE_KEY = 'smart_site_sync_queue'

export const storage = {
    setToken(token) {
        uni.setStorageSync(TOKEN_KEY, token)
    },
    getToken() {
        return uni.getStorageSync(TOKEN_KEY) || ''
    },
    removeToken() {
        uni.removeStorageSync(TOKEN_KEY)
    },
    setUser(user) {
        uni.setStorageSync(USER_KEY, JSON.stringify(user))
    },
    getUser() {
        const user = uni.getStorageSync(USER_KEY)
        return user ? JSON.parse(user) : null
    },
    removeUser() {
        uni.removeStorageSync(USER_KEY)
    },
    setOfflineData(key, data) {
        const allData = this.getAllOfflineData()
        allData[key] = {
            data,
            timestamp: Date.now(),
            synced: false
        }
        uni.setStorageSync(OFFLINE_DATA_KEY, JSON.stringify(allData))
    },
    getOfflineData(key) {
        const allData = this.getAllOfflineData()
        return allData[key] || null
    },
    getAllOfflineData() {
        const data = uni.getStorageSync(OFFLINE_DATA_KEY)
        return data ? JSON.parse(data) : {}
    },
    removeOfflineData(key) {
        const allData = this.getAllOfflineData()
        delete allData[key]
        uni.setStorageSync(OFFLINE_DATA_KEY, JSON.stringify(allData))
    },
    addToSyncQueue(item) {
        const queue = this.getSyncQueue()
        queue.push({
            ...item,
            id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            retryCount: 0
        })
        uni.setStorageSync(SYNC_QUEUE_KEY, JSON.stringify(queue))
    },
    getSyncQueue() {
        const queue = uni.getStorageSync(SYNC_QUEUE_KEY)
        return queue ? JSON.parse(queue) : []
    },
    removeFromSyncQueue(id) {
        const queue = this.getSyncQueue().filter(item => item.id !== id)
        uni.setStorageSync(SYNC_QUEUE_KEY, JSON.stringify(queue))
    },
    updateSyncQueueItem(id, updates) {
        const queue = this.getSyncQueue().map(item => {
            if (item.id === id) {
                return { ...item, ...updates, retryCount: (item.retryCount || 0) + 1 }
            }
            return item
        })
        uni.setStorageSync(SYNC_QUEUE_KEY, JSON.stringify(queue))
    },
    clearSyncQueue() {
        uni.removeStorageSync(SYNC_QUEUE_KEY)
    },
    clearAll() {
        uni.clearStorageSync()
    }
}

export default storage
