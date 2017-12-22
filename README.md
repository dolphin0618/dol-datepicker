# dol-datepicker （轻便的PC端的日期时间组件）
压缩后js大小在10K左右，轻便可以合并到其他脚本中减少请求。

## 示例：
* [演示地址](http://htmlpreview.github.io/?https://dolphin0618.github.io/dol-datepicker/index.html)

## 功能

- [x] 可选年月日时分秒
- [x] 灵活动态指定时间范围
- [x] 制定某部分功能显示隐藏

## 使用
**引入**
```html
<head>
    <link type="text/css" rel="stylesheet" href="./dist/dol-datepicker.css">
</head>
<body>
    <script src="./dist/dol-datepicker.js"></script>
</body>
```
**初始化**
```js
  var picker1 = new Datepicker({
    elemName: 'domid',
    format: 'YYYY-MM-DD hh:mm:ss',
    min: '1970-01-01 00:00:00',
	max: '2099-12-12 23:59:59',
	hasTime: true,
	hasClear: true,
	hasToday: true,
	hasConfirm: true,
	fixed: false,
	callBack: null
  });
```

参数说明见下：：⬇️⬇️⬇️

**参数说明**

|名称|类型|说明|
|:---:|:---:|:---:|
|elemName | {String} | 需要绑定的input，绑定其它标签也可以|
|format | {String} | 指定日期格式|
|min | {String&number} | 指定最小时间，小于此时间将无法选择。当值为数字时，表示以今天为0的天数差|
|max | {String&number} | 指定最大时间，大于此时间将无法选择。当值为数字时，表示以今天为0的天数差|
|hasTime | {Boolean}| 控制时分秒显示隐藏|
|hasClear | {Boolean} | 清空按钮显示隐藏|
|hasToday | {Boolean} | 今天按钮显示隐藏|
|hasConfirm | {Boolean} | 确认按钮显示隐藏|
|fixed | {Boolean} | 组件定位方式（absolute或fixed）|
|callBack | {fn(a, b)} | 回调函数,a为字符串格式，b为时间戳|

**方法**

挂载在实例对象上的方法

```js
  picker1.setMinScope(a, b)
  // 动态设置时间范围最小值，a参数可以是字符串时间，也可以是时间戳；b参数是a为基点的天数差。（比如a是'2017-12-12 00:00:00'，b是-2, 那么最小时间就是2017-12-10 00:00:00）
  
  picker1.setMaxScope(a, b)
  //  动态设置时间范围最大值，参数说明同上
  
  picker1.parse(time, format)
  // time可以是时间戳，也可以是以今天为基点的天数差，转成format格式的时间
```
## **Logs**
### 2017.12.12(add)
> * 发布第一版

## **Authors**
>  如果你遇到了什么神bug，请发起[ISSUE](https://github.com/dolphin0618/dol-datepicker/issues/new)联系我 ~
>
>  如果你有好的需求，我会考虑加入到组件中
>
