var FtpDeploy = require("ftp-deploy");
var ftpDeploy = new FtpDeploy();

var config = {
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  host: "ftp.geeksong.com",
  port: 21,
  localRoot: __dirname + "/src",
  remoteRoot: "/public_html/ghostshell/",
  include: ["client/build/*", "server/*"],
  exclude: [
    "config.json",
    "vendor",
    "config.php",
    "composer.json",
    "composer.lock"
  ],
  deleteRemote: true,
  forcePasv: true
};

ftpDeploy
  .deploy(config)
  .then(res => console.log("finished"))
  .catch(err => console.log(err));
