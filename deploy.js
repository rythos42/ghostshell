var FtpDeploy = require("ftp-deploy");
var ftpDeploy = new FtpDeploy();

var config = {
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  host: "ftp.geeksong.com",
  port: 21,
  localRoot: __dirname + "/src/client/build",
  remoteRoot: "/public_html/ghostshell/",
  include: ["**/*"],
  exclude: ["config.json"],
  forcePasv: true
};

console.log("Deploying client");
ftpDeploy
  .deploy(config)
  .then(res => {
    console.log("Finished client");
    console.log("Deploying server");
    config.localRoot = __dirname + "/src/server";
    config.remoteRoot = "/public_html/ghostshell/srv";
    config.exclude = [
      "vendor/**/*.*",
      "config.php",
      "composer.json",
      "composer.lock"
    ];

    ftpDeploy
      .deploy(config)
      .then(res => console.log("Finished server"))
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
