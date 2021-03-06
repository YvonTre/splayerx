<template>
  <div
    :style="{
      width: isDarwin ? 'calc(100% - 176px)' : 'calc(100% - 290px)',
    }"
    class="search-url"
  >
    <div
      :style="{
        order: isDarwin ? 1 : 2,
      }"
      class="url-search"
    >
      <transition
        name="fade-200"
        mode="out-in"
      >
        <div
          v-if="!copied"
          class="content"
        >
          <button
            :title="$t('browsing.copyUrlTitle')"
            v-if="isWebPage"
            @click="onCopy"
            class="btn"
          >
            <Icon
              class="icon"
              type="copyUrl"
            />
          </button>
          <span class="title">{{ title }}</span>
        </div>
        <div
          key="success"
          v-else
          class="content"
        >
          <Icon
            class="icon-success"
            type="copyUrl"
          />
          <span class="title">{{ $t('browsing.copied') }}</span>
          <Icon
            class="icon-nike"
            type="successBlack"
          />
        </div>
      </transition>
    </div>
    <div
      @mouseup="handleUrlReload"
      :style="{
        order: isDarwin ? 2 : 1,
      }"
      :class="canReload ? 'control-button-hover' : ''"
      class="control-button page-refresh-icon no-drag"
    >
      <Icon
        :type="!canReload ? 'pageRefreshDisabled' : isLoading ? 'reloadStop' : 'pageRefresh'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Icon from '@/components/BaseIconContainer.vue';

export default {
  name: 'BrowsingInput',
  components: {
    Icon,
  },
  props: {
    isWebPage: {
      type: Boolean,
      default: false,
    },
    currentUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'SPlayer',
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
    handleUrlReload: {
      type: Function,
      required: true,
    },
    closeUrlInput: {
      type: Function,
      required: true,
    },
    playFileWithPlayingView: {
      type: Function,
      required: true,
    },
    canReload: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      copied: false,
    };
  },
  computed: {
    isDarwin() {
      return process.platform === 'darwin';
    },
  },
  methods: {
    handleCloseUrlInput() {
      this.closeUrlInput();
    },
    onCopy() {
      this.$electron.clipboard.writeText(this.currentUrl);
      this.copied = true;
      if (this.copiedTimeoutId) clearTimeout(this.copiedTimeoutId);
      this.copiedTimeoutId = setTimeout(() => {
        this.copied = false;
      }, 1500);
    },
    handleSearchKey(e: KeyboardEvent) {
      const inputUrl = this.$refs.searchValue.value;
      if (e.key === 'Enter') {
        this.playFileWithPlayingView(inputUrl);
      }
    },
  },
};
</script>

<style scoped lang="scss">
::-webkit-input-placeholder {
  color: rgba(255, 255, 255, 0.47);
}
::selection {
  background-color: rgba(255, 255, 255, 0.2);
}
.search-url {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 40px;
  z-index: 6;
  .url-search {
    width: calc(100% - 46px);
    margin-left: 8px;
    outline: none;
    background-color: #FFF;
    border: none;
    z-index: 6;

    .content {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .btn {
      height: 38px;
      outline: none;
      border-width: 0;
    }
    .title {
      font-size: 12px;
      color: #7E808E;
      letter-spacing: 0.09px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .icon {
      display: block;
      width: 20px;
      height: 40px;
      opacity: 0.5;
      transition: opacity 100ms linear;
      &:hover {
        opacity: 1.0;
      }
      &-success {
        display: block;
        width: 20px;
        height: 38px;
      }
      &-nike {
        display: block;
        margin-left: 2px;
        width: 14px;
        height: 38px;
      }
    }
  }
  .control-button {
    width: 30px;
    height: 30px;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 100ms ease-in;
  }
  .control-button-hover:hover {
    background-color: #ECEEF0;
  }
  .page-refresh-icon {
    margin-right: 8px;
    margin-left: 8px;
  }
}
</style>
