import DefaultTheme from "vitepress/theme";
import "./custom.styl";

// figlet -f big "Gsxany"
console.log(
  `%c
   _____
  / ____|
 | |  __ _____  ____ _ _ __  _   _
 | | |_ / __\\ \\/ / _\` | '_ \\| | | |
 | |__| \\__ \\>  < (_| | | | | |_| |
  \\_____|___/_/\\_\\__,_|_| |_|\\__, |
                              __/ |
                             |___/
`,
  "color: #42b983"
);
console.log(`%c微信/微博, 可添加：%cGsxany`, "color: red", "color: #42b983");
export default DefaultTheme;
