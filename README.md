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

祝您写作愉快 :)

更多功能正在开发中……
