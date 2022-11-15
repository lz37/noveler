# Noveler —— 一个在 vscode 上辅助码中文小说的插件

## 默认配置

<https://raw.githubusercontent.com/lz37/noveler/master/etc/settings.json>

## 提供的功能

### 1. 提供常见语法高亮

![高亮图片](https://raw.githubusercontent.com/lz37/noveler/master/images/highlight-sample.png)
提供人物名称高亮

### 2. 自定义人物名称高亮

在 settings.json 设置，以下是例子

```json
{
    "noveler": {
        "roles": [
            {
                "name": "汪言",
                "color": {
                    "light": "#ffff00",
                    "dark": "#ffff00"
                }
            },
            {
                "name": "王永磊",
                "color": {
                    "dark": "#00ff00",
                    "light": "#00ff00"
                }
            }
        ]
    }
}
```

![人物姓名高亮图片](https://raw.githubusercontent.com/lz37/noveler/master/images/roles-highlight-sample.png)

### 3. 自定义人物名悬停信息

支持`markdown`语法

在 settings.json 设置，以下是例子

```json
{
    "noveler": {
        "roles": [
            {
                "name": "汪言",
                "color": {
                    "light": "#ffff00",
                    "dark": "#ffff00"
                },
                "description": "**男主**，性别为男爱好为女"
            }
        ]
    }
}
```

![人物信息悬停图片](https://raw.githubusercontent.com/lz37/noveler/master/images/roles-hover-message-sample.png)

### 4. 增强vscode的缩进补全功能

配置如下

```json
{
    "noveler": {
        "roles": [],
        "autoInsert": {
            "enabled": true, // 是否启用
            "indentionLength": 4, // 自动补全缩进的长度
            "spaceLines": 1 // 自动在段落之间补全的空行数
        }
    },
    "editor.wrappingIndent": "none", // 非本插件功能，设置为none后，多行的段落不会共享第一行的缩进
    "editor.autoIndent": "none" // 非本插件的功能，为vscode自带的缩进补全功能，和本插件功能有所冲突，请在两者间进行适当的取舍
}
```

![自动补全缩进图片](https://raw.githubusercontent.com/lz37/noveler/master/images/auto-insert-sample.gif)

### 5. 计速器

显示工作时间和每小时平均输入字数，鼠标移动到上面会显示已经输入的总字数

配置：

```json
{
    "noveler": {
        "statusBar": {
            "enabled": true, // 是否启用
            "timeUnit": 10 // 计速器的时间单位，单位为秒(一段timeUnit的时间不码字，计速器会停止计时)
        }
    }
}
```

![计速器图片](https://raw.githubusercontent.com/lz37/noveler/master/images/status-bar-sample.gif)

### 6. 小说预览

也许这个设计多此一举，但说不准就有人需要它呢

在vscode中，有许多种方法可以实现比此功能更加强大的预览功能，不过在达到目标之前，你可能会耗费很大一番功夫，如果你不想花费时间在上面，可以尝试使用此功能

`ctrl + shift + p`输入`noveler: preview`，或者是使用快捷键`alt + \`（注意快捷键冲突），即可打开预览窗口，你可以将窗口缩放成移动端样式或者是网页端样式，实时预览你的小说（来检查一个段落的字数是否过多，或者连续的长段落过多，连续的短段落过多之类的）

![预览图片](https://raw.githubusercontent.com/lz37/noveler/master/images/preview-sample.gif)

### 7. 自定义补全

提供人物名补全和作者自定义补全，由于vscode相关api的缺失，该功能的实现只能先空一格，再把空格删去，稍稍影响了观感，如果你有好的解决方式，可以分享给我

设置如下：

```json
{
  "noveler": {
    "completions": [
      {
        "title": "chapter",
        "context": "第${1}章", // 试试看第${1|一,二,三|}章吧
        "kind": "Class"
      }
    ]
  },
}
```

![补全图片](https://raw.githubusercontent.com/lz37/noveler/master/images/completion-sample.gif)

祝您写作愉快 :)

更多功能正在开发中……
