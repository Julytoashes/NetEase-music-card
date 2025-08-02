### 修改

纯随机，默认随机，通知栏显示歌曲信息

![播放器](https://i.imgur.com/orsoTHt.jpeg)

<iframe src="😁" width="100%" height="110" style="border: none; border-radius: 0px;" frameborder="0"></iframe>

# NetEase-music-card

更加美观、简洁、易用的网易云外链播放器

支持播放歌单或单曲，也可以现拼歌单。允许快捷搜索，无需手动获取歌单或歌曲的ID

支持亮色\暗色主题，支持自定义主题色，配置简单

配置页面：https://enamscard.pages.dev/generate

播放器：https://enamscard.pages.dev/?playlist=6821530729&theme=dark&themeColor=%23008eff

请求参数：


| 参数名           | 类型         | 描述                                      |
|------------------|--------------|-------------------------------------------|
| `playlist/id`    | string      | 歌单\歌曲ID，支持多首单曲，ID用逗号分隔 |
| `theme`          | string      | 播放器主题，取值为 `dark` 或 `light`，默认暗色 |
| `themeColor`     | string      | 播放器主题色，16进制色号，`#`需替换为 `%23` |
