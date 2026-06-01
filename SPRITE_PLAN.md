# Gbox 精灵图制作计划

## 目标

把当前“图片角色在页面中移动”的效果升级为“小游戏角色精灵动画”。每个游戏入口对应一个角色，角色可以待机、行走、跳跃、飞行或冲刺，让页面更像真实小游戏大厅。

## 统一规格

第一版建议统一使用以下规格，方便切图和播放动画：

1. 每个角色一张 sprite sheet。
2. 图片格式优先使用透明背景 PNG。
3. 每帧尺寸统一为 `96x96`。
4. 每个角色先做 4 到 8 帧，不追求过复杂。
5. 所有帧水平排列，方便 CSS 使用 `steps()` 播放。
6. 角色朝右绘制，朝左移动时用水平翻转。
7. 视觉风格统一为“童年网页小游戏 + 像素/卡通混合风”。

## 动作分类

| 动作 | 帧数建议 | 用途 |
| --- | --- | --- |
| `idle` | 4 帧 | 停顿、刚出现、等待点击 |
| `walk` | 6 帧 | 普通地面移动 |
| `jump` | 4 帧 | 弹跳移动、点击反馈 |
| `fly` | 4 帧 | 飞行、漂浮角色 |
| `dash` | 4 帧 | 冲刺、格斗类角色 |

第一版不要求每个角色都有全部动作。每个角色至少需要一个主动作。

## 游戏与角色规划

| 序号 | 游戏 | 链接 | 推荐角色表现 | 主动作 | 备注 |
| --- | --- | --- | --- | --- | --- |
| 1 | 疯狂小人战斗 | `https://www.4399.com/flash/7624.htm` | 横版小人格斗角色 | `dash` | 适合快速左右冲刺和出拳反馈 |
| 2 | 狂扁小朋友 | `https://www.4399.com/flash/1406.htm` | 横版夸张打架小人 | `walk` + `dash` | 可以做成跑动时挥拳 |
| 3 | 勇者之路精灵物语 | `https://www.4399.com/flash/7473.htm` | 勇者或小精灵 | `walk` | 适合冒险 RPG 角色 |
| 4 | 小鳄鱼爱洗澡 | `https://www.4399.com/flash/68876.htm` | 小鳄鱼 | `idle` + `jump` | 适合可爱弹跳，不一定需要走路 |
| 5 | 双刃战士 | `https://www.4399.com/flash/12946.htm` | 双刀战士 | `walk` + `dash` | 可做刀光点击反馈 |
| 6 | 混乱大枪战2 | `https://www.4399.com/flash/45727.htm` | 持枪小人 | `walk` + `dash` | 运动可以更快，点击时有闪光 |
| 7 | 闪客快打3 | `https://www.4399.com/flash/2162.htm` | 街头格斗角色 | `dash` | 可以做成高速横向移动 |
| 8 | 死神VS火影 | `https://www.4399.com/flash/105227.htm` | 忍者/死神格斗角色 | `dash` + `jump` | 稀有角色候选，动作更炫 |
| 9 | 冒险王之神兵传奇 | `https://www.4399.com/flash/47402.htm` | 冒险王角色 | `walk` + `jump` | 适合稳定横向走动 |
| 10 | 造梦西游3 | `https://www.4399.com/flash/46839.htm` | 悟空/西游角色 | `jump` + `dash` | 稀有角色候选 |
| 11 | 冰火小人闯关 | `https://www.4399.com/flash/22727.htm` | 冰火小人 | `walk` | 可以做双角色组合 |
| 12 | 割绳子 | `https://www.4399.com/flash/53475.htm` | 绿色小怪 | `idle` + `jump` | 适合可爱弹跳 |
| 13 | 粘粘世界 | `https://www.4399.com/flash/35187.htm` | 黑色粘粘球 | `idle` + `jump` | 适合弹性运动 |

## 稀有度建议

| 稀有度 | 游戏 |
| --- | --- |
| 普通 | 疯狂小人战斗、狂扁小朋友、勇者之路精灵物语、小鳄鱼爱洗澡、冰火小人闯关、割绳子、粘粘世界 |
| 稀有 | 双刃战士、混乱大枪战2、闪客快打3、冒险王之神兵传奇 |
| 隐藏 | 死神VS火影、造梦西游3 |

## AI 生成提示词模板

如果使用 AI 生成精灵图，每个角色可以使用下面模板：

```text
Create a transparent PNG sprite sheet for a nostalgic 4399-style browser game character.
Style: colorful 2D pixel-cartoon hybrid, clean silhouette, bold outline, readable at small size.
Character: [角色描述].
Action: [idle / walk / jump / fly / dash].
Frames: [4 or 6] frames in a single horizontal row.
Each frame: 96x96 pixels.
Background: transparent.
No text, no UI, no watermark.
The character faces right.
```

## 首批建议

先做 5 个，验证精灵动画系统：

1. 疯狂小人战斗：`dash`
2. 小鳄鱼爱洗澡：`jump`
3. 双刃战士：`dash`
4. 造梦西游3：`jump`
5. 冰火小人闯关：`walk`

这 5 个覆盖了格斗、可爱、武器、跳跃、双人闯关几类动作。系统跑通后，再补剩下 8 个。

## 开发任务

1. 新建 `assets/sprites/`。
2. 为每个角色放入 sprite sheet。
3. 在角色数据里增加 `sprite`、`frameWidth`、`frameHeight`、`frames`、`motion` 字段。
4. 页面角色从 `<img>` 改成 sprite 节点。
5. CSS 使用 `steps()` 播放帧动画。
6. JS 根据 `motion` 控制移动方式。
7. 点击角色时切换到 `jump` 或 `dash` 反馈，再进入游戏。

