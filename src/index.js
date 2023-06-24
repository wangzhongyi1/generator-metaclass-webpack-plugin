const { RawSource } = require('webpack-sources');

class generatorMetaClass {
  constructor(options) {
    this.options = options;
    this.prefix = '/';
    this.cssName = 'generator.css';
    this.rules = require('./cssProperties.json');
    this.classMap = {};
    this.source = '';
    this.regMap = new Map([
      [/0x/g, '#'],
      [/dot(?!ted)/g, '.']
    ]);
  }

  /**
   *  将自定义标记转化正确的css属性值
   * @param {String} cls 类名
   * @returns String
   */
  normalizeCls(cls) {
    let str = cls
    for(let [reg, val] of this.regMap) {
      str = str.replace(reg, val);
    }
    return str;
  }

  /**
   * reduce执行器，如果此类被继承，可以重写执行器
   * @param {String} p prev
   * @param {String} n css单个属性值
   * @returns String
   */
  exextor(p, n) {
    if (/\d+n$/.test(n)) { // 不需要默认添加 px 作为单位，如：flex: 1;
      return `${p} ${n.slice(0, -1)}`;
    } else if (/\d+p$/.test(n)) { // p=percent 添加 % 作为单位，如：w_100p -> .w_100p{width: 100%}
      return `${p} ${n.slice(0, -1)}%`;
    } else if (+n) {
      return `${p} ${n}px`; // 数值默认添加 px 作为单位
    }
    return `${p} ${n}`; // 普通属性
  }

  /**
   * 解析匹配到的单个class
   * @param {String} cls "fs_20", "color_0xf40", "margin_20-10-25-15"
   * @returns void
   */
  resolveClass(cls) {
    const s = this.normalizeCls(cls).split('_');
    if (!s[1]) return; // 处理边界：class="fs"
    const key = s[0];
    const valList = s[1].split('-');
    const find = this.rules.find(v => {
      if (Array.isArray(v.key)) return v.key.includes(key);
      return v.key === key;
    });
    if (!find) return;

    const valStr = valList.reduce(this.exextor, '');
    const mapVal = `{${find.description}:${valStr}}`;
    if (key && valStr && !this.classMap[cls]) { // 有key就不用重新赋值了
      this.classMap[cls] = mapVal; // {fs_20: '{font-size: 20px}'}
    }
  }

  /**
   * 分割正则捕获到的内容(即class) -> ["fs_20", "color_0xf40"]
   * @param {Array} match 正则匹配结果
   */
  resolveMatch(match) {
    let str = match[1] || match[2];
    str = str.trim(); // 处理边界：class="   "
    if (str) {
      const strToList = str.split(/\s+/); // 处理边界：class="fs_20     color_0xf40"
      strToList.forEach(this.resolveClass.bind(this));
    }
  }

  /**
   * 匹配 class="fs_20 color_0xf40"
   * @returns void
   */
  matchRules() {
    const reg = /[cC]lass\s*:\s*(?:\\?'(.+?)\\?'|\\?"(.+?)\\?")/g
    for (const match of this.source.matchAll(reg)) {
      this.resolveMatch(match);
    }
  }

  /**
   * 给 html 中插入一条 link，用于引入 generator.css
   * @returns string
   */
  insertTag(source) {
    let str = source;
    // 找到第一个 css link
    const reg = /<link href="(.+?\.css)"/;
    const match = str.match(reg);
    if (match) {
      const capture = match[1];
      // 获取 css 文件所在的文件夹 如：/css/app.css -> /css/
      const lastInx = capture.lastIndexOf('/');
      this.prefix = capture.slice(0, lastInx!==-1 ? lastInx : 0) + '/';
      str = str.slice(0, match.index) + `<link href="${this.prefix}${this.cssName}" rel="stylesheet" />` + str.slice(match.index);
    } else {
      // 没有 css link 就在 </head> 前面插入
      const index = str.indexOf('</head>');
      str = str.slice(0, index) + `<link href="${this.prefix}${this.cssName}" rel="stylesheet"` + str.slice(index);
    }
    return str;
  }

  apply(compiler) {
    const _this = this;

    compiler.hooks.emit.tap('generatorMetaClassPlugin', (compilation) => {
      const assets = compilation.assets;
      Object.keys(assets).forEach(path => {
        if (/\.html$/.test(path)) {
          const htmlSource = _this.insertTag(assets[path].source());
          assets[path] = new RawSource(htmlSource);
        } else if (/\.js$/.test(path)) {
          _this.source = assets[path].source();
          _this.matchRules();
        }
      });

      const styleSource = Object.entries(this.classMap).reduce((p, n) => {
        if (n[0] && n[1]) {
          return p + `.${n[0]}${n[1]}`;
        }
        return p;
      }, '');
      // 添加额外的资源
      assets[`${_this.prefix}${_this.cssName}`] = new RawSource(styleSource);
    });
  }
}

generatorMetaClass.loader = require.resolve('./loader.js');
module.exports = generatorMetaClass;