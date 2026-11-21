# 项目研究图谱 / Launch Atlas

[中文](#中文) · [English](#english)

![Preview](screenshots/01-board.jpg)

## 中文

### 第一次使用

安装 [Node.js 的 LTS 长期支持版](https://nodejs.org/en/download)（22.18 或更新）。

1. 在仓库页面点 **Code → Download ZIP**，下载并解压。打开解压后含有 `main.ts` 的文件夹。
2. 在 Windows 文件资源管理器地址栏输入 `powershell` 后按回车。把下面的命令复制到打开的窗口并回车。

```sh
node main.ts --input examples/snapshot.json --output out --preview
```

打开新生成的 `out/dashboard/index.html`，先点击列表中任意一行查看详情。示例用虚构数据，可以试用搜索、类别和观察名单。

离线协议研究看板，按赛事快照展示指标、分层排序和观察名单。

### 本地运行

使用 Node.js 22.18 或更新版本。运行 `node main.ts --input <snapshot.json> --output <输出目录>` 生成看板。输入快照由赛事或使用者提供。

运行 `node main.ts --input examples/snapshot.json --output out --preview` 可以用模拟数据试用，完成后用浏览器打开 `out/dashboard/index.html`。

看板默认显示中文，右上角可切换语言。

命令行提示默认显示中文。设置 `MAKEFUN_UI_LANG=en` 可显示英文。

## English

### First use

Install the [Node.js LTS release](https://nodejs.org/en/download), version 22.18 or newer.

1. Choose **Code → Download ZIP**, extract it, then open the extracted project folder.
2. On Windows, type `powershell` in the File Explorer address bar and press Enter. Run the commands below.

```sh
node main.ts --input examples/snapshot.json --output out --preview
```

打开新生成的 `out/dashboard/index.html`，先点击列表中任意一行查看详情。示例用虚构数据，可以试用搜索、类别和观察名单。

An offline protocol research dashboard that ranks and explores entries from a supplied data snapshot.

### Run locally

Use Node.js 22.18 or newer. Run `node main.ts --input <snapshot.json> --output <output-dir>` to build the dashboard from a challenge-format snapshot.

Run `node main.ts --input examples/snapshot.json --output out --preview` with the included synthetic snapshot, then open `out/dashboard/index.html`.

The dashboard opens in Simplified Chinese. Use the language menu in the upper right to switch.

Set `MAKEFUN_UI_LANG=en` for English terminal messages.

[中文技术说明](README.details.zh.md) · [English technical notes](README.details.md)

[make.fun 赛事 / Original bounty](https://make.fun/bounty/token-radar-01)

## 许可证 / License

MIT. See [LICENSE](LICENSE).

赛事模板组件的授权见 [LICENSE-makefun.txt](LICENSE-makefun.txt)。

Kit components are covered by [LICENSE-makefun.txt](LICENSE-makefun.txt).

