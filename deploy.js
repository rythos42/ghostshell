var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();

var username = process.env.FTP_USERNAME;
var password = process.env.FTP_PASSWORD;

try {
  var deployConfig = require('./deploy-config');
  username = deployConfig.username;
  password = deployConfig.password;
} catch (e) {
  console.warn(
    'No deploy-config.js containing FTP_USERNAME and FTP_PASSWORD found, using from environment'
  );
  console.log(e);
}

var config = {
  user: username,
  password: password,
  host: 'ftp.geeksong.com',
  port: 21,
  localRoot: __dirname + '/build',
  remoteRoot: '/public_html/ghostshell/',
  include: ['**/*'],
  exclude: ['config.json'],
  forcePasv: true
};

console.log('Deploying client');
ftpDeploy
  .deploy(config)
  .then(res => {
    console.log('Finished client');
  })
  .catch(err => console.log(err));
