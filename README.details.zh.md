# 项目研究图谱

用锁仓总额乘以在对应规模拟合的市值倍数计算隐含市值。对数空间中按两两斜率中位数拟合，区间使用同类协议残差的第 10 和第 90 百分位。已有市值的协议不会参与自己的拟合。

## 技术说明

使用 Node.js 22.18 或以上运行 node main.ts --input examples/snapshot.json --output out --preview，然后打开 out/dashboard/index.html。示例数据为虚构。每行都有核对官方来源和只读预览的流程。

[English technical notes](README.details.md)
