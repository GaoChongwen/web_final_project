##  PP's TODO

详细展示见：**脚本程序设计-课程项目.pdf** 与 **脚本程序设计-答辩.pptx**

1652667 梁栎鹏

### 0.0 页面展示

![]()

### 1.0 MVC框架

- 跟着老师给的example写了一遍
- data有改变时，update刷新界面
  - 数据flush
  - 刷新界面

### 1.1 基本功能：

a)     包含新增、删除、展现列表、全部完成/取消、删除已完成；

b)     保存页⾯状态，刷新页⾯后可恢复；

c)      使⽤ajax进⾏HTTP⽹络请求；

### 1.2 高级功能：

a)      存储TODO的**设定时间**（正则匹配输入），可设置为**当日可做**，或者**设置时间段**；

​	- 考虑到设定时间的方便性，使用正则匹配输入的设定时间

b)      增加**日历**，并且TODO以**甘特图**展示，没有用开源日历插件；

​	- 甘特图使得当月的TODO**可视化**

c)      使用**IFTTT**，TODO过期或邻近截止日期，给自己发送邮件；

 - ifttt.js

   | 邮件列表示例                                                 | 邮件内容示例                                                 |
   | ------------------------------------------------------------ | ------------------------------------------------------------ |
   | ![](https://github.com/GaoChongwen/web_final_project/blob/master/pic/ifttt.png?raw=true) | ![](https://github.com/GaoChongwen/web_final_project/blob/master/pic/ifttt1.png?raw=true) |

   

d)      **移动端适配**，css以rem设置布局，初始化时调整根字体大小；

e)      **过滤**，过滤：All+Completed+Active+**Td** 新增**Td**标签，展示**当日**TODO；

f)       **编辑**，使⽤Hammer.js双击，编辑单条TODO；

g)      **左滑置顶、删除**，重要单条TODO置顶，左滑单条TODO可以看到**置顶、删除**按钮；

h)      **长按**，单条TODO长按，显示TODO全部内容（由于溢出，在index页面中一部分内容溢出部分以”…”展示）；

i)       在日历中**按日期展示TODO**，轻触日期，展示当日的TODO；

j)       **标签**，单条TODO的toggle部分，按照日历中甘特图的颜色，设置标签颜色；

k)      **滚动条**，由于移动端页面有限，设置TODO-LIST的滚动条；

### 文件目录

- **css**

 todo.css

- **js**

todo.js  // 核心逻辑

calender.js  // 创建日历模块

ifttt.js  // 使用ifttt，发送邮件

compatible.js  // 移动端配置

utils.js  // 工具

ajax.js  // 数据持久化，参考来源：老师

model.js  // 数据持久化，参考来源：老师

provider-ajax.js   // 数据持久化，参考来源：老师

server.js   // 服务端逻辑，参考来源：老师

- **pic**

  图标

-  index.html

## 1.2    引用

a)      数据持久化部分参考老师代码；

b)      部分css式样与html参考老师代码；

c)      Todo.js框架参考老师代码；

d)      无其它来源。

