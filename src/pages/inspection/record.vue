<template>
    <view class="inspection-record">
        <view class="progress-bar-wrap">
            <view class="progress-info">
                <view class="progress-left">
                    <text class="progress-label">检查进度</text>
                    <text class="progress-count">{{ checkedCount }}/{{ totalCount }}</text>
                </view>
                <view class="progress-right">
                    <text class="progress-percent">{{ progressPercent }}%</text>
                </view>
            </view>
            <view class="progress-track">
                <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
            </view>
            <view class="progress-tags">
                <view class="tag tag-pass">
                    <text class="tag-dot"></text>
                    <text>通过 {{ passCount }}</text>
                </view>
                <view class="tag tag-fail">
                    <text class="tag-dot"></text>
                    <text>不通过 {{ failCount }}</text>
                </view>
                <view class="tag tag-pending">
                    <text class="tag-dot"></text>
                    <text>待整改 {{ pendingRectifyCount }}</text>
                </view>
            </view>
        </view>

        <view class="content-wrap">
            <view v-if="task" class="task-card">
                <view class="task-header">
                    <view class="task-type" :class="'type-' + task.type">{{ task.typeName }}</view>
                    <view class="network-status" :class="{ offline: !networkStatus }">
                        <text class="status-dot"></text>
                        <text>{{ networkStatus ? '在线' : '离线' }}</text>
                    </view>
                </view>
                <text class="task-title">{{ task.title }}</text>
                <view class="task-info-grid">
                    <view class="info-item">
                        <text class="info-icon">📋</text>
                        <view class="info-content">
                            <text class="info-label">所属项目</text>
                            <text class="info-value">{{ task.projectName }}</text>
                        </view>
                    </view>
                    <view class="info-item">
                        <text class="info-icon">📍</text>
                        <view class="info-content">
                            <text class="info-label">检查区域</text>
                            <text class="info-value">{{ task.area }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <view class="location-card">
                <view class="card-header">
                    <view class="header-left">
                        <text class="header-icon">🌐</text>
                        <text class="header-title">巡检位置</text>
                    </view>
                    <view class="header-right" @tap="refreshLocation">
                        <text class="refresh-icon" :class="{ spinning: locating }">⟳</text>
                        <text>重新定位</text>
                    </view>
                </view>
                <view v-if="location" class="location-info">
                    <view class="location-row">
                        <text class="location-label">经度</text>
                        <text class="location-value">{{ location.longitude ? location.longitude.toFixed(6) : '--' }}</text>
                    </view>
                    <view class="location-row">
                        <text class="location-label">纬度</text>
                        <text class="location-value">{{ location.latitude ? location.latitude.toFixed(6) : '--' }}</text>
                    </view>
                    <view v-if="location.address" class="location-row">
                        <text class="location-label">地址</text>
                        <text class="location-value location-address">{{ location.address }}</text>
                    </view>
                </view>
                <view v-else class="location-empty" @tap="refreshLocation">
                    <text>点击获取当前位置</text>
                </view>
            </view>

            <view class="checklist-card">
                <view class="card-header">
                    <view class="header-left">
                        <text class="header-icon">✅</text>
                        <text class="header-title">检查清单</text>
                    </view>
                    <text class="header-count">共{{ checkItems.length }}项</text>
                </view>

                <view 
                    v-for="(item, index) in checkItems" 
                    :key="item.id" 
                    class="check-item-card"
                    :class="{ expanded: expandedItem === item.id }"
                >
                    <view class="check-item-header" @tap="toggleItem(item.id)">
                        <view class="check-item-index">{{ index + 1 }}</view>
                        <view class="check-item-main">
                            <view class="check-item-name">
                                <text>{{ item.name }}</text>
                                <text v-if="item.required" class="required-badge">必检</text>
                            </view>
                            <view class="check-item-category">
                                <text class="category-tag">{{ item.categoryName }}</text>
                            </view>
                        </view>
                        <view class="check-item-result">
                            <view v-if="getItemResult(item.id) === 'pass'" class="result-badge result-pass">
                                <text>✓ 通过</text>
                            </view>
                            <view v-else-if="getItemResult(item.id) === 'fail'" class="result-badge result-fail">
                                <text>✕ 不通过</text>
                            </view>
                            <view v-else-if="getItemResult(item.id) === 'rectify'" class="result-badge result-rectify">
                                <text>⚠ 待整改</text>
                            </view>
                            <view v-else class="result-badge result-none">
                                <text>未检</text>
                            </view>
                        </view>
                    </view>

                    <view v-if="expandedItem === item.id" class="check-item-detail">
                        <view class="action-buttons">
                            <view 
                                class="action-btn action-pass" 
                                :class="{ active: getItemResult(item.id) === 'pass' }"
                                @tap.stop="setItemResult(item, 'pass')"
                            >
                                <text class="action-icon">✓</text>
                                <text>通过</text>
                            </view>
                            <view 
                                class="action-btn action-fail"
                                :class="{ active: getItemResult(item.id) === 'fail' }"
                                @tap.stop="setItemResult(item, 'fail')"
                            >
                                <text class="action-icon">✕</text>
                                <text>不通过</text>
                            </view>
                            <view 
                                class="action-btn action-rectify"
                                :class="{ active: getItemResult(item.id) === 'rectify' }"
                                @tap.stop="setItemResult(item, 'rectify')"
                            >
                                <text class="action-icon">⚠</text>
                                <text>待整改</text>
                            </view>
                        </view>

                        <view v-if="['fail', 'rectify'].includes(getItemResult(item.id))" class="detail-section">
                            <view class="section-title">备注说明</view>
                            <textarea 
                                class="remark-input"
                                :placeholder="getItemResult(item.id) === 'fail' ? '请描述不通过的原因及具体情况...' : '请描述需要整改的内容及要求...'"
                                v-model="itemRecords[item.id].remark"
                                maxlength="500"
                                @blur="saveToLocal"
                            />
                            <view class="remark-counter">{{ (itemRecords[item.id].remark || '').length }}/500</view>

                            <view class="section-title">
                                <text>拍照取证</text>
                                <text class="img-count">（{{ (itemRecords[item.id].images || []).length }}/9）</text>
                            </view>
                            <view class="image-grid">
                                <view 
                                    v-for="(img, imgIndex) in (itemRecords[item.id].images || [])" 
                                    :key="imgIndex"
                                    class="image-item"
                                >
                                    <image :src="img" mode="aspectFill" @tap.stop="previewImage(item.id, imgIndex)" />
                                    <view class="image-remove" @tap.stop="removeImage(item.id, imgIndex)">×</view>
                                </view>
                                <view 
                                    v-if="(itemRecords[item.id].images || []).length < 9"
                                    class="image-add"
                                    @tap.stop="addImages(item.id)"
                                >
                                    <text class="add-icon">+</text>
                                    <text class="add-text">拍照/相册</text>
                                </view>
                            </view>

                            <view 
                                v-if="getItemResult(item.id) === 'fail'"
                                class="hazard-action-wrap"
                            >
                                <view class="hazard-hint">
                                    <text class="hint-icon">💡</text>
                                    <text class="hint-text">此项不通过，建议上报安全隐患</text>
                                </view>
                                <view class="hazard-btns">
                                    <button class="hazard-btn hazard-btn-outline" @tap.stop="skipHazard(item)">
                                        暂不上报
                                    </button>
                                    <button class="hazard-btn hazard-btn-primary" @tap.stop="goReportHazard(item)">
                                        上报隐患 →
                                    </button>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <view v-if="checkItems.length === 0" class="empty-state">
                    <text class="empty-icon">📋</text>
                    <text class="empty-text">暂无检查项</text>
                </view>
            </view>

            <view class="overall-remark-card">
                <view class="card-header">
                    <view class="header-left">
                        <text class="header-icon">📝</text>
                        <text class="header-title">总体评价</text>
                    </view>
                </view>
                <textarea 
                    class="overall-input"
                    placeholder="请填写本次检查的总体评价及其他说明..."
                    v-model="overallRemark"
                    maxlength="1000"
                    @blur="saveToLocal"
                />
                <view class="remark-counter">{{ overallRemark.length }}/1000</view>
            </view>
        </view>

        <view class="bottom-bar">
            <view class="summary-info">
                <text>已检查 {{ checkedCount }} 项</text>
                <text v-if="failCount > 0" class="danger-text">，不通过 {{ failCount }} 项</text>
            </view>
            <view class="action-wrap">
                <button class="bottom-btn btn-save" @tap="handleSave">
                    <text>暂存</text>
                </button>
                <button class="bottom-btn btn-submit" @tap="handleSubmit">
                    <text>提交</text>
                </button>
            </view>
        </view>

        <view v-if="submitting" class="loading-mask">
            <view class="loading-box">
                <view class="loading-spinner"></view>
                <text class="loading-text">{{ submittingText }}</text>
            </view>
        </view>
    </view>
</template>

<script>
import * as ui from '../../utils/ui.js'
import api from '../../utils/api.js'
import { storage } from '../../utils/storage.js'

const LOCAL_DRAFT_PREFIX = 'inspection_draft_'

export default {
    data() {
        return {
            taskId: '',
            task: null,
            checkItems: [],
            itemRecords: {},
            overallRemark: '',
            expandedItem: null,
            location: null,
            locating: false,
            networkStatus: true,
            submitting: false,
            submittingText: '提交中...',
            autoSaveTimer: null
        }
    },
    computed: {
        totalCount() {
            return this.checkItems.length
        },
        checkedCount() {
            return Object.keys(this.itemRecords).filter(id => this.itemRecords[id].result).length
        },
        passCount() {
            return Object.keys(this.itemRecords).filter(id => this.itemRecords[id].result === 'pass').length
        },
        failCount() {
            return Object.keys(this.itemRecords).filter(id => this.itemRecords[id].result === 'fail').length
        },
        pendingRectifyCount() {
            return Object.keys(this.itemRecords).filter(id => this.itemRecords[id].result === 'rectify').length
        },
        progressPercent() {
            if (this.totalCount === 0) return 0
            return Math.round((this.checkedCount / this.totalCount) * 100)
        },
        draftKey() {
            return LOCAL_DRAFT_PREFIX + this.taskId
        },
        requiredUnchecked() {
            return this.checkItems.filter(item => {
                return item.required && !this.getItemResult(item.id)
            })
        }
    },
    onLoad(options) {
        if (options.taskId) {
            this.taskId = options.taskId
            this.initNetworkListener()
            this.checkNetwork()
            this.loadTaskData()
            this.loadLocalDraft()
        }
    },
    onUnload() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer)
        }
        this.removeNetworkListener()
    },
    onHide() {
        this.saveToLocal()
    },
    methods: {
        initNetworkListener() {
            uni.onNetworkStatusChange((res) => {
                this.networkStatus = res.isConnected
                if (this.networkStatus) {
                    this.$store.commit('SET_NETWORK_STATUS', true)
                } else {
                    this.$store.commit('SET_NETWORK_STATUS', false)
                }
            })
        },
        removeNetworkListener() {
            uni.offNetworkStatusChange && uni.offNetworkStatusChange()
        },
        async checkNetwork() {
            try {
                this.networkStatus = await ui.checkNetwork()
                this.$store.commit('SET_NETWORK_STATUS', this.networkStatus)
            } catch (e) {
                this.networkStatus = false
            }
        },
        async loadTaskData() {
            ui.showLoading('加载中...')
            try {
                const res = await api.getTaskDetail(this.taskId)
                ui.hideLoading()
                if (res.code === 200) {
                    this.task = res.data
                    this.checkItems = res.data.checkItems || []
                    this.initItemRecords()
                    this.getLocation()
                    if (this.task.status === 'accepted') {
                        await this.$store.dispatch('startTask', this.taskId)
                    }
                } else {
                    ui.showToast(res.message || '加载失败')
                }
            } catch (e) {
                ui.hideLoading()
                ui.showToast('加载失败')
            }
        },
        initItemRecords() {
            const records = {}
            this.checkItems.forEach(item => {
                if (!this.itemRecords[item.id]) {
                    records[item.id] = {
                        result: '',
                        remark: '',
                        images: [],
                        hazardReported: false
                    }
                } else {
                    records[item.id] = this.itemRecords[item.id]
                }
            })
            this.itemRecords = records
        },
        loadLocalDraft() {
            try {
                const draft = storage.getOfflineData(this.draftKey)
                if (draft && draft.data) {
                    const data = draft.data
                    if (data.itemRecords) {
                        Object.keys(data.itemRecords).forEach(key => {
                            if (this.itemRecords[key]) {
                                this.itemRecords[key] = { ...this.itemRecords[key], ...data.itemRecords[key] }
                            }
                        })
                    }
                    if (data.overallRemark) {
                        this.overallRemark = data.overallRemark
                    }
                    if (data.location) {
                        this.location = data.location
                    }
                    ui.showToast('已恢复本地草稿', 'none')
                }
            } catch (e) {
                console.error('Load draft error:', e)
            }
        },
        saveToLocal() {
            try {
                const data = {
                    itemRecords: this.itemRecords,
                    overallRemark: this.overallRemark,
                    location: this.location,
                    taskId: this.taskId,
                    updatedAt: Date.now()
                }
                storage.setOfflineData(this.draftKey, data)
            } catch (e) {
                console.error('Save draft error:', e)
            }
        },
        scheduleAutoSave() {
            if (this.autoSaveTimer) {
                clearTimeout(this.autoSaveTimer)
            }
            this.autoSaveTimer = setTimeout(() => {
                this.saveToLocal()
            }, 2000)
        },
        async getLocation() {
            if (this.location) return
            this.locating = true
            try {
                const loc = await ui.getLocation()
                this.location = loc
                this.saveToLocal()
            } catch (e) {
                console.error('Get location error:', e)
                ui.showToast('获取位置失败，请检查定位权限', 'none')
            } finally {
                this.locating = false
            }
        },
        async refreshLocation() {
            if (this.locating) return
            this.locating = true
            try {
                const loc = await ui.getLocation()
                this.location = loc
                this.saveToLocal()
                ui.showToast('定位成功', 'success')
            } catch (e) {
                ui.showToast('获取位置失败', 'none')
            } finally {
                this.locating = false
            }
        },
        toggleItem(itemId) {
            if (this.expandedItem === itemId) {
                this.expandedItem = null
            } else {
                this.expandedItem = itemId
            }
        },
        getItemResult(itemId) {
            return this.itemRecords[itemId] ? this.itemRecords[itemId].result : ''
        },
        setItemResult(item, result) {
            if (!this.itemRecords[item.id]) {
                this.$set(this.itemRecords, item.id, {
                    result: '',
                    remark: '',
                    images: [],
                    hazardReported: false
                })
            }
            this.$set(this.itemRecords[item.id], 'result', result)
            if (result === 'pass') {
                this.$set(this.itemRecords[item.id], 'remark', '')
                this.$set(this.itemRecords[item.id], 'images', [])
            }
            this.scheduleAutoSave()
            ui.vibrateShort()
        },
        async addImages(itemId) {
            const currentImages = this.itemRecords[itemId].images || []
            const remaining = 9 - currentImages.length
            if (remaining <= 0) {
                ui.showToast('最多上传9张图片', 'none')
                return
            }
            try {
                const paths = await ui.chooseImage(remaining)
                const newImages = [...currentImages, ...paths]
                this.$set(this.itemRecords[itemId], 'images', newImages)
                this.saveToLocal()
            } catch (e) {
                console.error('Choose image error:', e)
            }
        },
        removeImage(itemId, imgIndex) {
            uni.showModal({
                title: '确认删除',
                content: '确定要删除这张图片吗？',
                success: (res) => {
                    if (res.confirm) {
                        const images = [...this.itemRecords[itemId].images]
                        images.splice(imgIndex, 1)
                        this.$set(this.itemRecords[itemId], 'images', images)
                        this.saveToLocal()
                    }
                }
            })
        },
        previewImage(itemId, imgIndex) {
            const images = this.itemRecords[itemId].images || []
            ui.previewImage(images, images[imgIndex])
        },
        skipHazard(item) {
            this.$set(this.itemRecords[item.id], 'hazardReported', false)
            ui.showToast('已跳过隐患上报', 'none')
        },
        goReportHazard(item) {
            const record = this.itemRecords[item.id]
            const hazardData = {
                taskId: this.taskId,
                taskNo: this.task ? this.task.taskNo : '',
                projectId: this.task ? this.task.projectId : '',
                projectName: this.task ? this.task.projectName : '',
                checkItemId: item.id,
                checkItemName: item.name,
                title: item.name + ' - 检查不通过',
                category: item.category,
                categoryName: item.categoryName,
                level: 'medium',
                levelName: '一般隐患',
                location: this.task ? this.task.area : '',
                description: record.remark || '',
                images: record.images || [],
                latitude: this.location ? this.location.latitude : null,
                longitude: this.location ? this.location.longitude : null
            }
            uni.setStorageSync('pending_hazard', JSON.stringify(hazardData))
            this.$set(this.itemRecords[item.id], 'hazardReported', true)
            this.saveToLocal()
            uni.navigateTo({ url: '/pages/hazard/report?fromInspection=1' })
        },
        async handleSave() {
            this.saveToLocal()
            ui.showToast('已保存到本地草稿', 'success')
        },
        async handleSubmit() {
            if (this.checkedCount === 0) {
                ui.showToast('请至少完成一项检查', 'none')
                return
            }
            if (this.requiredUnchecked.length > 0) {
                const names = this.requiredUnchecked.map(i => i.name).join('、')
                ui.showToast(`必检项未完成：${names}`, 'none')
                return
            }
            const confirm = await ui.showModal('确认提交', '提交后将无法修改，确认提交本次检查记录吗？')
            if (!confirm) return
            this.submitting = true
            this.submittingText = '正在提交...'
            try {
                const records = []
                Object.keys(this.itemRecords).forEach(itemId => {
                    const record = this.itemRecords[itemId]
                    if (record.result) {
                        const item = this.checkItems.find(i => i.id === itemId)
                        records.push({
                            taskId: this.taskId,
                            checkItemId: itemId,
                            checkItemName: item ? item.name : '',
                            result: record.result,
                            remark: record.remark || '',
                            images: record.images || [],
                            location: this.location ? {
                                latitude: this.location.latitude,
                                longitude: this.location.longitude,
                                address: this.location.address || ''
                            } : null,
                            hazardReported: record.hazardReported || false
                        })
                    }
                })
                const submitData = {
                    taskId: this.taskId,
                    records,
                    overallRemark: this.overallRemark,
                    location: this.location,
                    checkTime: new Date().toISOString().replace('T', ' ').substr(0, 19),
                    passCount: this.passCount,
                    failCount: this.failCount,
                    rectifyCount: this.pendingRectifyCount
                }
                const res = await this.$store.dispatch('submitCheckRecord', submitData)
                if (res.code === 200) {
                    await this.$store.dispatch('completeTask', {
                        taskId: this.taskId,
                        result: this.overallRemark || `完成检查，通过${this.passCount}项，不通过${this.failCount}项`
                    })
                    this.submittingText = '提交成功'
                    storage.removeOfflineData(this.draftKey)
                    setTimeout(() => {
                        this.submitting = false
                        uni.showToast({ title: '提交成功', icon: 'success' })
                        setTimeout(() => {
                            uni.navigateBack()
                        }, 1500)
                    }, 500)
                } else {
                    this.submitting = false
                    ui.showToast(res.message || '提交失败', 'none')
                }
            } catch (e) {
                this.submitting = false
                ui.showToast('提交失败，请重试', 'none')
                console.error('Submit error:', e)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.inspection-record {
    min-height: 100vh;
    background: #F5F6FA;
    padding-bottom: 140rpx;
}

.progress-bar-wrap {
    background: #fff;
    padding: 24rpx 32rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
}

.progress-left {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.progress-label {
    font-size: 26rpx;
    color: #666;
}

.progress-count {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
}

.progress-percent {
    font-size: 32rpx;
    font-weight: 700;
    color: #1E88E5;
}

.progress-track {
    height: 12rpx;
    background: #F0F2F5;
    border-radius: 6rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #1E88E5, #42A5F5);
    border-radius: 6rpx;
    transition: width 0.3s ease;
}

.progress-tags {
    display: flex;
    gap: 20rpx;
}

.tag {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 22rpx;
    padding: 6rpx 12rpx;
    border-radius: 8rpx;
}

.tag-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
}

.tag-pass {
    background: #E8F5E9;
    color: #2E7D32;
}
.tag-pass .tag-dot {
    background: #43A047;
}

.tag-fail {
    background: #FFEBEE;
    color: #C62828;
}
.tag-fail .tag-dot {
    background: #E53935;
}

.tag-pending {
    background: #FFF3E0;
    color: #E65100;
}
.tag-pending .tag-dot {
    background: #FB8C00;
}

.content-wrap {
    padding: 0 24rpx;
}

.task-card,
.location-card,
.checklist-card,
.overall-remark-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.header-icon {
    font-size: 32rpx;
}

.header-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
}

.header-count {
    font-size: 24rpx;
    color: #999;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
}

.task-type {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 8rpx;
    background: #E3F2FD;
    color: #1565C0;
    font-weight: 500;
}

.type-special {
    background: #FFEBEE;
    color: #C62828;
}

.type-monthly {
    background: #E8F5E9;
    color: #2E7D32;
}

.network-status {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 20rpx;
    background: #E8F5E9;
    color: #2E7D32;
}

.network-status.offline {
    background: #FFEBEE;
    color: #C62828;
}

.status-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: #43A047;
}

.network-status.offline .status-dot {
    background: #E53935;
}

.task-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
    margin-bottom: 20rpx;
}

.task-info-grid {
    display: flex;
    gap: 24rpx;
}

.info-item {
    flex: 1;
    display: flex;
    align-items: flex-start;
    gap: 10rpx;
}

.info-icon {
    font-size: 28rpx;
    flex-shrink: 0;
    margin-top: 2rpx;
}

.info-content {
    flex: 1;
    min-width: 0;
}

.info-label {
    display: block;
    font-size: 22rpx;
    color: #999;
    margin-bottom: 4rpx;
}

.info-value {
    display: block;
    font-size: 26rpx;
    color: #1a1a1a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 24rpx;
    color: #1E88E5;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    background: #E3F2FD;
}

.refresh-icon {
    font-size: 28rpx;
    transition: transform 0.3s;
}

.refresh-icon.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.location-info {
    padding: 8rpx 0;
}

.location-row {
    display: flex;
    padding: 12rpx 0;
    border-bottom: 1rpx solid #F0F2F5;
}

.location-row:last-child {
    border-bottom: none;
}

.location-label {
    width: 100rpx;
    flex-shrink: 0;
    font-size: 26rpx;
    color: #999;
}

.location-value {
    flex: 1;
    font-size: 26rpx;
    color: #1a1a1a;
    font-family: monospace;
}

.location-address {
    font-family: inherit;
    line-height: 1.5;
}

.location-empty {
    padding: 40rpx;
    text-align: center;
    color: #999;
    font-size: 26rpx;
    background: #F8F9FC;
    border-radius: 12rpx;
}

.check-item-card {
    border: 2rpx solid #F0F2F5;
    border-radius: 16rpx;
    margin-bottom: 16rpx;
    overflow: hidden;
    transition: all 0.3s;
}

.check-item-card.expanded {
    border-color: #1E88E5;
    box-shadow: 0 4rpx 20rpx rgba(30, 136, 229, 0.1);
}

.check-item-header {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: #FAFBFC;
    gap: 16rpx;
}

.check-item-index {
    width: 48rpx;
    height: 48rpx;
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    color: #fff;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
    flex-shrink: 0;
}

.check-item-main {
    flex: 1;
    min-width: 0;
}

.check-item-name {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 6rpx;
}

.check-item-name text {
    font-size: 28rpx;
    color: #1a1a1a;
    font-weight: 500;
}

.required-badge {
    font-size: 18rpx;
    padding: 2rpx 8rpx;
    background: #FFEBEE;
    color: #C62828;
    border-radius: 4rpx;
    flex-shrink: 0;
}

.check-item-category {
    display: flex;
}

.category-tag {
    font-size: 20rpx;
    padding: 4rpx 10rpx;
    background: #F0F2F5;
    color: #666;
    border-radius: 6rpx;
}

.check-item-result {
    flex-shrink: 0;
}

.result-badge {
    font-size: 22rpx;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    font-weight: 500;
}

.result-pass {
    background: #E8F5E9;
    color: #2E7D32;
}

.result-fail {
    background: #FFEBEE;
    color: #C62828;
}

.result-rectify {
    background: #FFF3E0;
    color: #E65100;
}

.result-none {
    background: #F5F5F5;
    color: #999;
}

.check-item-detail {
    padding: 20rpx;
    background: #fff;
    border-top: 2rpx solid #F0F2F5;
}

.action-buttons {
    display: flex;
    gap: 16rpx;
    margin-bottom: 24rpx;
}

.action-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20rpx 16rpx;
    border-radius: 12rpx;
    background: #F8F9FC;
    border: 2rpx solid #F0F2F5;
    transition: all 0.2s;
}

.action-btn.active {
    border-color: #1E88E5;
    background: #E3F2FD;
}

.action-btn:active {
    transform: scale(0.96);
}

.action-icon {
    font-size: 36rpx;
    margin-bottom: 6rpx;
}

.action-btn text {
    font-size: 24rpx;
    color: #666;
}

.action-pass .action-icon {
    color: #43A047;
}
.action-pass.active {
    border-color: #43A047;
    background: #E8F5E9;
}
.action-pass.active text {
    color: #2E7D32;
}

.action-fail .action-icon {
    color: #E53935;
}
.action-fail.active {
    border-color: #E53935;
    background: #FFEBEE;
}
.action-fail.active text {
    color: #C62828;
}

.action-rectify .action-icon {
    color: #FB8C00;
}
.action-rectify.active {
    border-color: #FB8C00;
    background: #FFF3E0;
}
.action-rectify.active text {
    color: #E65100;
}

.detail-section {
    padding-top: 8rpx;
}

.section-title {
    font-size: 26rpx;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
}

.section-title::before {
    content: '';
    display: inline-block;
    width: 6rpx;
    height: 24rpx;
    background: #1E88E5;
    border-radius: 3rpx;
    margin-right: 10rpx;
}

.img-count {
    font-size: 22rpx;
    color: #999;
    font-weight: 400;
    margin-left: 8rpx;
}

.remark-input {
    width: 100%;
    min-height: 160rpx;
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 26rpx;
    color: #1a1a1a;
    line-height: 1.6;
    box-sizing: border-box;
}

.remark-counter {
    text-align: right;
    font-size: 22rpx;
    color: #999;
    margin-top: 8rpx;
    margin-bottom: 20rpx;
}

.image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 20rpx;
}

.image-item {
    width: calc((100% - 32rpx) / 3);
    height: 200rpx;
    position: relative;
    border-radius: 12rpx;
    overflow: hidden;
    background: #F0F2F5;
}

.image-item image {
    width: 100%;
    height: 100%;
}

.image-remove {
    position: absolute;
    top: 4rpx;
    right: 4rpx;
    width: 40rpx;
    height: 40rpx;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    line-height: 1;
}

.image-add {
    width: calc((100% - 32rpx) / 3);
    height: 200rpx;
    border: 2rpx dashed #CCC;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #FAFBFC;
}

.add-icon {
    font-size: 48rpx;
    color: #CCC;
    line-height: 1;
    margin-bottom: 8rpx;
}

.add-text {
    font-size: 22rpx;
    color: #999;
}

.hazard-action-wrap {
    margin-top: 20rpx;
    padding: 20rpx;
    background: linear-gradient(135deg, #FFF3E0, #FFEBEE);
    border-radius: 12rpx;
}

.hazard-hint {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;
}

.hint-icon {
    font-size: 28rpx;
}

.hint-text {
    font-size: 24rpx;
    color: #E65100;
}

.hazard-btns {
    display: flex;
    gap: 16rpx;
}

.hazard-btn {
    flex: 1;
    height: 72rpx;
    line-height: 72rpx;
    border-radius: 12rpx;
    font-size: 26rpx;
    border: none;
    padding: 0;
}

.hazard-btn::after {
    border: none;
}

.hazard-btn-outline {
    background: #fff;
    color: #666;
    border: 2rpx solid #DDD;
}

.hazard-btn-primary {
    background: linear-gradient(135deg, #E53935, #C62828);
    color: #fff;
}

.empty-state {
    padding: 80rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.empty-icon {
    font-size: 80rpx;
    margin-bottom: 16rpx;
    opacity: 0.5;
}

.empty-text {
    font-size: 26rpx;
    color: #999;
}

.overall-input {
    width: 100%;
    min-height: 200rpx;
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 26rpx;
    color: #1a1a1a;
    line-height: 1.6;
    box-sizing: border-box;
}

.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 24rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
    z-index: 100;
}

.summary-info {
    font-size: 24rpx;
    color: #666;
}

.danger-text {
    color: #E53935;
    font-weight: 500;
}

.action-wrap {
    display: flex;
    gap: 16rpx;
}

.bottom-btn {
    height: 80rpx;
    line-height: 80rpx;
    padding: 0 40rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    font-weight: 500;
    border: none;
}

.bottom-btn::after {
    border: none;
}

.btn-save {
    background: #F0F2F5;
    color: #666;
}

.btn-submit {
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    color: #fff;
}

.loading-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.loading-box {
    background: #fff;
    border-radius: 20rpx;
    padding: 48rpx 64rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.loading-spinner {
    width: 64rpx;
    height: 64rpx;
    border: 6rpx solid #E3F2FD;
    border-top-color: #1E88E5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 20rpx;
}

.loading-text {
    font-size: 28rpx;
    color: #333;
}
</style>
