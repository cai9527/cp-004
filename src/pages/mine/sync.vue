<template>
    <view class="sync-page">
        <view class="status-card" :class="{ online: networkStatus }">
            <view class="status-icon-wrap">
                <text class="status-icon">{{ networkStatus ? '📶' : '📵' }}</text>
            </view>
            <view class="status-info">
                <text class="status-text">{{ networkStatus ? '网络已连接' : '当前离线' }}</text>
                <text class="status-desc">{{ networkStatus ? '可以正常同步数据' : '数据将暂存本地，联网后自动同步' }}</text>
            </view>
            <switch 
                :checked="networkStatus" 
                @change="onNetworkChange" 
                color="#1E88E5"
            />
        </view>

        <view class="stats-section">
            <view class="stats-card">
                <view class="stat-item">
                    <text class="stat-value stat-blue">{{ pendingCount }}</text>
                    <text class="stat-label">待同步</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value stat-green">{{ syncedCount }}</text>
                    <text class="stat-label">已同步</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value stat-red">{{ failedCount }}</text>
                    <text class="stat-label">同步失败</text>
                </view>
            </view>
        </view>

        <view class="action-section">
            <button 
                class="btn-sync-all" 
                :class="{ disabled: !networkStatus || pendingCount === 0 || syncing }"
                :disabled="!networkStatus || pendingCount === 0 || syncing"
                @tap="syncAll"
            >
                <text v-if="!syncing">一键同步全部</text>
                <text v-else>同步中...</text>
            </button>
            <button 
                class="btn-clear" 
                :class="{ disabled: syncQueue.length === 0 }"
                :disabled="syncQueue.length === 0"
                @tap="clearAll"
            >
                <text>清空全部</text>
            </button>
        </view>

        <view class="list-section">
            <view class="section-header">
                <text class="section-title">同步队列</text>
                <text class="section-count">共 {{ syncQueue.length }} 条</text>
            </view>

            <scroll-view 
                class="queue-scroll" 
                scroll-y 
                :refresher-enabled="true"
                :refresher-triggered="isRefreshing"
                @refresherrefresh="onRefresh"
            >
                <view v-if="syncQueue.length > 0" class="queue-list">
                    <view 
                        v-for="(item, index) in syncQueue" 
                        :key="item.id" 
                        class="queue-item"
                        :class="{ 'item-synced': item.synced, 'item-failed': item.failed }"
                    >
                        <view class="item-icon-wrap" :class="getTypeClass(item.type)">
                            <text class="item-icon">{{ getTypeIcon(item.type) }}</text>
                        </view>
                        <view class="item-content">
                            <view class="item-header">
                                <text class="item-title">{{ getTypeLabel(item.type) }}</text>
                                <view class="item-status" :class="getStatusClass(item)">
                                    <text>{{ getStatusText(item) }}</text>
                                </view>
                            </view>
                            <text class="item-desc">{{ getItemDesc(item) }}</text>
                            <view class="item-meta">
                                <text class="item-time">{{ formatTime(item.createdAt) }}</text>
                                <text v-if="item.retryCount > 0" class="item-retry">
                                    已重试 {{ item.retryCount }} 次
                                </text>
                            </view>
                            <text v-if="item.lastError" class="item-error">{{ item.lastError }}</text>
                        </view>
                        <view class="item-actions">
                            <view 
                                v-if="!item.synced && !syncing" 
                                class="action-btn action-sync"
                                @tap="syncItem(item)"
                            >
                                <text>同步</text>
                            </view>
                            <view 
                                v-if="!syncing" 
                                class="action-btn action-delete"
                                @tap="deleteItem(item)"
                            >
                                <text>删除</text>
                            </view>
                        </view>
                    </view>
                </view>

                <view v-else class="empty-state">
                    <view class="empty-icon">✅</view>
                    <text class="empty-title">暂无同步任务</text>
                    <text class="empty-desc">所有数据已同步完成</text>
                </view>

                <view class="list-bottom-space"></view>
            </scroll-view>
        </view>

        <view class="tip-section">
            <view class="tip-card">
                <text class="tip-icon">💡</text>
                <view class="tip-content">
                    <text class="tip-title">离线使用说明</text>
                    <text class="tip-text">1. 离线时上报的隐患、提交的检查记录会自动暂存本地</text>
                    <text class="tip-text">2. 网络恢复后系统会自动尝试同步，无需手动操作</text>
                    <text class="tip-text">3. 同步失败的数据会保留并在下次自动重试，最多5次</text>
                    <text class="tip-text">4. 请定期检查同步队列，确保数据完整上传</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { showToast, showLoading, hideLoading, showModal } from '../../utils/ui.js'
import { formatDate } from '../../utils/date.js'

export default {
    data() {
        return {
            syncing: false,
            isRefreshing: false
        }
    },
    computed: {
        networkStatus() {
            return this.$store.state.networkStatus
        },
        syncQueue() {
            return [...this.$store.state.syncQueue].sort((a, b) => b.createdAt - a.createdAt)
        },
        pendingCount() {
            return this.syncQueue.filter(i => !i.synced && !i.failed).length
        },
        syncedCount() {
            return this.syncQueue.filter(i => i.synced).length
        },
        failedCount() {
            return this.syncQueue.filter(i => i.failed || (i.retryCount || 0) >= 5).length
        }
    },
    onShow() {
        this.$store.dispatch('autoSyncOfflineData')
    },
    methods: {
        onNetworkChange(e) {
            const isConnected = e.detail.value
            this.$store.commit('SET_NETWORK_STATUS', isConnected)
            showToast(isConnected ? '已切换到在线模式' : '已切换到离线模式', 'none')
            if (isConnected && this.pendingCount > 0) {
                setTimeout(() => {
                    this.syncAll()
                }, 500)
            }
        },

        async syncAll() {
            if (!this.networkStatus) {
                showToast('请先连接网络')
                return
            }
            if (this.pendingCount === 0) {
                showToast('没有待同步的数据')
                return
            }
            if (this.syncing) return

            this.syncing = true
            showLoading('正在同步...')
            try {
                await this.$store.dispatch('autoSyncOfflineData')
                hideLoading()
                showToast('同步完成', 'success')
            } catch (e) {
                hideLoading()
                console.error(e)
                showToast('同步过程中出现错误')
            } finally {
                this.syncing = false
            }
        },

        async syncItem(item) {
            if (item.synced) return
            if (!this.networkStatus) {
                showToast('请先连接网络')
                return
            }

            showLoading('正在同步...')
            try {
                let res
                switch (item.type) {
                    case 'report_hazard':
                        res = await this.$store.dispatch('reportHazard', item.data)
                        break
                    case 'submit_rectification':
                        this.$store.state.networkStatus = true
                        res = await this.$store.dispatch('submitRectification', item.data)
                        break
                    case 'check_record':
                        this.$store.state.networkStatus = true
                        res = await this.$store.dispatch('submitCheckRecord', item.data)
                        break
                    default:
                        res = { code: 200 }
                }

                hideLoading()
                if (res.code === 200) {
                    this.$store.commit('REMOVE_FROM_SYNC_QUEUE', item.id)
                    showToast('同步成功', 'success')
                } else {
                    this.$store.commit('UPDATE_SYNC_ITEM', {
                        id: item.id,
                        updates: { 
                            lastError: res.message,
                            retryCount: (item.retryCount || 0) + 1,
                            failed: (item.retryCount || 0) + 1 >= 5
                        }
                    })
                    showToast(res.message || '同步失败')
                }
            } catch (e) {
                hideLoading()
                console.error(e)
                this.$store.commit('UPDATE_SYNC_ITEM', {
                    id: item.id,
                    updates: { 
                        lastError: e.message || '同步失败',
                        retryCount: (item.retryCount || 0) + 1,
                        failed: (item.retryCount || 0) + 1 >= 5
                    }
                })
                showToast('同步失败')
            }
        },

        async deleteItem(item) {
            const confirmed = await showModal(
                '确认删除',
                '删除后该条数据将无法同步，确定要删除吗？',
                { confirmText: '删除', confirmColor: '#E53935' }
            )
            if (confirmed) {
                this.$store.commit('REMOVE_FROM_SYNC_QUEUE', item.id)
                showToast('已删除', 'success')
            }
        },

        async clearAll() {
            if (this.syncQueue.length === 0) return

            const confirmed = await showModal(
                '确认清空',
                `确定要清空全部 ${this.syncQueue.length} 条同步记录吗？未同步的数据将丢失！`,
                { confirmText: '清空', confirmColor: '#E53935' }
            )
            if (confirmed) {
                this.syncQueue.forEach(item => {
                    this.$store.commit('REMOVE_FROM_SYNC_QUEUE', item.id)
                })
                showToast('已清空', 'success')
            }
        },

        async onRefresh() {
            this.isRefreshing = true
            try {
                if (this.networkStatus && this.pendingCount > 0) {
                    await this.$store.dispatch('autoSyncOfflineData')
                }
            } catch (e) {
                console.error(e)
            } finally {
                this.isRefreshing = false
            }
        },

        getTypeIcon(type) {
            const icons = {
                report_hazard: '⚠️',
                submit_rectification: '🔧',
                check_record: '📋'
            }
            return icons[type] || '📄'
        },

        getTypeLabel(type) {
            const labels = {
                report_hazard: '隐患上报',
                submit_rectification: '整改提交',
                check_record: '检查记录'
            }
            return labels[type] || '其他数据'
        },

        getTypeClass(type) {
            const classes = {
                report_hazard: 'type-hazard',
                submit_rectification: 'type-rectify',
                check_record: 'type-record'
            }
            return classes[type] || 'type-default'
        },

        getItemDesc(item) {
            if (item.type === 'report_hazard' && item.data) {
                return item.data.title || '隐患上报'
            }
            if (item.type === 'submit_rectification' && item.data) {
                return item.data.desc?.substr(0, 30) || '整改提交'
            }
            if (item.type === 'check_record' && item.data) {
                return `任务 ${item.data.taskId || ''}`
            }
            return '离线数据'
        },

        getStatusClass(item) {
            if (item.synced) return 'status-synced'
            if (item.failed || (item.retryCount || 0) >= 5) return 'status-failed'
            return 'status-pending'
        },

        getStatusText(item) {
            if (item.synced) return '已同步'
            if (item.failed || (item.retryCount || 0) >= 5) return '同步失败'
            return '待同步'
        },

        formatTime(timestamp) {
            if (!timestamp) return ''
            return formatDate(new Date(timestamp), 'MM-DD HH:mm')
        }
    }
}
</script>

<style lang="scss" scoped>
.sync-page {
    min-height: 100vh;
    background: #F5F6FA;
}

.status-card {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
    margin: 24rpx;
    padding: 32rpx;
    border-radius: 20rpx;
    color: #fff;
}

.status-card.online {
    background: linear-gradient(135deg, #43A047 0%, #2E7D32 100%);
}

.status-icon-wrap {
    width: 96rpx;
    height: 96rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
}

.status-icon {
    font-size: 48rpx;
}

.status-info {
    flex: 1;
}

.status-text {
    font-size: 32rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 8rpx;
}

.status-desc {
    font-size: 24rpx;
    opacity: 0.9;
}

.stats-section {
    padding: 0 24rpx 24rpx;
}

.stats-card {
    display: flex;
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx 16rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-value {
    font-size: 48rpx;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 8rpx;
}

.stat-blue { color: #1E88E5; }
.stat-green { color: #43A047; }
.stat-red { color: #E53935; }

.stat-label {
    font-size: 24rpx;
    color: #999;
}

.stat-divider {
    width: 2rpx;
    background: #F0F2F5;
    margin: 0 8rpx;
}

.action-section {
    display: flex;
    gap: 20rpx;
    padding: 0 24rpx 24rpx;
}

.btn-sync-all,
.btn-clear {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.btn-sync-all {
    background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(30, 136, 229, 0.3);
}

.btn-sync-all.disabled {
    background: #BDBDBD;
    box-shadow: none;
    color: #fff;
}

.btn-clear {
    background: #fff;
    border: 2rpx solid #E53935;
    color: #E53935;
}

.btn-clear.disabled {
    border-color: #BDBDBD;
    color: #BDBDBD;
}

.btn-sync-all::after,
.btn-clear::after {
    border: none;
}

.list-section {
    padding: 0 24rpx;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 8rpx;
}

.section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
}

.section-count {
    font-size: 24rpx;
    color: #999;
}

.queue-scroll {
    height: calc(100vh - 680rpx);
}

.queue-list {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.queue-item {
    display: flex;
    padding: 24rpx;
    border-bottom: 2rpx solid #F8F9FC;
}

.queue-item:last-child {
    border-bottom: none;
}

.queue-item.item-synced {
    opacity: 0.6;
}

.queue-item.item-failed {
    background: #FFEBEE;
}

.item-icon-wrap {
    width: 72rpx;
    height: 72rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.type-hazard { background: #FFEBEE; }
.type-rectify { background: #FFF3E0; }
.type-record { background: #E3F2FD; }
.type-default { background: #F5F6FA; }

.item-icon {
    font-size: 36rpx;
}

.item-content {
    flex: 1;
    min-width: 0;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
}

.item-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
}

.item-status {
    font-size: 20rpx;
    padding: 4rpx 10rpx;
    border-radius: 6rpx;
    flex-shrink: 0;
    margin-left: 12rpx;
}

.status-pending {
    background: #FFF3E0;
    color: #E65100;
}

.status-synced {
    background: #E8F5E9;
    color: #2E7D32;
}

.status-failed {
    background: #FFEBEE;
    color: #C62828;
}

.item-desc {
    font-size: 26rpx;
    color: #666;
    line-height: 1.4;
    display: block;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.item-meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.item-time {
    font-size: 22rpx;
    color: #999;
}

.item-retry {
    font-size: 22rpx;
    color: #FB8C00;
}

.item-error {
    display: block;
    font-size: 22rpx;
    color: #E53935;
    margin-top: 8rpx;
}

.item-actions {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    margin-left: 16rpx;
    flex-shrink: 0;
}

.action-btn {
    padding: 12rpx 20rpx;
    border-radius: 8rpx;
    font-size: 22rpx;
    text-align: center;
}

.action-sync {
    background: #E3F2FD;
    color: #1565C0;
}

.action-delete {
    background: #FFEBEE;
    color: #C62828;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 48rpx;
    background: #fff;
    border-radius: 20rpx;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
}

.empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 12rpx;
}

.empty-desc {
    font-size: 26rpx;
    color: #999;
}

.tip-section {
    padding: 24rpx;
}

.tip-card {
    display: flex;
    background: #E8F4FD;
    border-radius: 16rpx;
    padding: 24rpx;
    border-left: 6rpx solid #1E88E5;
}

.tip-icon {
    font-size: 36rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
}

.tip-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.tip-title {
    font-size: 26rpx;
    font-weight: 600;
    color: #1565C0;
    margin-bottom: 4rpx;
}

.tip-text {
    font-size: 22rpx;
    color: #1565C0;
    line-height: 1.5;
}

.list-bottom-space {
    height: 40rpx;
}
</style>
