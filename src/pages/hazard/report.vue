<template>
    <view class="report-page">
        <scroll-view class="report-scroll" scroll-y>
            <view class="form-section">
                <view class="section-title">
                    <text class="title-text">基本信息</text>
                </view>

                <view class="form-item" @tap="selectProject">
                    <view class="item-label">
                        <text class="required">*</text>
                        <text class="label-text">所属项目</text>
                    </view>
                    <view class="item-content">
                        <text class="item-value" :class="{ placeholder: !formData.projectId }">
                            {{ selectedProjectName || '请选择项目' }}
                        </text>
                        <text class="item-arrow">›</text>
                    </view>
                </view>

                <view class="form-item">
                    <view class="item-label">
                        <text class="required">*</text>
                        <text class="label-text">隐患等级</text>
                    </view>
                    <view class="level-group">
                        <view 
                            v-for="level in levelOptions" 
                            :key="level.value"
                            class="level-item"
                            :class="[
                                'level-' + level.value,
                                { active: formData.level === level.value }
                            ]"
                            @tap="selectLevel(level.value)"
                        >
                            <view class="level-dot"></view>
                            <text class="level-text">{{ level.label }}</text>
                        </view>
                    </view>
                </view>

                <view class="form-item">
                    <view class="item-label">
                        <text class="required">*</text>
                        <text class="label-text">隐患分类</text>
                    </view>
                    <view class="category-group">
                        <view 
                            v-for="cat in categoryOptions" 
                            :key="cat.value"
                            class="category-item"
                            :class="{ active: formData.category === cat.value }"
                            @tap="selectCategory(cat.value)"
                        >
                            <text class="category-icon">{{ cat.icon }}</text>
                            <text class="category-text">{{ cat.label }}</text>
                        </view>
                    </view>
                </view>

                <view class="form-item">
                    <view class="item-label">
                        <text class="required">*</text>
                        <text class="label-text">隐患标题</text>
                    </view>
                    <view class="item-input-wrap">
                        <input 
                            class="item-input" 
                            type="text" 
                            v-model="formData.title" 
                            placeholder="请简要描述隐患内容"
                            placeholder-class="input-placeholder"
                            maxlength="50"
                        />
                        <text class="char-count">{{ formData.title.length }}/50</text>
                    </view>
                </view>

                <view class="form-item column-item">
                    <view class="item-label">
                        <text class="label-text">隐患描述</text>
                    </view>
                    <view class="textarea-wrap">
                        <textarea 
                            class="item-textarea" 
                            v-model="formData.description" 
                            placeholder="请详细描述隐患情况，包括具体位置、问题表现、可能造成的危害等"
                            placeholder-class="input-placeholder"
                            maxlength="500"
                            auto-height
                        />
                        <text class="char-count">{{ formData.description.length }}/500</text>
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="section-title">
                    <text class="title-text">位置信息</text>
                </view>

                <view class="form-item">
                    <view class="item-label">
                        <text class="required">*</text>
                        <text class="label-text">具体位置</text>
                    </view>
                    <view class="item-input-wrap">
                        <input 
                            class="item-input" 
                            type="text" 
                            v-model="formData.location" 
                            placeholder="如：3号楼2层东区脚手架"
                            placeholder-class="input-placeholder"
                            maxlength="100"
                        />
                    </view>
                </view>

                <view class="form-item" @tap="getCurrentLocation">
                    <view class="item-label">
                        <text class="label-text">GPS定位</text>
                    </view>
                    <view class="item-content">
                        <view class="location-info" v-if="locationData.latitude">
                            <text class="location-icon">📍</text>
                            <view class="location-detail">
                                <text class="location-coord">
                                    经度:{{ locationData.longitude ? locationData.longitude.toFixed(6) : '' }} 
                                    纬度:{{ locationData.latitude ? locationData.latitude.toFixed(6) : '' }}
                                </text>
                                <text class="location-address" v-if="locationData.address">
                                    {{ locationData.address }}
                                </text>
                            </view>
                        </view>
                        <text class="item-placeholder" v-else>点击获取当前位置</text>
                        <text class="item-arrow">›</text>
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="section-title">
                    <text class="title-text">拍照取证</text>
                    <text class="title-desc">（最多9张）</text>
                </view>

                <view class="images-grid">
                    <view 
                        v-for="(img, index) in formData.images" 
                        :key="index"
                        class="image-item"
                    >
                        <image 
                            class="preview-image" 
                            :src="img" 
                            mode="aspectFill"
                            @tap="previewImage(index)"
                        />
                        <view class="remove-btn" @tap="removeImage(index)">
                            <text class="remove-icon">×</text>
                        </view>
                    </view>
                    <view 
                        v-if="formData.images.length < 9" 
                        class="add-image-btn"
                        @tap="chooseImages"
                    >
                        <text class="add-icon">+</text>
                        <text class="add-text">添加图片</text>
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="section-title">
                    <text class="title-text">整改要求</text>
                </view>

                <view class="form-item" @tap="selectDeadline">
                    <view class="item-label">
                        <text class="label-text">整改期限</text>
                    </view>
                    <view class="item-content">
                        <text class="item-value" :class="{ placeholder: !formData.rectifyDeadline }">
                            {{ formData.rectifyDeadline || '请选择整改截止日期' }}
                        </text>
                        <text class="item-arrow">›</text>
                    </view>
                </view>

                <view class="form-item column-item">
                    <view class="item-label">
                        <text class="label-text">整改建议</text>
                    </view>
                    <view class="textarea-wrap">
                        <textarea 
                            class="item-textarea" 
                            v-model="formData.rectifySuggestion" 
                            placeholder="请输入整改建议和要求（可选）"
                            placeholder-class="input-placeholder"
                            maxlength="200"
                            auto-height
                        />
                    </view>
                </view>
            </view>

            <view class="offline-tip" v-if="!networkStatus">
                <text class="tip-icon">⚠️</text>
                <text class="tip-text">当前为离线模式，上报内容将暂存本地，联网后自动同步</text>
            </view>

            <view class="bottom-space"></view>
        </scroll-view>

        <ActionButtonBar
            :buttons="[
                { text: '保存草稿', type: 'primary', outline: true, onClick: saveDraft },
                { text: networkStatus ? '立即上报' : '离线暂存', type: 'primary', onClick: handleSubmit, loading: submitting }
            ]"
            variant="sticky"
            :safe-area="true"
        />

        <picker 
            mode="date" 
            :value="formData.rectifyDeadline" 
            :start="todayStr"
            @change="onDeadlineChange"
            style="display: none;"
            ref="deadlinePicker"
        >
        </picker>
    </view>
</template>

<script>
import { getLocation, chooseImage, previewImage, showToast, showLoading, hideLoading, showModal } from '../../utils/ui.js'
import { getTodayStr } from '../../utils/date.js'

export default {
    data() {
        return {
            formData: {
                projectId: '',
                projectName: '',
                level: '',
                levelName: '',
                category: '',
                categoryName: '',
                title: '',
                description: '',
                location: '',
                images: [],
                latitude: null,
                longitude: null,
                address: '',
                rectifyDeadline: '',
                rectifySuggestion: ''
            },
            locationData: {
                latitude: null,
                longitude: null,
                address: ''
            },
            levelOptions: [
                { label: '重大', value: 'critical', icon: '🔴' },
                { label: '较大', value: 'high', icon: '🟠' },
                { label: '一般', value: 'medium', icon: '🟡' },
                { label: '轻微', value: 'low', icon: '🟢' }
            ],
            categoryOptions: [
                { label: '安全防护', value: 'protection', icon: '🛡️' },
                { label: '临时用电', value: 'electric', icon: '⚡' },
                { label: '机械设备', value: 'machine', icon: '⚙️' },
                { label: '消防安全', value: 'fire', icon: '🔥' },
                { label: '文明施工', value: 'civil', icon: '🏗️' },
                { label: '其他', value: 'other', icon: '📋' }
            ],
            submitting: false,
            autoSaveTimer: null
        }
    },
    computed: {
        networkStatus() {
            return this.$store.state.networkStatus
        },
        projects() {
            return this.$store.state.projects || []
        },
        selectedProjectName() {
            if (!this.formData.projectId) return ''
            const p = this.projects.find(p => p.id === this.formData.projectId)
            return p ? p.name : ''
        },
        todayStr() {
            return getTodayStr()
        }
    },
    onLoad(options) {
        if (options.taskId) {
            this.formData.taskId = options.taskId
        }
        if (options.checkItemId) {
            this.formData.checkItemId = options.checkItemId
        }
        if (options.projectId) {
            this.formData.projectId = options.projectId
        }
        this.loadProjects()
        this.loadDraft()
        this.startAutoSave()
    },
    onUnload() {
        this.stopAutoSave()
    },
    methods: {
        async loadProjects() {
            try {
                await this.$store.dispatch('loadProjects')
            } catch (e) {
                console.error(e)
            }
        },

        selectProject() {
            if (this.projects.length === 0) {
                showToast('暂无项目数据')
                return
            }
            const items = this.projects.map(p => p.name)
            uni.showActionSheet({
                itemList: items,
                success: (res) => {
                    const project = this.projects[res.tapIndex]
                    this.formData.projectId = project.id
                    this.formData.projectName = project.name
                }
            })
        },

        selectLevel(level) {
            this.formData.level = level
            const option = this.levelOptions.find(o => o.value === level)
            this.formData.levelName = option ? option.label : ''
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        },

        selectCategory(category) {
            this.formData.category = category
            const option = this.categoryOptions.find(o => o.value === category)
            this.formData.categoryName = option ? option.label : ''
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        },

        selectDeadline() {
            this.$refs.deadlinePicker._show && this.$refs.deadlinePicker._show()
        },

        onDeadlineChange(e) {
            this.formData.rectifyDeadline = e.detail.value
        },

        async getCurrentLocation() {
            try {
                showLoading('获取定位中...')
                const loc = await getLocation()
                this.locationData = loc
                this.formData.latitude = loc.latitude
                this.formData.longitude = loc.longitude
                this.formData.address = loc.address || ''
                hideLoading()
                showToast('定位成功', 'success')
            } catch (e) {
                hideLoading()
                console.error(e)
                showModal('定位失败', '请检查是否开启定位权限，或手动输入位置信息', {
                    showCancel: false
                })
            }
        },

        async chooseImages() {
            const remaining = 9 - this.formData.images.length
            if (remaining <= 0) {
                showToast('最多只能上传9张图片')
                return
            }
            try {
                const paths = await chooseImage(remaining)
                this.formData.images = [...this.formData.images, ...paths]
            } catch (e) {
                console.error(e)
            }
        },

        removeImage(index) {
            this.formData.images.splice(index, 1)
        },

        previewImage(index) {
            previewImage(this.formData.images, this.formData.images[index])
        },

        validateForm() {
            if (!this.formData.projectId) {
                showToast('请选择所属项目')
                return false
            }
            if (!this.formData.level) {
                showToast('请选择隐患等级')
                return false
            }
            if (!this.formData.category) {
                showToast('请选择隐患分类')
                return false
            }
            if (!this.formData.title.trim()) {
                showToast('请输入隐患标题')
                return false
            }
            if (!this.formData.location.trim()) {
                showToast('请输入具体位置')
                return false
            }
            if (this.formData.images.length === 0) {
                showToast('请至少上传一张现场照片')
                return false
            }
            return true
        },

        async handleSubmit() {
            if (!this.validateForm()) return
            if (this.submitting) return

            const confirmed = await showModal(
                '确认上报',
                '请确认隐患信息填写完整准确，上报后将进入整改流程',
                { confirmText: '确认上报' }
            )
            if (!confirmed) return

            this.submitting = true
            showLoading(this.networkStatus ? '正在上报...' : '正在保存...')

            try {
                const submitData = {
                    ...this.formData,
                    projectName: this.selectedProjectName
                }
                const res = await this.$store.dispatch('reportHazard', submitData)
                hideLoading()

                if (res.code === 200) {
                    this.clearDraft()
                    uni.showToast({
                        title: res.message || '上报成功',
                        icon: 'success',
                        duration: 2000
                    })
                    setTimeout(() => {
                        uni.navigateBack()
                    }, 1500)
                } else {
                    showToast(res.message || '上报失败')
                }
            } catch (e) {
                hideLoading()
                console.error(e)
                showToast('上报失败，请重试')
            } finally {
                this.submitting = false
            }
        },

        saveDraft() {
            const draftData = {
                ...this.formData,
                locationData: this.locationData,
                savedAt: Date.now()
            }
            uni.setStorageSync('hazard_draft', JSON.stringify(draftData))
            showToast('草稿已保存', 'success')
        },

        loadDraft() {
            try {
                const draft = uni.getStorageSync('hazard_draft')
                if (draft) {
                    const data = JSON.parse(draft)
                    this.formData = { ...this.formData, ...data }
                    if (data.locationData) {
                        this.locationData = data.locationData
                    }
                }
            } catch (e) {
                console.error('Failed to load draft:', e)
            }
        },

        clearDraft() {
            uni.removeStorageSync('hazard_draft')
            this.stopAutoSave()
        },

        startAutoSave() {
            this.autoSaveTimer = setInterval(() => {
                if (this.formData.title || this.formData.description || this.formData.images.length > 0) {
                    const draftData = {
                        ...this.formData,
                        locationData: this.locationData,
                        savedAt: Date.now()
                    }
                    uni.setStorageSync('hazard_draft', JSON.stringify(draftData))
                }
            }, 30000)
        },

        stopAutoSave() {
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer)
                this.autoSaveTimer = null
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.report-page {
    min-height: 100vh;
    background: #F5F6FA;
    display: flex;
    flex-direction: column;
}

.report-scroll {
    flex: 1;
    height: 0;
}

.form-section {
    background: #fff;
    margin: 24rpx;
    border-radius: 20rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #F5F6FA;
}

.title-text {
    font-size: 30rpx;
    font-weight: 700;
    color: #1a1a1a;
    display: flex;
    align-items: center;
}

.title-text::before {
    content: '';
    display: inline-block;
    width: 6rpx;
    height: 28rpx;
    background: #1E88E5;
    border-radius: 3rpx;
    margin-right: 12rpx;
}

.title-desc {
    font-size: 24rpx;
    color: #999;
    margin-left: 12rpx;
}

.form-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 2rpx solid #F8F9FC;
}

.form-item:last-child {
    border-bottom: none;
}

.column-item {
    flex-direction: column;
    align-items: flex-start;
}

.item-label {
    display: flex;
    align-items: center;
    width: 180rpx;
    flex-shrink: 0;
}

.column-item .item-label {
    width: 100%;
    margin-bottom: 16rpx;
}

.required {
    color: #E53935;
    font-size: 28rpx;
    margin-right: 4rpx;
}

.label-text {
    font-size: 28rpx;
    color: #333;
}

.item-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
}

.item-value {
    flex: 1;
    font-size: 28rpx;
    color: #1a1a1a;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.item-value.placeholder {
    color: #B0B8C4;
}

.item-placeholder {
    flex: 1;
    font-size: 28rpx;
    color: #B0B8C4;
    text-align: right;
}

.item-arrow {
    font-size: 32rpx;
    color: #CCC;
    margin-left: 12rpx;
    font-weight: 300;
    flex-shrink: 0;
}

.item-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
}

.item-input {
    flex: 1;
    font-size: 28rpx;
    color: #1a1a1a;
    text-align: right;
}

.input-placeholder {
    color: #B0B8C4;
}

.char-count {
    font-size: 22rpx;
    color: #B0B8C4;
    margin-left: 12rpx;
    flex-shrink: 0;
}

.textarea-wrap {
    width: 100%;
    position: relative;
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 20rpx;
}

.item-textarea {
    width: 100%;
    font-size: 28rpx;
    color: #1a1a1a;
    line-height: 1.6;
    min-height: 160rpx;
}

.level-group {
    flex: 1;
    display: flex;
    gap: 16rpx;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.level-item {
    display: flex;
    align-items: center;
    padding: 12rpx 20rpx;
    border-radius: 32rpx;
    background: #F5F6FA;
    border: 2rpx solid transparent;
    transition: all 0.2s;
}

.level-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    margin-right: 8rpx;
}

.level-critical .level-dot { background: #E53935; }
.level-high .level-dot { background: #FB8C00; }
.level-medium .level-dot { background: #FBC02D; }
.level-low .level-dot { background: #43A047; }

.level-text {
    font-size: 24rpx;
    color: #666;
}

.level-item.active {
    border-color: currentColor;
}

.level-item.level-critical.active {
    background: #FFEBEE;
    border-color: #E53935;
}

.level-item.level-critical.active .level-text {
    color: #C62828;
}

.level-item.level-high.active {
    background: #FFF3E0;
    border-color: #FB8C00;
}

.level-item.level-high.active .level-text {
    color: #E65100;
}

.level-item.level-medium.active {
    background: #FFF8E1;
    border-color: #FBC02D;
}

.level-item.level-medium.active .level-text {
    color: #F57C00;
}

.level-item.level-low.active {
    background: #E8F5E9;
    border-color: #43A047;
}

.level-item.level-low.active .level-text {
    color: #2E7D32;
}

.category-group {
    flex: 1;
    display: flex;
    gap: 12rpx;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 20rpx;
    border-radius: 16rpx;
    background: #F5F6FA;
    border: 2rpx solid transparent;
    min-width: 100rpx;
    transition: all 0.2s;
}

.category-icon {
    font-size: 36rpx;
    margin-bottom: 4rpx;
}

.category-text {
    font-size: 22rpx;
    color: #666;
}

.category-item.active {
    background: #E3F2FD;
    border-color: #1E88E5;
}

.category-item.active .category-text {
    color: #1565C0;
    font-weight: 500;
}

.location-info {
    flex: 1;
    display: flex;
    align-items: flex-start;
}

.location-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
    flex-shrink: 0;
}

.location-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.location-coord {
    font-size: 22rpx;
    color: #666;
    font-family: monospace;
}

.location-address {
    font-size: 22rpx;
    color: #999;
    margin-top: 4rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.image-item {
    width: calc((100% - 32rpx) / 3);
    aspect-ratio: 1;
    border-radius: 12rpx;
    overflow: hidden;
    position: relative;
    background: #F5F6FA;
}

.preview-image {
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

.offline-tip {
    display: flex;
    align-items: center;
    background: #FFF8E1;
    margin: 0 24rpx 24rpx;
    padding: 20rpx 24rpx;
    border-radius: 12rpx;
    border-left: 6rpx solid #FBC02D;
}

.tip-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
    flex-shrink: 0;
}

.tip-text {
    font-size: 24rpx;
    color: #F57C00;
    flex: 1;
    line-height: 1.5;
}

.footer-bar {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 24rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 2rpx solid #F0F2F5;
}

.btn-draft {
    flex: 1;
    height: 88rpx;
    background: #fff;
    border: 2rpx solid #1E88E5;
    border-radius: 44rpx;
    color: #1E88E5;
    font-size: 30rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-draft::after {
    border: none;
}

.btn-submit {
    flex: 2;
    height: 88rpx;
    background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
    border-radius: 44rpx;
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(30, 136, 229, 0.3);
}

.btn-submit::after {
    border: none;
}

.bottom-space {
    height: 40rpx;
}
</style>
