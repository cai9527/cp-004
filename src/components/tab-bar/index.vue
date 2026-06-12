<template>
    <view class="tab-bar-wrap">
        <view class="tab-bar">
            <view 
                v-for="(item, index) in tabs" 
                :key="index"
                class="tab-item"
                :class="{ active: currentIndex === index }"
                @tap="handleTap(index)"
            >
                <view class="tab-icon-wrap">
                    <image 
                        v-if="item.iconPath" 
                        class="tab-icon"
                        :src="currentIndex === index ? item.selectedIconPath : item.iconPath"
                        mode="aspectFit"
                    />
                    <text v-else class="tab-icon-text">{{ item.iconText }}</text>
                    <view v-if="item.badge && item.badge > 0" class="tab-badge">
                        {{ item.badge > 99 ? '99+' : item.badge }}
                    </view>
                </view>
                <text class="tab-text">{{ item.text }}</text>
            </view>
        </view>
        <view class="safe-area-bottom"></view>
    </view>
</template>

<script>
export default {
    name: 'TabBar',
    props: {
        tabs: {
            type: Array,
            default: () => []
        },
        current: {
            type: [String, Number],
            default: 0
        }
    },
    data() {
        return {}
    },
    computed: {
        currentIndex() {
            if (typeof this.current === 'number') {
                return this.current
            }
            return this.tabs.findIndex(t => t.key === this.current)
        }
    },
    methods: {
        handleTap(index) {
            if (this.currentIndex === index) return
            this.$emit('change', index, this.tabs[index])
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        }
    }
}
</script>

<style lang="scss" scoped>
.tab-bar-wrap {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
}

.tab-bar {
    display: flex;
    align-items: center;
    height: 100rpx;
    background: #ffffff;
    box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.06);
    border-top: 2rpx solid #F0F2F5;
}

.tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    transition: all 0.25s ease;
}

.tab-icon-wrap {
    position: relative;
    width: 48rpx;
    height: 48rpx;
    margin-bottom: 4rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tab-icon {
    width: 44rpx;
    height: 44rpx;
}

.tab-icon-text {
    font-size: 40rpx;
}

.tab-badge {
    position: absolute;
    top: -6rpx;
    right: -12rpx;
    min-width: 32rpx;
    height: 32rpx;
    background: #E53935;
    color: #fff;
    border-radius: 16rpx;
    font-size: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8rpx;
    font-weight: 500;
    line-height: 1;
}

.tab-text {
    font-size: 22rpx;
    color: #8a8a8a;
    transition: all 0.25s ease;
    line-height: 1.2;
}

.tab-item.active .tab-text {
    color: #1E88E5;
    font-weight: 500;
    transform: scale(1.05);
}

.safe-area-bottom {
    height: env(safe-area-inset-bottom);
    background: #ffffff;
}
</style>
