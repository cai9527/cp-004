<template>
    <view class="hazard-detail">
        <view v-if="hazard" class="detail-content">
            <view class="header-card">
                <view class="header-top">
                    <view class="hazard-level" :class="'level-' + hazard.level">
                        {{ hazard.levelName }}
                    </view>
                    <view class="hazard-status" :class="'status-' + hazard.status">
                        {{ getStatusText(hazard.status) }}
                    </view>
                </view>
                <text class="hazard-title">{{ hazard.title }}</text>
                <view class="hazard-meta">
                    <text class="hazard-no">{{ hazard.hazardNo }}</text>
                    <view v-if="isOverdue" class="overdue-tag">已逾期</view>
                </view>
            </view>

            <view class="info-card">
                <view class="card-title">基本信息</view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">所属项目</text>
                        <text class="info-value">{{ hazard.projectName }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">隐患分类</text>
                        <text class="info-value">{{ hazard.categoryName }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">隐患位置</text>
                        <text class="info-value">{{ hazard.location }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">上报人员</text>
                        <text class="info-value">{{ hazard.reporterName }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">上报时间</text>
                        <text class="info-value">{{ hazard.reportTime }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">整改期限</text>
                        <text class="info-value" :class="{ danger: isOverdue }">{{ hazard.rectifyDeadline || '未设置' }}</text>
                    </view>
                </view>
            </view>

            <view class="info-card">
                <view class="card-title">隐患描述</view>
                <text class="desc-text">{{ hazard.description }}</text>
                <view v-if="hazard.images && hazard.images.length > 0" class="image-section">
                    <view class="image-label">现场图片</view>
                    <view class="image-grid">
                        <view 
                            v-for="(img, idx) in hazard.images" 
                            :key="idx" 
                            class="image-item"
                            @tap="previewImage(hazard.images, idx)"
                        >
                            <image :src="img" mode="aspectFill" class="image-thumb"></image>
                        </view>
                    </view>
                </view>
            </view>

            <view v-if="hazard.rectifierName || ['assigned', 'rectifying', 'review', 'closed', 'rejected'].includes(hazard.status)" class="info-card">
                <view class="card-title">整改信息</view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">整改人员</text>
                        <text class="info-value">{{ hazard.rectifierName || '待指派' }}</text>
                    </view>
                    <view v-if="hazard.rectifyDesc" class="info-row info-row-desc">
                        <text class="info-label">整改说明</text>
                        <text class="info-value info-desc">{{ hazard.rectifyDesc }}</text>
                    </view>
                    <view v-if="hazard.rectifyTime" class="info-row">
                        <text class="info-label">整改时间</text>
                        <text class="info-value">{{ hazard.rectifyTime }}</text>
                    </view>
                </view>
                <view v-if="hazard.rectifyImages && hazard.rectifyImages.length > 0" class="image-section">
                    <view class="image-label">整改后图片</view>
                    <view class="image-grid">
                        <view 
                            v-for="(img, idx) in hazard.rectifyImages" 
                            :key="idx" 
                            class="image-item"
                            @tap="previewImage(hazard.rectifyImages, idx)"
                        >
                            <image :src="img" mode="aspectFill" class="image-thumb"></image>
                        </view>
                    </view>
                </view>
            </view>

            <view v-if="hazard.reviewerName || hazard.reviewResult" class="info-card">
                <view class="card-title">复查信息</view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">复查人员</text>
                        <text class="info-value">{{ hazard.reviewerName || '待复查' }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">复查结果</text>
                        <text class="info-value" :class="hazard.reviewResult === 'pass' ? 'text-success' : 'text-danger'">
                            {{ getReviewResultText(hazard.reviewResult) }}
                        </text>
                    </view>
                    <view v-if="hazard.reviewTime" class="info-row">
                        <text class="info-label">复查时间</text>
                        <text class="info-value">{{ hazard.reviewTime }}</text>
                    </view>
                    <view v-if="hazard.closeTime" class="info-row">
                        <text class="info-label">闭环时间</text>
                        <text class="info-value">{{ hazard.closeTime }}</text>
                    </view>
                </view>
            </view>

            <view class="info-card">
                <view class="card-title">操作时间轴</view>
                <view class="timeline">
                    <view class="timeline-item timeline-active">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">隐患已上报</text>
                            <text class="timeline-time">{{ hazard.reportTime }}</text>
                            <text class="timeline-user">上报人：{{ hazard.reporterName }}</text>
                        </view>
                    </view>
                    <view v-if="hazard.rectifierName" class="timeline-item timeline-active">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">整改已指派</text>
                            <text class="timeline-time">整改人：{{ hazard.rectifierName }}</text>
                            <text class="timeline-user">整改期限：{{ hazard.rectifyDeadline }}</text>
                        </view>
                    </view>
                    <view v-if="hazard.rectifyTime" class="timeline-item timeline-active">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">整改已提交</text>
                            <text class="timeline-time">{{ hazard.rectifyTime }}</text>
                        </view>
                    </view>
                    <view v-if="hazard.reviewTime" class="timeline-item timeline-active">
                        <view class="timeline-dot" :class="hazard.reviewResult === 'pass' ? 'dot-success' : 'dot-danger'"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">复查{{ hazard.reviewResult === 'pass' ? '通过' : '不通过' }}</text>
                            <text class="timeline-time">{{ hazard.reviewTime }}</text>
                            <text class="timeline-user">复查人：{{ hazard.reviewerName }}</text>
                        </view>
                    </view>
                    <view v-if="hazard.status === 'reported'" class="timeline-item">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">待指派整改</text>
                        </view>
                    </view>
                    <view v-if="['assigned', 'rectifying'].includes(hazard.status)" class="timeline-item">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">待整改完成</text>
                        </view>
                    </view>
                    <view v-if="hazard.status === 'review'" class="timeline-item">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">待复查</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="bottom-action-bar">
            <view v-if="showAssignButton" class="action-row">
                <button class="btn btn-warning" @tap="openAssignModal">指派整改</button>
            </view>
            <view v-else-if="showRectifyButton" class="action-row">
                <button class="btn btn-primary" @tap="goRectify">提交整改</button>
            </view>
            <view v-else-if="showReviewButtons" class="action-row two-col">
                <button class="btn btn-danger" @tap="reviewReject">复查不通过</button>
                <button class="btn btn-success ml-16" @tap="reviewPass">复查通过</button>
            </view>
            <view v-else-if="showReRectifyButton" class="action-row">
                <button class="btn btn-warning" @tap="goRectify">重新整改</button>
            </view>
        </view>

        <view v-if="showAssign" class="modal-mask" @tap="closeAssignModal">
            <view class="modal-content" @tap.stop="">
                <view class="modal-title">指派整改</view>
                <view class="modal-body">
                    <view class="input-item">
                        <view class="label">整改人员</view>
                        <picker :range="rectifierList" :range-key="'name'" @change="onRectifierChange">
                            <view class="picker-value">
                                {{ selectedRectifier ? selectedRectifier.name : '请选择整改人员' }}
                            </view>
                        </picker>
                    </view>
                    <view class="input-item">
                        <view class="label">整改期限</view>
                        <picker mode="date" :value="tempDeadline" @change="onDeadlineChange">
                            <view class="picker-value">{{ tempDeadline || '请选择整改期限' }}</view>
                        </picker>
                    </view>
                </view>
                <view class="modal-footer">
                    <button class="btn-modal btn-cancel" @tap="closeAssignModal">取消</button>
                    <button class="btn-modal btn-confirm" @tap="confirmAssign">确认指派</button>
                </view>
            </view>
        </view>

        <view v-if="!hazard && !loading" class="empty-state">
            <text class="empty-icon">⚠️</text>
            <text class="empty-title">隐患不存在</text>
        </view>

        <view v-if="loading" class="loading-state">
            <view class="loading-spinner"></view>
            <text>加载中...</text>
        </view>
    </view>
</template>

<script>
import { getDaysBetween, getTodayStr } from '../../utils/date.js'

export default {
    data() {
        return {
            hazardId: '',
            hazard: null,
            loading: false,
            showAssign: false,
            rectifierList: [],
            selectedRectifier: null,
            tempDeadline: ''
        }
    },
    computed: {
        user() {
            return this.$store.state.user || null
        },
        userRole() {
            return this.user ? this.user.role : ''
        },
        isOverdue() {
            if (!this.hazard || !this.hazard.rectifyDeadline) return false
            if (['closed', 'review'].includes(this.hazard.status)) return false
            return getDaysBetween(getTodayStr(), this.hazard.rectifyDeadline) < 0
        },
        showAssignButton() {
            if (!this.hazard || !this.user) return false
            if (this.userRole !== 'project_manager' && this.userRole !== 'inspector') return false
            return this.hazard.status === 'reported'
        },
        showRectifyButton() {
            if (!this.hazard || !this.user) return false
            if (this.userRole !== 'worker') return false
            return ['assigned', 'rectifying', 'rejected'].includes(this.hazard.status) && this.hazard.rectifierId === this.user.id
        },
        showReviewButtons() {
            if (!this.hazard || !this.user) return false
            if (this.userRole !== 'project_manager' && this.userRole !== 'inspector') return false
            return this.hazard.status === 'review'
        },
        showReRectifyButton() {
            if (!this.hazard || !this.user) return false
            if (this.userRole !== 'worker') return false
            return this.hazard.status === 'rejected' && this.hazard.rectifierId === this.user.id
        }
    },
    onLoad(options) {
        if (options.id) {
            this.hazardId = options.id
            this.loadDetail()
        }
        this.loadRectifiers()
    },
    onShow() {
        if (this.hazardId) {
            this.loadDetail()
        }
    },
    methods: {
        async loadDetail() {
            this.loading = true
            try {
                const api = (await import('../../utils/api.js')).default
                const res = await api.getHazardDetail(this.hazardId)
                if (res.code === 200) {
                    this.hazard = res.data
                } else {
                    uni.showToast({ title: res.message || '加载失败', icon: 'none' })
                }
            } catch (e) {
                uni.showToast({ title: '加载失败', icon: 'none' })
            } finally {
                this.loading = false
            }
        },
        async loadRectifiers() {
            try {
                const { mockUsers } = await import('../../mock/index.js')
                this.rectifierList = mockUsers.filter(u => u.role === 'worker')
            } catch (e) {
                this.rectifierList = [
                    { id: 'u_003', name: '王整改', role: 'worker' }
                ]
            }
        },
        getStatusText(status) {
            const map = {
                reported: '已上报',
                assigned: '已指派',
                rectifying: '整改中',
                review: '待复查',
                closed: '已闭环',
                rejected: '已驳回'
            }
            return map[status] || status
        },
        getReviewResultText(result) {
            const map = { pass: '通过', fail: '不通过' }
            return result ? map[result] : '待复查'
        },
        previewImage(images, current) {
            uni.previewImage({
                urls: images,
                current: current
            })
        },
        openAssignModal() {
            this.showAssign = true
            this.selectedRectifier = null
            this.tempDeadline = ''
        },
        closeAssignModal() {
            this.showAssign = false
        },
        onRectifierChange(e) {
            const idx = e.detail.value
            this.selectedRectifier = this.rectifierList[idx]
        },
        onDeadlineChange(e) {
            this.tempDeadline = e.detail.value
        },
        async confirmAssign() {
            if (!this.selectedRectifier) {
                uni.showToast({ title: '请选择整改人员', icon: 'none' })
                return
            }
            if (!this.tempDeadline) {
                uni.showToast({ title: '请选择整改期限', icon: 'none' })
                return
            }
            uni.showLoading({ title: '提交中...' })
            try {
                const res = await this.$store.dispatch('assignRectification', {
                    hazardId: this.hazardId,
                    rectifierId: this.selectedRectifier.id,
                    rectifierName: this.selectedRectifier.name,
                    deadline: this.tempDeadline
                })
                uni.hideLoading()
                if (res.code === 200) {
                    uni.showToast({ title: '指派成功', icon: 'success' })
                    this.closeAssignModal()
                    this.loadDetail()
                } else {
                    uni.showToast({ title: res.message || '操作失败', icon: 'none' })
                }
            } catch (e) {
                uni.hideLoading()
                uni.showToast({ title: '操作失败', icon: 'none' })
            }
        },
        goRectify() {
            uni.navigateTo({ url: `/pages/rectify/detail?id=${this.hazardId}` })
        },
        reviewPass() {
            uni.showModal({
                title: '确认复查通过',
                content: '确认此隐患整改合格，予以通过并闭环？',
                success: async (res) => {
                    if (res.confirm) {
                        uni.showLoading({ title: '提交中...' })
                        try {
                            const result = await this.$store.dispatch('reviewHazard', {
                                hazardId: this.hazardId,
                                result: 'pass',
                                remark: ''
                            })
                            uni.hideLoading()
                            if (result.code === 200) {
                                uni.showToast({ title: '复查通过', icon: 'success' })
                                this.loadDetail()
                            } else {
                                uni.showToast({ title: result.message || '操作失败', icon: 'none' })
                            }
                        } catch (e) {
                            uni.hideLoading()
                            uni.showToast({ title: '操作失败', icon: 'none' })
                        }
                    }
                }
            })
        },
        reviewReject() {
            uni.showModal({
                title: '确认复查不通过',
                content: '确认此隐患整改不合格，需要重新整改？',
                success: async (res) => {
                    if (res.confirm) {
                        uni.showLoading({ title: '提交中...' })
                        try {
                            const result = await this.$store.dispatch('reviewHazard', {
                                hazardId: this.hazardId,
                                result: 'fail',
                                remark: ''
                            })
                            uni.hideLoading()
                            if (result.code === 200) {
                                uni.showToast({ title: '已驳回重改', icon: 'success' })
                                this.loadDetail()
                            } else {
                                uni.showToast({ title: result.message || '操作失败', icon: 'none' })
                            }
                        } catch (e) {
                            uni.hideLoading()
                            uni.showToast({ title: '操作失败', icon: 'none' })
                        }
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.hazard-detail {
    min-height: 100vh;
    background: #F5F6FA;
    padding-bottom: 200rpx;
}

.detail-content {
    padding: 24rpx;
}

.header-card {
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    border-radius: 24rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    color: #fff;
    position: relative;
    overflow: hidden;
}

.header-card::before {
    content: '';
    position: absolute;
    top: -60rpx;
    right: -60rpx;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
}

.header-card::after {
    content: '';
    position: absolute;
    bottom: -80rpx;
    left: -40rpx;
    width: 160rpx;
    height: 160rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    position: relative;
    z-index: 1;
}

.hazard-level {
    font-size: 22rpx;
    padding: 8rpx 20rpx;
    border-radius: 8rpx;
    font-weight: 600;
}

.level-critical { background: #E53935; color: #fff; }
.level-high { background: #FB8C00; color: #fff; }
.level-medium { background: #FFC107; color: #5D4037; }
.level-low { background: #43A047; color: #fff; }

.hazard-status {
    font-size: 22rpx;
    padding: 8rpx 20rpx;
    border-radius: 8rpx;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.2);
}

.status-reported { background: rgba(255, 193, 7, 0.9); color: #5D4037; }
.status-assigned { background: rgba(33, 150, 243, 0.9); }
.status-rectifying { background: rgba(251, 140, 0, 0.9); }
.status-review { background: rgba(156, 39, 176, 0.9); }
.status-closed { background: rgba(67, 160, 71, 0.9); }
.status-rejected { background: rgba(229, 57, 53, 0.9); }

.hazard-title {
    display: block;
    font-size: 38rpx;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 20rpx;
    position: relative;
    z-index: 1;
}

.hazard-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
}

.hazard-no {
    font-size: 24rpx;
    opacity: 0.85;
}

.overdue-tag {
    font-size: 22rpx;
    padding: 6rpx 16rpx;
    background: #E53935;
    color: #fff;
    border-radius: 6rpx;
    font-weight: 500;
}

.info-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.card-title {
    display: flex;
    align-items: center;
    font-size: 30rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #F5F6FA;
}

.card-title::before {
    content: '';
    display: inline-block;
    width: 6rpx;
    height: 28rpx;
    background: #1E88E5;
    border-radius: 3rpx;
    margin-right: 12rpx;
}

.info-list {
    display: flex;
    flex-direction: column;
}

.info-row {
    display: flex;
    padding: 14rpx 0;
}

.info-row-desc {
    align-items: flex-start;
}

.info-label {
    width: 180rpx;
    flex-shrink: 0;
    font-size: 26rpx;
    color: #999;
}

.info-value {
    flex: 1;
    font-size: 26rpx;
    color: #1a1a1a;
}

.info-value.danger {
    color: #E53935;
    font-weight: 600;
}

.info-desc {
    line-height: 1.6;
}

.text-success {
    color: #43A047;
    font-weight: 600;
}

.text-danger {
    color: #E53935;
    font-weight: 600;
}

.desc-text {
    display: block;
    font-size: 28rpx;
    color: #333;
    line-height: 1.7;
    padding: 8rpx 0;
}

.image-section {
    margin-top: 24rpx;
}

.image-label {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 16rpx;
}

.image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.image-item {
    width: calc((100% - 32rpx) / 3);
    height: 200rpx;
    border-radius: 12rpx;
    overflow: hidden;
    background: #F5F6FA;
}

.image-thumb {
    width: 100%;
    height: 100%;
}

.timeline {
    padding-left: 8rpx;
}

.timeline-item {
    display: flex;
    padding-bottom: 32rpx;
    position: relative;
}

.timeline-item::before {
    content: '';
    position: absolute;
    left: 14rpx;
    top: 36rpx;
    bottom: 0;
    width: 2rpx;
    background: #E0E4E8;
}

.timeline-item:last-child::before {
    display: none;
}

.timeline-item:last-child {
    padding-bottom: 0;
}

.timeline-dot {
    width: 30rpx;
    height: 30rpx;
    border-radius: 50%;
    background: #E0E4E8;
    border: 4rpx solid #F5F6FA;
    box-sizing: border-box;
    margin-right: 20rpx;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
}

.timeline-active .timeline-dot {
    background: #1E88E5;
    box-shadow: 0 0 0 4rpx rgba(30, 136, 229, 0.15);
}

.dot-success {
    background: #43A047 !important;
    box-shadow: 0 0 0 4rpx rgba(67, 160, 71, 0.15) !important;
}

.dot-danger {
    background: #E53935 !important;
    box-shadow: 0 0 0 4rpx rgba(229, 57, 53, 0.15) !important;
}

.timeline-content {
    flex: 1;
    min-width: 0;
}

.timeline-title {
    display: block;
    font-size: 28rpx;
    color: #1a1a1a;
    font-weight: 600;
    margin-bottom: 8rpx;
}

.timeline-item:not(.timeline-active) .timeline-title {
    color: #999;
    font-weight: 500;
}

.timeline-time {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 4rpx;
}

.timeline-user {
    display: block;
    font-size: 24rpx;
    color: #666;
}

.bottom-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx 24rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
    z-index: 100;
}

.action-row {
    display: flex;
}

.action-row.two-col .btn {
    flex: 1;
}

.btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 16rpx;
    font-size: 30rpx;
    font-weight: 600;
    border: none;
    padding: 0;
}

.btn::after {
    border: none;
}

.btn-warning {
    background: linear-gradient(135deg, #FB8C00, #F57C00);
    color: #fff;
}

.btn-primary {
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    color: #fff;
}

.btn-success {
    background: linear-gradient(135deg, #43A047, #2E7D32);
    color: #fff;
}

.btn-danger {
    background: linear-gradient(135deg, #E53935, #C62828);
    color: #fff;
}

.ml-16 {
    margin-left: 16rpx;
}

.modal-mask {
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

.modal-content {
    width: 640rpx;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
}

.modal-title {
    padding: 32rpx;
    text-align: center;
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
    border-bottom: 2rpx solid #F5F6FA;
}

.modal-body {
    padding: 32rpx;
}

.modal-footer {
    display: flex;
    border-top: 2rpx solid #F5F6FA;
}

.btn-modal {
    flex: 1;
    height: 96rpx;
    line-height: 96rpx;
    text-align: center;
    font-size: 30rpx;
    border: none;
    border-radius: 0;
    padding: 0;
}

.btn-modal::after {
    border: none;
}

.btn-cancel {
    background: #fff;
    color: #666;
    border-right: 2rpx solid #F5F6FA;
}

.btn-confirm {
    background: #fff;
    color: #1E88E5;
    font-weight: 600;
}

.input-item {
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 20rpx;
}

.input-item .label {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 10rpx;
}

.picker-value {
    font-size: 28rpx;
    color: #1a1a1a;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
}

.empty-title {
    font-size: 30rpx;
    color: #666;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
    color: #999;
}

.loading-spinner {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid #E3F2FD;
    border-top-color: #1E88E5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 16rpx;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
