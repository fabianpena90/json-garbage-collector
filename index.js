const R = require("ramda");
const fs = require("fs").promises;
const globby = require("globby");
const dotNotationRegex = /("|'|`)((?:\w+[.])+\w+)("|'|`)/g;
// const dotNotationDynamicRegex = /("|')((?:\w+[.])+(\w|\w*\$\{\w+\})+)("|')/g
const jsonTest = require("./test.json");
const dir = "../testing-scripts/output";
(async () => {
  const options = {
    gitignore: true,
  };
  const cwd = process.cwd();
  const results = {};
  for await (const path of globby.stream(
    [
      // "paths---> /js/**/*.(js|jsx)",
      // "paths---> /src/html/**/*.html",
      // "paths---> /src/authApp/**/*.(js|jsx)",
    ],
    options
  )) {
    if (
      ["de-de.js", "en-us.js", "es-es.js", "fr-fr.js"].some((i) =>
        path.endsWith(i)
      )
    ) {
      continue;
    }
    const fileName = `${cwd}/${path}`;
    const fileContent = await fs.readFile(fileName, "utf8");
    const matches = fileContent.match(dotNotationRegex);
    if (!matches) continue;
    for (const match of matches) {
      const m = match.replace(/"|'/g, "");
      if (jsonTest[m]) {
        const item = results[m];
        if (item) {
          item.push(path);
        } else {
          results[m] = [path];
        }
      }
    }
  }
  console.log("allTokens", Object.keys(jsonTest).length);
  // const allKeys = Object.keys(englishTokens);
  // console.log("results", Object.keys(results).length);
  console.log("results", Object.keys(results).length);
  const resultKeys = R.pick(Object.keys(results), jsonTest);
  console.log("final", Object.keys(resultKeys).length);

  await fs.mkdir(dir, { recursive: true });
  fs.writeFile(
    "../testing-scripts/output/resultKeys.json",
    JSON.stringify(resultKeys)
  );
  fs.writeFile(
    "../testing-scripts/output/results.json",
    JSON.stringify(results)
  );
  // console.log("resultKeys", resultKeys);
  // console.log("results", results);
})();
