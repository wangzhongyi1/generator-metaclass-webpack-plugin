function resolveSource(matchList, source) {
    const len = matchList.length;
    const regMap = new Map([
        [/#/g, '0x'],
        [/\./g, 'dot']
    ]);
    let str = source;
    for (let i = 0; i < len; i++) {
        const matchStr = matchList[i][0]; // 'class="fs_20 color_#f40"'
        for (const [reg, val] of regMap) {
            const replacedStr = matchStr.replace(reg, val); // 'class="fs_20 color_0xf40"'
            str = str.replace(matchStr, replacedStr);
        }
    }
    return str;
}

function matchRules(source) {
    // 匹配得到 ['class="fs_20 color_#f40"', undefined, 'fs_20 color_#f40']
    const reg = /class\s*=\s*(?:'(.+)'|"(.+)")/g;
    const matchList = [];
    for (const match of source.matchAll(reg)) {
        matchList.push(match);
    }
    if (matchList.length) {
        return resolveSource(matchList, source);
    }
    return source;
}

module.exports = (source) => {
    return matchRules(source);
}