# generator-metaclass-webpack-plugin

这是一个基于 webpack 的生成原子式 css class 工具

目前测试在 vue2、vue3 基于webpack项目中工作正常

## 使用

1. `npm i generator-metaclass-webpack-plugin -D`

2. 在 `vue.config.js` 中配置
```js
const generatorMetaClassPlugin = require('generatorMetaClass');

module.exports = {
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.vue$/i,
                    use: [generatorMetaClassPlugin.loader]
                }
            ]
        },
        plugins: [
            new generatorMetaClassPlugin()
        ]
      }
}
```

## 在 .vue 文件中使用

只需要书写符合规则的 class，就会自动生成 `generator.css`，插入 html 的 `head` 中

例如：
```html
<template>
    <h1 class="margin_10-15-20-25 color_#f40"></h1>
</template>
```
在生成的 `generator.css` 中内容：
```css
.margin_10_15_20_25{
    margin: 10px 15px 20px 25px;
}
.color_0xf40{
    color: #f40;
}
```

## 规则

### 属性名称

1. 所有的单个单词的属性都可以直接单词，其中有些可以简写
例如：

|属性|简写|
|---|---|
|background|background, bg|
|height|height, h|
|width|width, w|
|opacity|opacity|

2. 双单词属性几乎可以使用`第一个单词首字母+后一个完整单词`的形式来书写，但有六个是特殊的：`max-height`、`max-width`、`min-height`、`min-width`、`background-color`、`background-image`
例如：

|属性|简写|
|---|---|
|max-height|maxh|
|max-width|maxw|
|min-height|minh|
|min-width|minw|
|align-content|ac、acontent|
|align-items|ai、aitems|
|align-self|as、aself|
|align-name|an、aname|
|backface-visibility|bv、bvisibility|
|background-attachment|ba、battachment|
|background-color|bc、bgc|
|background-image|bi、bgimage|
|background-origin|bo、borigin|
|background-position|bp、bposition|
|background-size|bz、bsize|
|background-bottom|bb、bbottom|
|border-left|bl、bleft|
|border-right|br、bright|
|border-style|bs、bstyle|
|border-top|bt、btop|
|border-top|bt、btop|
|clip-path|cp、cpath|
|column-count|cc、ccount|
|column-fill|cf、cfill|
|column-gap|cg、cgap|
|column-rule|cr、crule|
|column-span|cs、cspan|
|column-width|cw、cwidth|
|counter-increment|ci、cincrement|
|empty-cells|ec、ecells|
|flex-basis|fb、fbasis|
|flex-direction|fd、fdirection|
|flex-grow|fg、fgrow|
|font-family|ff、ffamily|
|font-kerning|fk、fkerning|
|font-size|fs、fsize|
|font-variant|fv、fvariant|
|font-weight|fw、fweight|
|grid-area|ga、garea|
|grid-column|gc、gcolumn|
|grid-gap|gg、ggap|
|grid-row|gr、grow|
|grid-template|gt、gtemplate|
|hanging-punctuation|hp、hpunctuation|
|image-rendering|ir、irendering|
|justify-content|jc、jcontent|
|justify-item|ji、jitems|
|justify-self|js、jself|
|letter-spacing|ls、lspacing|
|line-break|lb、lbreak|
|line-height|lh、lheight|
|list-style|ls、lstyle|
|margin-bottom|mb、mbottom|
|margin-left|ml、mleft|
|margin-right|mr、mright|
|margin-top|mt、mtop|
|object-fit|of、ofit|
|object-position|op、oposition|
|outline-color|oc、ocolor|
|outline-offset|oo、ooffset|
|outline-style|os、ostyle|
|overflow-wrap|ow、owrap|
|padding-bottom|pb、pbottom|
|padding-left|pl、pleft|
|padding-right|pr、pright|
|padding-top|pt、ptop|
|perspective-origin|po、porigin|
|pointer-events|pe、pevents|
|scroll-behavior|sb、sbehavior|
|tab-size|bs、bsize|
|tab-layout|tl、tlayout|
|text-align|ta、talign|
|text-decoration|td、tdecoration|
|text-indent|ti、tindent|
|text-justify|tj、tjustify|
|text-shadow|ts、tshadow|
|text-transform|tt、ttransform|
|transform-origin|to、torigin|
|transition-property|tp、tproperty|
|unicode-bidi|ub、ubidi|
|user-select|us、uselect|
|vertical-align|va、valign|
|white-space|ws、wspace|
|word-break|wb、wbreak|
|word-wrap|ww、wwrap|
|writing-mode|wm、wmode|
|z-index|zi、zindex|

3. 多单词属性，都可以使用`单词首字母`进行简写
例如：

|属性|简写|
|---|---|
|border-top-color|btc|
|grid-row-gap|gra|

### 属性值

1. 数字结尾，默认添加`px`作为单位
    - 如：`w_100` 得到 `.w_100{width: 100px}`
2. 不需要添加单位，请使用 `n` 作为结尾
    - 如：`flex_1n` 得到 `.flex_1{flex: 1}`
3. 如果你想以 `%` 作为单位，请以 `p` 作为结尾
    - 如：`h_10p` 得到 `.h_10p{height: 10%}`
4. 暂不支持 `calc()`、`rgb()`、`rgba()`、`url()` 等css函数，后续可能会考虑支持