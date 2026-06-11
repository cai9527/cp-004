import Vue from 'vue'
import Vuex from 'vuex'
import { storage } from '../utils/storage.js'
import api from '../utils/api.js'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        token: storage.getToken() || '',
        user: storage.getUser() || null,
        networkStatus: true,
        projects: [],
        tasks: [],
        hazards: [],
        checkItems: [],
        syncQueue: storage.getSyncQueue() || [],
        workbenchData: null,
        statistics: null,
        loading: {
            tasks: false,
            hazards: false,
            statistics: false
        }
    },

    getters: {
        isLoggedIn: state => !!state.token,
        getUserRole: state => state.user ? state.user.role : '',
        getPendingSyncCount: state => {
            return state.syncQueue.filter(item => !item.synced).length
        },
        getTasksByStatus: state => (status) => {
            return state.tasks.filter(t => t.status === status)
        },
        getHazardsByStatus: state => (status) => {
            return state.hazards.filter(h => h.status === status)
        },
        getHazardsByLevel: state => (level) => {
            return state.hazards.filter(h => h.level === level)
        },
        getTaskById: state => (id) => {
            return state.tasks.find(t => t.id === id) || null
        },
        getHazardById: state => (id) => {
            return state.hazards.find(h => h.id === id) || null
        }
    },

    mutations: {
        SET_TOKEN(state, token) {
            state.token = token
            storage.setToken(token)
        },
        SET_USER(state, user) {
            state.user = user
            storage.setUser(user)
        },
        CLEAR_AUTH(state) {
            state.token = ''
            state.user = null
            storage.removeToken()
            storage.removeUser()
        },
        SET_NETWORK_STATUS(state, status) {
            state.networkStatus = status
        },
        SET_PROJECTS(state, projects) {
            state.projects = projects
        },
        SET_TASKS(state, tasks) {
            state.tasks = tasks
        },
        UPDATE_TASK(state, task) {
            const index = state.tasks.findIndex(t => t.id === task.id)
            if (index > -1) {
                Vue.set(state.tasks, index, { ...state.tasks[index], ...task })
            } else {
                state.tasks.unshift(task)
            }
        },
        SET_HAZARDS(state, hazards) {
            state.hazards = hazards
        },
        UPDATE_HAZARD(state, hazard) {
            const index = state.hazards.findIndex(h => h.id === hazard.id)
            if (index > -1) {
                Vue.set(state.hazards, index, { ...state.hazards[index], ...hazard })
            } else {
                state.hazards.unshift(hazard)
            }
        },
        ADD_HAZARD(state, hazard) {
            state.hazards.unshift(hazard)
        },
        SET_CHECK_ITEMS(state, items) {
            state.checkItems = items
        },
        SET_SYNC_QUEUE(state, queue) {
            state.syncQueue = queue
        },
        ADD_TO_SYNC_QUEUE(state, item) {
            const queueItem = {
                ...item,
                id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: Date.now(),
                retryCount: 0,
                synced: false
            }
            state.syncQueue.push(queueItem)
            storage.addToSyncQueue(item)
            const pendingCount = state.syncQueue.filter(i => !i.synced).length
            if (pendingCount > 0) {
                uni.setTabBarBadge({
                    index: 4,
                    text: String(pendingCount)
                }).catch(() => {})
            }
        },
        UPDATE_SYNC_ITEM(state, { id, updates }) {
            const index = state.syncQueue.findIndex(i => i.id === id)
            if (index > -1) {
                Vue.set(state.syncQueue, index, { ...state.syncQueue[index], ...updates })
                storage.updateSyncQueueItem(id, updates)
            }
        },
        REMOVE_FROM_SYNC_QUEUE(state, id) {
            state.syncQueue = state.syncQueue.filter(i => i.id !== id)
            storage.removeFromSyncQueue(id)
            const pendingCount = state.syncQueue.filter(i => !i.synced).length
            if (pendingCount === 0) {
                uni.removeTabBarBadge({ index: 4 }).catch(() => {})
            } else {
                uni.setTabBarBadge({
                    index: 4,
                    text: String(pendingCount)
                }).catch(() => {})
            }
        },
        SET_WORKBENCH_DATA(state, data) {
            state.workbenchData = data
        },
        SET_STATISTICS(state, data) {
            state.statistics = data
        },
        SET_LOADING(state, { key, value }) {
            if (state.loading.hasOwnProperty(key)) {
                state.loading[key] = value
            }
        }
    },

    actions: {
        async login({ commit }, { username, password }) {
            const res = await api.login(username, password)
            if (res.code === 200) {
                commit('SET_TOKEN', res.data.token)
                commit('SET_USER', res.data.user)
            }
            return res
        },

        async logout({ commit }) {
            commit('CLEAR_AUTH')
            commit('SET_TASKS', [])
            commit('SET_HAZARDS', [])
            commit('SET_WORKBENCH_DATA', null)
        },

        async loadProjects({ commit, state }) {
            if (state.projects.length > 0) return state.projects
            const res = await api.getProjects()
            if (res.code === 200) {
                commit('SET_PROJECTS', res.data)
            }
            return res
        },

        async loadTasks({ commit }, params = {}) {
            commit('SET_LOADING', { key: 'tasks', value: true })
            try {
                const res = await api.getTasks(params)
                if (res.code === 200) {
                    commit('SET_TASKS', res.data)
                }
                return res
            } finally {
                commit('SET_LOADING', { key: 'tasks', value: false })
            }
        },

        async acceptTask({ commit }, taskId) {
            const res = await api.acceptTask(taskId)
            if (res.code === 200) {
                commit('UPDATE_TASK', res.data)
            }
            return res
        },

        async startTask({ commit }, taskId) {
            const res = await api.startTask(taskId)
            if (res.code === 200) {
                commit('UPDATE_TASK', res.data)
            }
            return res
        },

        async completeTask({ commit }, { taskId, result }) {
            const res = await api.completeTask(taskId, result)
            if (res.code === 200) {
                commit('UPDATE_TASK', res.data)
            }
            return res
        },

        async loadHazards({ commit }, params = {}) {
            commit('SET_LOADING', { key: 'hazards', value: true })
            try {
                const res = await api.getHazards(params)
                if (res.code === 200) {
                    commit('SET_HAZARDS', res.data)
                }
                return res
            } finally {
                commit('SET_LOADING', { key: 'hazards', value: false })
            }
        },

        async reportHazard({ commit, state, dispatch }, hazard) {
            if (!state.networkStatus) {
                commit('ADD_TO_SYNC_QUEUE', {
                    type: 'report_hazard',
                    data: hazard
                })
                const offlineHazard = {
                    ...hazard,
                    id: `offline_${Date.now()}`,
                    hazardNo: `YH_OFFLINE_${Date.now()}`,
                    status: 'reported',
                    reporterId: state.user ? state.user.id : '',
                    reporterName: state.user ? state.user.name : '',
                    reportTime: new Date().toISOString().replace('T', ' ').substr(0, 19),
                    _offline: true
                }
                commit('ADD_HAZARD', offlineHazard)
                return { code: 200, message: '已保存到本地，联网后自动同步', data: offlineHazard }
            }
            const res = await api.reportHazard(hazard)
            if (res.code === 200) {
                commit('ADD_HAZARD', res.data)
            }
            return res
        },

        async assignRectification({ commit }, { hazardId, rectifierId, rectifierName, deadline }) {
            const res = await api.assignRectification(hazardId, rectifierId, rectifierName, deadline)
            if (res.code === 200) {
                commit('UPDATE_HAZARD', res.data)
            }
            return res
        },

        async submitRectification({ commit, state }, { hazardId, desc, images }) {
            if (!state.networkStatus) {
                commit('ADD_TO_SYNC_QUEUE', {
                    type: 'submit_rectification',
                    data: { hazardId, desc, images }
                })
                const offlineUpdate = {
                    id: hazardId,
                    status: 'review',
                    rectifyDesc: desc,
                    rectifyImages: images,
                    rectifyTime: new Date().toISOString().replace('T', ' ').substr(0, 19),
                    _offlineUpdated: true
                }
                commit('UPDATE_HAZARD', offlineUpdate)
                return { code: 200, message: '已保存到本地，联网后自动同步' }
            }
            const res = await api.submitRectification(hazardId, desc, images)
            if (res.code === 200) {
                commit('UPDATE_HAZARD', res.data)
            }
            return res
        },

        async reviewHazard({ commit }, { hazardId, result, remark }) {
            const res = await api.reviewHazard(hazardId, result, remark)
            if (res.code === 200) {
                commit('UPDATE_HAZARD', res.data)
            }
            return res
        },

        async submitCheckRecord({ commit, state }, record) {
            if (!state.networkStatus) {
                commit('ADD_TO_SYNC_QUEUE', {
                    type: 'check_record',
                    data: record
                })
                return { code: 200, message: '已保存到本地，联网后自动同步' }
            }
            return await api.submitCheckRecord(record)
        },

        async loadWorkbench({ commit }) {
            const res = await api.getWorkbenchData()
            if (res.code === 200) {
                commit('SET_WORKBENCH_DATA', res.data)
            }
            return res
        },

        async loadStatistics({ commit }) {
            commit('SET_LOADING', { key: 'statistics', value: true })
            try {
                const res = await api.getStatistics()
                if (res.code === 200) {
                    commit('SET_STATISTICS', res.data)
                }
                return res
            } finally {
                commit('SET_LOADING', { key: 'statistics', value: false })
            }
        },

        async autoSyncOfflineData({ state, commit, dispatch }) {
            if (!state.networkStatus) return
            const pendingItems = state.syncQueue.filter(item => !item.synced && (item.retryCount || 0) < 5)
            if (pendingItems.length === 0) return

            console.log(`开始同步 ${pendingItems.length} 条离线数据`)

            for (const item of pendingItems) {
                try {
                    let res
                    switch (item.type) {
                        case 'report_hazard':
                            res = await dispatch('reportHazard', item.data)
                            break
                        case 'submit_rectification':
                            const { hazardId, desc, images } = item.data
                            state.networkStatus = true
                            res = await api.submitRectification(hazardId, desc, images)
                            if (res.code === 200) {
                                commit('UPDATE_HAZARD', res.data)
                            }
                            break
                        case 'check_record':
                            res = await api.submitCheckRecord(item.data)
                            break
                        default:
                            res = await api.syncOfflineData([item.data])
                    }

                    if (res.code === 200) {
                        commit('REMOVE_FROM_SYNC_QUEUE', item.id)
                    } else {
                        commit('UPDATE_SYNC_ITEM', {
                            id: item.id,
                            updates: { lastError: res.message }
                        })
                    }
                } catch (err) {
                    console.error('Sync error:', err)
                    commit('UPDATE_SYNC_ITEM', {
                        id: item.id,
                        updates: { lastError: err.message || '同步失败' }
                    })
                }
            }

            const remaining = state.syncQueue.filter(i => !i.synced).length
            if (remaining === 0) {
                uni.showToast({
                    title: '离线数据同步完成',
                    icon: 'success'
                })
            } else if (pendingItems.length > 0 && remaining < pendingItems.length) {
                uni.showToast({
                    title: `部分同步完成，剩余${remaining}条`,
                    icon: 'none'
                })
            }
        },

        async manualSyncAll({ dispatch }) {
            return await dispatch('autoSyncOfflineData')
        }
    }
})

export default store
