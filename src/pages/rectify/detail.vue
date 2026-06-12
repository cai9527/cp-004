<template>
    <view class="rectify-detail-page">
        <scroll-view class="detail-scroll" scroll-y v-if="hazard">
            <view class="header-card" :class="{ overdue: isOverdue }">
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
                    <view v-if="hazard._offline" class="offline-tag">待同步</view>
                </view>
                <view v-if="isOverdue" class="overdue-warning">
                    <text class="warning-icon">⚠️</text>
                    <text class="warning-text">该隐患已逾期 {{ getOverdueDays() }} 天，请尽快处理</text>
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
                        <text class="info-value" :class="{ danger: isOverdue }">
                            {{ hazard.rectifyDeadline || '未设置' }}
                        </text>
                    </view>
                    <view v-if="remainingDays !== null" class="info-row highlight-row">
                        <text class="info-label">剩余天数</text>
                        <text class="info-value" :class="getRemainingClass()">
                            {{ getRemainingText() }}
                        </text>
                    </view>
                </view>
            </view>

            <view class="info-card">
                <view class="card-title">隐患描述</view>
                <text class="desc-text">{{ hazard.description || '暂无详细描述' }}</text>
                <view v-if="hazard.images && hazard.images.length > 0" class="image-section">
                    <view class="image-label">隐患图片</view>
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

            <view v-if="canAssign || hazard.rectifierName" class="info-card">
                <view class="card-title">整改信息</view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">整改人员</text>
                        <text class="info-value">{{ hazard.rectifierName || '待指派' }}</text>
                    </view>
                    <view v-if="hazard.rectifySuggestion" class="info-row info-row-desc">
                        <text class="info-label">整改建议</text>
                        <text class="info-value info-desc">{{ hazard.rectifySuggestion }}</text>
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

            <view v-if="canReview || hazard.reviewerName" class="info-card">
                <view class="card-title">复查信息</view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">复查人员</text>
                        <text class="info-value">{{ hazard.reviewerName || '待复查' }}</text>
                    </view>
                    <view v-if="hazard.reviewResult" class="info-row">
                        <text class="info-label">复查结果</text>
                        <text class="info-value" :class="hazard.reviewResult === 'pass' ? 'text-success' : 'text-danger'">
                            {{ getReviewResultText(hazard.reviewResult) }}
                        </text>
                    </view>
                    <view v-if="hazard.reviewRemark" class="info-row info-row-desc">
                        <text class="info-label">复查备注</text>
                        <text class="info-value info-desc">{{ hazard.reviewRemark }}</text>
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
                            <text class="timeline-user" v-if="hazard.rectifyDeadline">
                                整改期限：{{ hazard.rectifyDeadline }}
                            </text>
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
                            <text class="timeline-title">
                                {{ hazard.reviewResult === 'pass' ? '复查通过' : '复查不通过' }}
                            </text>
                            <text class="timeline-time">{{ hazard.reviewTime }}</text>
                            <text class="timeline-user">复查人：{{ hazard.reviewerName }}</text>
                        </view>
                    </view>
                    <view v-if="hazard.closeTime" class="timeline-item timeline-active">
                        <view class="timeline-dot dot-success"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">隐患已闭环</text>
                            <text class="timeline-time">{{ hazard.closeTime }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <view class="bottom-space"></view>
        </scroll-view>

        <ActionButtonBar
            v-if="hazard && canAssign"
            :buttons="[{ text: '指派整改', type: 'primary', onClick: showAssignModal }]"
            variant="fixed"
            :safe-area="true"
        />
        <ActionButtonBar
            v-else-if="hazard && canSubmitRectify"
            :buttons="[{ text: '提交整改', type: 'primary', onClick: showRectifyModal }]"
            variant="fixed"
            :safe-area="true"
        />
        <ActionButtonBar
            v-else-if="hazard && canReview"
            :buttons="[
                { text: '复查通过', type: 'success', onClick: reviewPass },
                { text: '复查不通过', type: 'danger', onClick: reviewReject }
            ]"
            variant="fixed"
            :safe-area="true"
            layout="equal"
        />
        <ActionButtonBar
            v-else-if="hazard"
            :buttons="[{ text: getStatusTip(), type: 'default', disabled: true }]"
            variant="fixed"
            :safe-area="true"
        />

        <view class="modal-mask" v-if="showAssign" @tap="closeAssignModal">
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">指派整改</text>
                    <text class="modal-close" @tap="closeAssignModal">×</text>
                </view>
                <view class="modal-body">
                    <view class="form-group">
                        <text class="form-label">选择整改人</text>
                        <picker 
                            mode="selector" 
                            :range="userList" 
                            range-key="name"
                            @change="onRectifierChange"
                        >
                            <view class="picker-view">
                                <text :class="{ placeholder: !assignForm.rectifierId }">
                                    {{ selectedRectifierName || '请选择整改人' }}
                                </text>
                                <text class="picker-arrow">›</text>
                            </view>
                        </picker>
                    </view>
                    <view class="form-group">
                        <text class="form-label">整改期限</text>
                        <picker 
                            mode="date" 
                            :value="assignForm.deadline" 
                            :start="todayStr"
                            @change="onDeadlineChange"
                        >
                            <view class="picker-view">
                                <text :class="{ placeholder: !assignForm.deadline }">
                                    {{ assignForm.deadline || '请选择整改期限' }}
                                </text>
                                <text class="picker-arrow">›</text>
                            </view>
                        </picker>
                    </view>
                </view>
                <ActionButtonBar
                    :buttons="[
                        { text: '取消', type: 'cancel', onClick: closeAssignModal },
                        { text: '确认指派', type: 'primary', onClick: confirmAssign }
                    ]"
                    variant="modal"
                />
            </view>
        </view>

        <view class="modal-mask" v-if="showRectify" @tap="closeRectifyModal">
            <view class="modal-content modal-large" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">提交整改</text>
                    <text class="modal-close" @tap="closeRectifyModal">×</text>
                </view>
                <view class="modal-body">
                    <view class="form-group">
                        <text class="form-label">整改说明</text>
                        <textarea 
                            class="form-textarea" 
                            v-model="rectifyForm.desc" 
                            placeholder="请详细描述整改措施和结果"
                            placeholder-class="textarea-placeholder"
                            maxlength="500"
                            auto-height
                        />
                        <text class="char-count">{{ rectifyForm.desc.length }}/500</text>
                    </view>
                    <view class="form-group">
                        <text class="form-label">整改后照片</text>
                        <view class="images-grid">
                            <view 
                                v-for="(img, index) in rectifyForm.images" 
                                :key="index"
                                class="image-item"
                            >
                                <image 
                                    class="preview-image" 
                                    :src="img" 
                                    mode="aspectFill"
                                    @tap="previewRectifyImage(index)"
                                />
                                <view class="remove-btn" @tap="removeRectifyImage(index)">
                                    <text class="remove-icon">×</text>
                                </view>
                            </view>
                            <view 
                                v-if="rectifyForm.images.length < 9" 
                                class="add-image-btn"
                                @tap="chooseRectifyImages"
                            >
                                <text class="add-icon">+</text>
                                <text class="add-text">添加图片</text>
                            </view>
                        </view>
                    </view>
                </view>
                <ActionButtonBar
                    :buttons="[
                        { text: '取消', type: 'cancel', onClick: closeRectifyModal },
                        { text: '提交整改', type: 'primary', onClick: confirmRectify }
                    ]"
                    variant="modal"
                />
            </view>
        </view>

        <view class="modal-mask" v-if="showReviewRemark" @tap="closeReviewModal">
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">复查不通过</text>
                    <text class="modal-close" @tap="closeReviewModal">×</text>
                </view>
                <view class="modal-body">
                    <view class="form-group">
                        <text class="form-label">不通过原因</text>
                        <textarea 
                            class="form-textarea" 
                            v-model="reviewForm.remark" 
                            placeholder="请详细说明不通过的原因和整改要求"
                            placeholder-class="textarea-placeholder"
                            maxlength="200"
                            auto-height
                        />
                    </view>
                </view>
                <ActionButtonBar
                    :buttons="[
                        { text: '取消', type: 'cancel', onClick: closeReviewModal },
                        { text: '确认提交', type: 'primary', onClick: confirmReviewReject }
                    ]"
                    variant="modal"
                />
            </view>
        </view>
    </view>
</template>

<script>
import { getTodayStr, getDaysBetween } from '../../utils/date.js'
import { 
    showToast, showLoading, hideLoading, showModal,
    chooseImage, previewImage 
} from '../../utils/ui.js'
import { mockUsers } from '../../mock/index.js'

export default {
    data() {
        return {
            hazardId: '',
            hazard: null,
            loading: false,
            showAssign: false,
            showRectify: false,
            showReviewRemark: false,
            assignForm: {
                rectifierId: '',
                rectifierName: '',
                deadline: ''
            },
            rectifyForm: {
                desc: '',
                images: []
            },
            reviewForm: {
                remark: ''
            }
        }
    },
    computed: {
        currentUser() {
            return this.$store.state.user || {}
        },
        userList() {
            return mockUsers.filter(u => u.role === 'worker')
        },
        selectedRectifierName() {
            if (!this.assignForm.rectifierId) return ''
            const u = this.userList.find(u => u.id === this.assignForm.rectifierId)
            return u ? u.name : ''
        },
        todayStr() {
            return getTodayStr()
        },
        isOverdue() {
            if (!this.hazard || !this.hazard.rectifyDeadline) return false
            if (this.hazard.status === 'closed' || this.hazard.status === 'cancelled') return false
            return getDaysBetween(this.todayStr, this.hazard.rectifyDeadline) < 0
        },
        remainingDays() {
            if (!this.hazard || !this.hazard.rectifyDeadline) return null
            return getDaysBetween(this.todayStr, this.hazard.rectifyDeadline)
        },
        userRole() {
            return this.currentUser.role || ''
        },
        canAssign() {
            if (!this.hazard) return false
            return this.hazard.status === 'reported' && 
                   (this.userRole === 'admin' || this.userRole === 'inspector')
        },
        canSubmitRectify() {
            if (!this.hazard) return false
            return (this.hazard.status === 'assigned' || this.hazard.status === 'rectifying') &&
                   this.hazard.rectifierId === this.currentUser.id
        },
        canReview() {
            if (!this.hazard) return false
            return this.hazard.status === 'review' &&
                   (this.userRole === 'admin' || this.userRole === 'inspector')
        }
    },
    onLoad(options) {
        this.hazardId = options.id
        this.loadHazardDetail()
    },
    onShow() {
        if (this.hazardId) {
            this.loadHazardDetail()
        }
    },
    methods: {
        async loadHazardDetail() {
            this.loading = true
            try {
                this.hazard = this.$store.getters.getHazardById(this.hazardId)
                if (!this.hazard) {
                    const res = await this.$store.dispatch('loadHazards', {})
                    if (res.code === 200) {
                        this.hazard = this.$store.getters.getHazardById(this.hazardId)
                    }
                }
            } catch (e) {
                console.error(e)
                showToast('加载失败')
            } finally {
                this.loading = false
            }
        },

        getStatusText(status) {
            const map = {
                reported: '已上报',
                assigned: '待整改',
                rectifying: '整改中',
                review: '待复查',
                closed: '已闭环',
                cancelled: '已取消'
            }
            return map[status] || status
        },

        getReviewResultText(result) {
            if (result === 'pass') return '通过'
            if (result === 'reject') return '不通过'
            return '待复查'
        },

        getOverdueDays() {
            if (!this.hazard || !this.hazard.rectifyDeadline) return 0
            return Math.abs(getDaysBetween(this.todayStr, this.hazard.rectifyDeadline))
        },

        getRemainingText() {
            if (this.remainingDays === null) return ''
            if (this.remainingDays < 0) {
                return `已逾期 ${Math.abs(this.remainingDays)} 天`
            }
            if (this.remainingDays === 0) {
                return '今天到期'
            }
            return `还剩 ${this.remainingDays} 天`
        },

        getRemainingClass() {
            if (this.remainingDays === null) return ''
            if (this.remainingDays < 0) return 'text-danger'
            if (this.remainingDays <= 1) return 'text-warning'
            return 'text-success'
        },

        getStatusTip() {
            if (!this.hazard) return ''
            const status = this.hazard.status
            if (status === 'closed') return '已闭环，无需操作'
            if (status === 'cancelled') return '已取消'
            if (status === 'review') return '待复查人员处理'
            if (status === 'assigned' || status === 'rectifying') {
                return this.hazard.rectifierId === this.currentUser.id 
                    ? '等待您提交整改' 
                    : '等待整改人处理'
            }
            if (status === 'reported') return '等待管理人员指派'
            return ''
        },

        previewImage(urls, index) {
            previewImage(urls, urls[index])
        },

        showAssignModal() {
            this.assignForm = {
                rectifierId: '',
                rectifierName: '',
                deadline: ''
            }
            this.showAssign = true
        },

        closeAssignModal() {
            this.showAssign = false
        },

        onRectifierChange(e) {
            const user = this.userList[e.detail.value]
            if (user) {
                this.assignForm.rectifierId = user.id
                this.assignForm.rectifierName = user.name
            }
        },

        onDeadlineChange(e) {
            this.assignForm.deadline = e.detail.value
        },

        async confirmAssign() {
            if (!this.assignForm.rectifierId) {
                showToast('请选择整改人')
                return
            }
            if (!this.assignForm.deadline) {
                showToast('请选择整改期限')
                return
            }

            showLoading('正在指派...')
            try {
                const res = await this.$store.dispatch('assignRectification', {
                    hazardId: this.hazardId,
                    rectifierId: this.assignForm.rectifierId,
                    rectifierName: this.assignForm.rectifierName,
                    deadline: this.assignForm.deadline
                })
                hideLoading()

                if (res.code === 200) {
                    this.hazard = res.data
                    this.showAssign = false
                    showToast('指派成功', 'success')
                } else {
                    showToast(res.message || '指派失败')
                }
            } catch (e) {
                hideLoading()
                console.error(e)
                showToast('指派失败，请重试')
            }
        },

        showRectifyModal() {
            this.rectifyForm = {
                desc: '',
                images: []
            }
            this.showRectify = true
        },

        closeRectifyModal() {
            this.showRectify = false
        },

        async chooseRectifyImages() {
            const remaining = 9 - this.rectifyForm.images.length
            if (remaining <= 0) {
                showToast('最多只能上传9张图片')
                return
            }
            try {
                const paths = await chooseImage(remaining)
                this.rectifyForm.images = [...this.rectifyForm.images, ...paths]
            } catch (e) {
                console.error(e)
            }
        },

        removeRectifyImage(index) {
            this.rectifyForm.images.splice(index, 1)
        },

        previewRectifyImage(index) {
            previewImage(this.rectifyForm.images, this.rectifyForm.images[index])
        },

        async confirmRectify() {
            if (!this.rectifyForm.desc.trim()) {
                showToast('请填写整改说明')
                return
            }
            if (this.rectifyForm.images.length === 0) {
                showToast('请上传整改后照片')
                return
            }

            showLoading('正在提交...')
            try {
                const res = await this.$store.dispatch('submitRectification', {
                    hazardId: this.hazardId,
                    desc: this.rectifyForm.desc,
                    images: this.rectifyForm.images
                })
                hideLoading()

                if (res.code === 200) {
                    this.hazard = this.$store.getters.getHazardById(this.hazardId)
                    this.showRectify = false
                    uni.showToast({
                        title: res.message || '提交成功',
                        icon: 'success',
                        duration: 2000
                    })
                } else {
                    showToast(res.message || '提交失败')
                }
            } catch (e) {
                hideLoading()
                console.error(e)
                showToast('提交失败，请重试')
            }
        },

        async reviewPass() {
            const confirmed = await showModal(
                '确认通过',
                '确认该隐患整改合格，予以通过？',
                { confirmText: '确认通过' }
            )
            if (!confirmed) return

            showLoading('正在提交...')
            try {
                const res = await this.$store.dispatch('reviewHazard', {
                    hazardId: this.hazardId,
                    result: 'pass',
                    remark: ''
                })
                hideLoading()

                if (res.code === 200) {
                    this.hazard = res.data
                    showToast('复查通过，隐患已闭环', 'success')
                } else {
                    showToast(res.message || '操作失败')
                }
            } catch (e) {
                hideLoading()
                console.error(e)
                showToast('操作失败，请重试')
            }
        },

        reviewReject() {
            this.reviewForm.remark = ''
            this.showReviewRemark = true
        },

        closeReviewModal() {
            this.showReviewRemark = false
        },

        async confirmReviewReject() {
            if (!this.reviewForm.remark.trim()) {
                showToast('请填写不通过原因')
                return
            }

            showLoading('正在提交...')
            try {
                const res = await this.$store.dispatch('reviewHazard', {
                    hazardId: this.hazardId,
                    result: 'reject',
                    remark: this.reviewForm.remark
                })
                hideLoading()

                if (res.code === 200) {
                    this.hazard = res.data
                    this.showReviewRemark = false
                    showToast('已提交，需重新整改', 'success')
                } else {
                    showToast(res.message || '操作失败')
                }
            } catch (e) {
                hideLoading()
                console.error(e)
                showToast('操作失败，请重试')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.rectify-detail-page {
    min-height: 100vh;
    background: #F5F6FA;
    display: flex;
    flex-direction: column;
}

.detail-scroll {
    flex: 1;
    height: 0;
}

.header-card {
    background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
    margin: 24rpx;
    padding: 32rpx;
    border-radius: 20rpx;
    color: #fff;
    position: relative;
    overflow: hidden;
}

.header-card.overdue {
    background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
}

.hazard-level {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.2);
}

.hazard-status {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.2);
}

.hazard-title {
    font-size: 34rpx;
    font-weight: 700;
    line-height: 1.4;
    display: block;
    margin-bottom: 12rpx;
}

.hazard-meta {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex-wrap: wrap;
}

.hazard-no {
    font-size: 24rpx;
    opacity: 0.8;
}

.overdue-tag,
.offline-tag {
    font-size: 20rpx;
    padding: 4rpx 10rpx;
    border-radius: 4rpx;
    background: rgba(255, 255, 255, 0.25);
}

.overdue-warning {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
    padding: 16rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12rpx;
}

.warning-icon {
    font-size: 28rpx;
    margin-right: 10rpx;
}

.warning-text {
    font-size: 24rpx;
    flex: 1;
}

.info-card {
    background: #fff;
    margin: 0 24rpx 24rpx;
    padding: 24rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.card-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #F5F6FA;
    display: flex;
    align-items: center;
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
    padding: 16rpx 0;
    border-bottom: 2rpx solid #F8F9FC;
}

.info-row:last-child {
    border-bottom: none;
}

.info-row-desc {
    flex-direction: column;
    align-items: flex-start;
}

.highlight-row {
    background: #F8F9FC;
    margin: 12rpx -16rpx;
    padding: 16rpx;
    border-radius: 12rpx;
}

.info-label {
    width: 160rpx;
    font-size: 26rpx;
    color: #999;
    flex-shrink: 0;
}

.info-row-desc .info-label {
    width: 100%;
    margin-bottom: 8rpx;
}

.info-value {
    flex: 1;
    font-size: 26rpx;
    color: #333;
    text-align: right;
}

.info-row-desc .info-value {
    text-align: left;
    line-height: 1.6;
}

.info-value.placeholder {
    color: #B0B8C4;
}

.info-value.danger {
    color: #E53935;
}

.text-success {
    color: #43A047;
}

.text-warning {
    color: #FB8C00;
}

.text-danger {
    color: #E53935;
}

.desc-text {
    font-size: 26rpx;
    color: #333;
    line-height: 1.6;
}

.image-section {
    margin-top: 20rpx;
}

.image-label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 12rpx;
}

.image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
}

.image-item {
    width: calc((100% - 24rpx) / 3);
    aspect-ratio: 1;
    border-radius: 12rpx;
    overflow: hidden;
    position: relative;
    background: #F5F6FA;
}

.image-thumb {
    width: 100%;
    height: 100%;
}

.remove-btn {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 40rpx;
    height: 40rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-icon {
    color: #fff;
    font-size: 28rpx;
    line-height: 1;
    font-weight: 300;
}

.timeline {
    position: relative;
    padding-left: 40rpx;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 14rpx;
    top: 8rpx;
    bottom: 8rpx;
    width: 2rpx;
    background: #E0E0E0;
}

.timeline-item {
    position: relative;
    padding-bottom: 32rpx;
}

.timeline-item:last-child {
    padding-bottom: 0;
}

.timeline-dot {
    position: absolute;
    left: -33rpx;
    top: 8rpx;
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #BDBDBD;
    border: 4rpx solid #fff;
    box-shadow: 0 0 0 2rpx #E0E0E0;
}

.timeline-item.timeline-active .timeline-dot {
    background: #1E88E5;
    box-shadow: 0 0 0 2rpx #1E88E5;
}

.timeline-dot.dot-success {
    background: #43A047;
    box-shadow: 0 0 0 2rpx #43A047;
}

.timeline-dot.dot-danger {
    background: #E53935;
    box-shadow: 0 0 0 2rpx #E53935;
}

.timeline-content {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}

.timeline-title {
    font-size: 26rpx;
    font-weight: 600;
    color: #333;
}

.timeline-time {
    font-size: 24rpx;
    color: #999;
}

.timeline-user {
    font-size: 24rpx;
    color: #666;
}

.footer-bar {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 24rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 2rpx solid #F0F2F5;
}

.btn-primary,
.btn-success,
.btn-danger,
.btn-disabled,
.btn-cancel,
.btn-confirm {
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

.btn-primary {
    background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(30, 136, 229, 0.3);
}

.btn-success {
    background: linear-gradient(135deg, #43A047 0%, #2E7D32 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(67, 160, 71, 0.3);
}

.btn-danger {
    background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(229, 57, 53, 0.3);
}

.btn-disabled {
    background: #E0E0E0;
    color: #999;
}

.btn-primary::after,
.btn-success::after,
.btn-danger::after,
.btn-disabled::after,
.btn-cancel::after,
.btn-confirm::after {
    border: none;
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
    z-index: 1000;
    padding: 40rpx;
}

.modal-content {
    width: 100%;
    max-width: 600rpx;
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
}

.modal-large {
    max-width: 680rpx;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 2rpx solid #F0F2F5;
}

.modal-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
}

.modal-close {
    font-size: 48rpx;
    color: #999;
    line-height: 1;
    font-weight: 300;
}

.modal-body {
    padding: 32rpx;
    flex: 1;
    overflow-y: auto;
}

.form-group {
    margin-bottom: 32rpx;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 16rpx;
}

.picker-view {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    background: #F8F9FC;
    border-radius: 12rpx;
}

.picker-view text {
    font-size: 28rpx;
    color: #333;
}

.picker-view text.placeholder {
    color: #B0B8C4;
}

.picker-arrow {
    font-size: 32rpx;
    color: #CCC;
    font-weight: 300;
}

.form-textarea {
    width: 100%;
    min-height: 180rpx;
    padding: 24rpx;
    background: #F8F9FC;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    box-sizing: border-box;
}

.textarea-placeholder {
    color: #B0B8C4;
}

.char-count {
    display: block;
    text-align: right;
    font-size: 22rpx;
    color: #B0B8C4;
    margin-top: 8rpx;
}

.images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.add-image-btn {
    width: calc((100% - 32rpx) / 3);
    aspect-ratio: 1;
    border-radius: 12rpx;
    border: 2rpx dashed #B0B8C4;
    background: #FAFBFC;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.add-icon {
    font-size: 48rpx;
    color: #B0B8C4;
    line-height: 1;
    font-weight: 300;
}

.add-text {
    font-size: 22rpx;
    color: #B0B8C4;
    margin-top: 8rpx;
}

.modal-footer {
    display: flex;
    gap: 20rpx;
    padding: 24rpx 32rpx;
    border-top: 2rpx solid #F0F2F5;
}

.btn-cancel {
    flex: 1;
    background: #F5F6FA;
    color: #666;
}

.btn-confirm {
    flex: 2;
    background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
    color: #fff;
}

.preview-image {
    width: 100%;
    height: 100%;
}

.bottom-space {
    height: 40rpx;
}
</style>
