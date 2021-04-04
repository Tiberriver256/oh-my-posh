//jshint esversion:8
//jshint node:true
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const themesConfigDir = "./../themes";
const themesStaticDir = "./static/img/themes";

function newThemeConfig(rpromptOffset = 40, cursorPadding = 30, author = "") {
  var config = {
    rpromptOffset:  rpromptOffset,
    cursorPadding: cursorPadding,
    author: author
  };
  return config;
}

let themeConfigOverrrides = new Map();
themeConfigOverrrides.set('agnoster.omp.json', newThemeConfig(cursorPadding=40));
themeConfigOverrrides.set('agnosterplus.omp.json', newThemeConfig(rpromptOffset=80));
themeConfigOverrrides.set('avit.omp.json', newThemeConfig(cursorPadding=80));
themeConfigOverrrides.set('blueish.omp.json', newThemeConfig(cursorPadding=100));
themeConfigOverrrides.set('powerlevel10k_lean.omp.json', newThemeConfig(rpromptOffset=80));
themeConfigOverrrides.set('slim.omp.json', newThemeConfig());
themeConfigOverrrides.set('slimfat.omp.json', newThemeConfig());
themeConfigOverrrides.set('stelbent.minimal.omp.json', newThemeConfig());

(async () => {
  const themes = await fs.promises.readdir(themesConfigDir);
  let links = new Array();

  for (const theme of themes) {
    if (!theme.endsWith('.omp.json')) {
      continue;
    }
    const configPath = path.join(themesConfigDir, theme);

    let config = newThemeConfig();
    if (themeConfigOverrrides.has(theme))  {
      config = themeConfigOverrrides.get(theme);
    }

    let poshCommand = `oh-my-posh --config ${configPath} --shell shell --export-png`;
    poshCommand += ` --rprompt-offset ${config.rpromptOffset}`;
    poshCommand += ` --cursor-padding ${config.cursorPadding}`;
    if (config.author !== '') {
      poshCommand += ` --author ${config.author}`;
    }

    const { _, stderr } = await exec(poshCommand);

    if (stderr !== '') {
      console.error(`Unable to create image for ${theme}, please try manually`);
      continue;
    }

    const image = theme.replace('.omp.json', '.png');
    const toPath = path.join(themesStaticDir, image);

    await fs.promises.rename(image, toPath);

    const name = theme.replace('.omp.json', '');
    const themeName = name.charAt(0).toUpperCase() + name.slice(1);

    const themeData = `
### [${themeName}]

[![${themeName}](/img/themes/${name}.png)][${themeName}]
`;

    await fs.promises.appendFile('./docs/themes.md', themeData);

    links.push(`[${themeName}]: https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/themes/${theme} '${themeName}'\n`);
  }

  for (const link of links) {
    await fs.promises.appendFile('./docs/themes.md', link);
  }
})();
