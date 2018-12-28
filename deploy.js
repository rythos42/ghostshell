var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();

var config = {
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
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
