<template>
    <view 
        class="action-button-bar" 
        :class="[
            `layout-${layout}`,
            `variant-${variant}`,
            { 'safe-area': safeArea, 'has-divider': divider }
        ]"
    >
        <view 
            v-for="(btn, index) in buttons" 
            :key="index"
            class="action-btn-wrapper"
            :style="getBtnWrapperStyle(btn, index)"
        >
            <button 
                class="action-btn"
                :class="[
                    `btn-type-${btn.type || 'default'}`,
                    `btn-size-${btn.size || size}`,
                    { 
                        'btn-block': btn.block !== false,
                        'btn-loading': btn.loading,
                        'btn-disabled': btn.disabled || btn.loading,
                        'btn-ghost': btn.ghost,
                        'btn-outline': btn.outline,
                        'btn-active': activeIndex === index
                    }
                ]"
                :disabled="btn.disabled || btn.loading"
                :loading="btn.loading"
                @tap="handleClick(btn, index)"
                @touchstart.prevent="onPressStart(index, btn)"
                @touchend="onPressEnd"
                @touchcancel="onPressEnd"
                @mousedown.prevent="onPressStart(index, btn)"
                @mouseup="onPressEnd"
                @mouseleave="onPressEnd"
            >
                <view class="btn-content" v-if="!btn.loading">
                    <text v-if="btn.icon" class="btn-icon">{{ btn.icon }}</text>
                    <text class="btn-text">{{ btn.text }}</text>
                </view>
                <view v-else class="btn-loading-wrap">
                    <view class="loading-spinner"></view>
                </view>
            </button>
        </view>
    </view>
</template>

<script>
export default {
    name: 'ActionButtonBar',
    props: {
        buttons: {
            type: Array,
            default: () => []
        },
        layout: {
            type: String,
            default: 'horizontal',
            validator: (val) => ['horizontal', 'vertical', 'equal'].includes(val)
        },
        variant: {
            type: String,
            default: 'default',
            validator: (val) => ['default', 'modal', 'fixed', 'sticky'].includes(val)
        },
        size: {
            type: String,
            default: 'medium',
            validator: (val) => ['small', 'medium', 'large'].includes(val)
        },
        gap: {
            type: String,
            default: '20rpx'
        },
        safeArea: {
            type: Boolean,
            default: false
        },
        divider: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            activeIndex: -1,
            activeTimer: null
        }
    },
    beforeDestroy() {
        this.clearActiveTimer()
    },
    methods: {
        clearActiveTimer() {
            if (this.activeTimer) {
                clearTimeout(this.activeTimer)
                this.activeTimer = null
            }
        },
        isBtnInteractive(btn) {
            return !btn.disabled && !btn.loading
        },
        onPressStart(index, btn) {
            if (!this.isBtnInteractive(btn)) return
            this.clearActiveTimer()
            this.activeIndex = index
        },
        onPressEnd() {
            if (this.activeIndex === -1) return
            const idx = this.activeIndex
            this.clearActiveTimer()
            this.activeTimer = setTimeout(() => {
                this.activeIndex = -1
            }, 150)
        },
        handleClick(btn, index) {
            if (!this.isBtnInteractive(btn)) return
            if (btn.onClick) {
                btn.onClick(btn, index)
            }
            this.$emit('click', btn, index)
            this.$emit(`click:${index}`, btn)
        },
        getBtnWrapperStyle(btn, index) {
            if (this.layout === 'vertical') {
                return {
                    width: '100%',
                    marginBottom: index < this.buttons.length - 1 ? this.gap : '0'
                }
            }
            if (this.layout === 'equal') {
                return {
                    flex: 1
                }
            }
            if (btn.flex) {
                return {
                    flex: btn.flex,
                    marginRight: index < this.buttons.length - 1 ? this.gap : '0'
                }
            }
            if (['primary', 'success', 'danger', 'warning'].includes(btn.type)) {
                return {
                    flex: 2,
                    marginRight: index < this.buttons.length - 1 ? this.gap : '0'
                }
            }
            return {
                flex: 1,
                marginRight: index < this.buttons.length - 1 ? this.gap : '0'
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.action-button-bar {
    display: flex;
    width: 100%;
    box-sizing: border-box;

    &.layout-horizontal {
        flex-direction: row;
        align-items: center;
    }

    &.layout-vertical {
        flex-direction: column;
    }

    &.layout-equal {
        flex-direction: row;
        gap: 20rpx;
    }

    &.variant-default {
        padding: 24rpx 32rpx;
    }

    &.variant-modal {
        padding: 24rpx 32rpx;
        border-top: 2rpx solid #F0F2F5;
        background: #fff;
    }

    &.variant-fixed {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 20rpx 24rpx;
        background: #fff;
        border-top: 2rpx solid #F0F2F5;
        z-index: 999;
    }

    &.variant-sticky {
        position: sticky;
        bottom: 0;
        padding: 20rpx 24rpx;
        background: #fff;
        border-top: 2rpx solid #F0F2F5;
        z-index: 100;
    }

    &.safe-area {
        padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    }

    &.has-divider {
        border-top: 2rpx solid #F0F2F5;
    }
}

.action-btn-wrapper {
    min-width: 0;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 44rpx;
    font-weight: 600;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    line-height: 1;

    &::after {
        border: none;
    }

    &:active,
    &.btn-active {
        transform: scale(0.97);
        opacity: 0.92;
        transition: all 0.1s ease;
    }

    &.btn-block {
        width: 100%;
    }

    &.btn-loading,
    &.btn-disabled {
        opacity: 0.6;
        pointer-events: none;
    }

    &.btn-size-small {
        height: 64rpx;
        font-size: 26rpx;
        border-radius: 32rpx;
        padding: 0 28rpx;
    }

    &.btn-size-medium {
        height: 88rpx;
        font-size: 30rpx;
        border-radius: 44rpx;
        padding: 0 36rpx;
    }

    &.btn-size-large {
        height: 104rpx;
        font-size: 34rpx;
        border-radius: 52rpx;
        padding: 0 48rpx;
    }

    &.btn-type-default {
        background: #F5F6FA;
        color: #666;
    }

    &.btn-type-default.btn-ghost,
    &.btn-type-default.btn-outline {
        background: transparent;
        border: 2rpx solid #D0D5DD;
        color: #666;
    }

    &.btn-type-cancel {
        background: #F5F6FA;
        color: #666;
    }

    &.btn-type-cancel.btn-ghost,
    &.btn-type-cancel.btn-outline {
        background: transparent;
        border: 2rpx solid #D0D5DD;
        color: #666;
    }

    &.btn-type-primary {
        background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
        color: #fff;
        box-shadow: 0 8rpx 24rpx rgba(30, 136, 229, 0.3);
    }

    &.btn-type-primary.btn-ghost,
    &.btn-type-primary.btn-outline {
        background: #fff;
        border: 2rpx solid #1E88E5;
        color: #1E88E5;
        box-shadow: none;
    }

    &.btn-type-success {
        background: linear-gradient(135deg, #43A047 0%, #2E7D32 100%);
        color: #fff;
        box-shadow: 0 8rpx 24rpx rgba(67, 160, 71, 0.3);
    }

    &.btn-type-success.btn-ghost,
    &.btn-type-success.btn-outline {
        background: #fff;
        border: 2rpx solid #43A047;
        color: #43A047;
        box-shadow: none;
    }

    &.btn-type-warning {
        background: linear-gradient(135deg, #FB8C00 0%, #E65100 100%);
        color: #fff;
        box-shadow: 0 8rpx 24rpx rgba(251, 140, 0, 0.3);
    }

    &.btn-type-warning.btn-ghost,
    &.btn-type-warning.btn-outline {
        background: #fff;
        border: 2rpx solid #FB8C00;
        color: #FB8C00;
        box-shadow: none;
    }

    &.btn-type-danger {
        background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
        color: #fff;
        box-shadow: 0 8rpx 24rpx rgba(229, 57, 53, 0.3);
    }

    &.btn-type-danger.btn-ghost,
    &.btn-type-danger.btn-outline {
        background: #fff;
        border: 2rpx solid #E53935;
        color: #E53935;
        box-shadow: none;
    }

    &.btn-type-default.btn-active,
    &.btn-type-cancel.btn-active {
        background: #E8EAF0;
        color: #333;
    }

    &.btn-type-default.btn-outline.btn-active,
    &.btn-type-cancel.btn-outline.btn-active {
        background: #F5F6FA;
        border-color: #999;
        color: #333;
    }

    &.btn-type-primary.btn-active {
        background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%);
        box-shadow: 0 4rpx 12rpx rgba(30, 136, 229, 0.25);
    }

    &.btn-type-primary.btn-outline.btn-active {
        background: #E3F2FD;
        border-color: #1565C0;
        color: #0D47A1;
    }

    &.btn-type-success.btn-active {
        background: linear-gradient(135deg, #388E3C 0%, #1B5E20 100%);
        box-shadow: 0 4rpx 12rpx rgba(67, 160, 71, 0.25);
    }

    &.btn-type-success.btn-outline.btn-active {
        background: #E8F5E9;
        border-color: #2E7D32;
        color: #1B5E20;
    }

    &.btn-type-warning.btn-active {
        background: linear-gradient(135deg, #EF6C00 0%, #BF360C 100%);
        box-shadow: 0 4rpx 12rpx rgba(251, 140, 0, 0.25);
    }

    &.btn-type-warning.btn-outline.btn-active {
        background: #FFF3E0;
        border-color: #E65100;
        color: #BF360C;
    }

    &.btn-type-danger.btn-active {
        background: linear-gradient(135deg, #C62828 0%, #8E0000 100%);
        box-shadow: 0 4rpx 12rpx rgba(229, 57, 53, 0.25);
    }

    &.btn-type-danger.btn-outline.btn-active {
        background: #FFEBEE;
        border-color: #C62828;
        color: #8E0000;
    }
}

.btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.btn-icon {
    font-size: inherit;
    margin-right: 8rpx;
    line-height: 1;
}

.btn-text {
    font-size: inherit;
    line-height: 1;
}

.btn-loading-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.loading-spinner {
    width: 36rpx;
    height: 36rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: action-spin 0.8s linear infinite;
}

.btn-type-default .loading-spinner,
.btn-type-cancel .loading-spinner {
    border-color: rgba(102, 102, 102, 0.2);
    border-top-color: #666;
}

.btn-type-primary.btn-outline .loading-spinner,
.btn-type-success.btn-outline .loading-spinner,
.btn-type-warning.btn-outline .loading-spinner,
.btn-type-danger.btn-outline .loading-spinner {
    border-color: rgba(30, 136, 229, 0.2);
    border-top-color: #1E88E5;
}

.btn-type-success.btn-outline .loading-spinner {
    border-color: rgba(67, 160, 71, 0.2);
    border-top-color: #43A047;
}

.btn-type-warning.btn-outline .loading-spinner {
    border-color: rgba(251, 140, 0, 0.2);
    border-top-color: #FB8C00;
}

.btn-type-danger.btn-outline .loading-spinner {
    border-color: rgba(229, 57, 53, 0.2);
    border-top-color: #E53935;
}

@keyframes action-spin {
    to {
        transform: rotate(360deg);
    }
}

@media screen and (min-width: 768px) {
    .action-button-bar.variant-modal {
        padding: 28rpx 40rpx;
    }

    .action-button-bar.variant-fixed,
    .action-button-bar.variant-sticky {
        padding: 24rpx 48rpx;
    }

    .action-btn.btn-size-medium {
        height: 80rpx;
        font-size: 28rpx;
    }

    .action-btn.btn-size-large {
        height: 96rpx;
        font-size: 32rpx;
    }
}
</style>
