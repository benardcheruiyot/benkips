// PM2 Ecosystem Configuration for KOPA-MKOPAJI Production
module.exports = {
  apps: [{
    name: 'app-production-3008',
    script: 'backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3008
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3008
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    listen_timeout: 3000,
    restart_delay: 4000,
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
};

// Optional: Deploy configuration for PM2 deploy
// module.exports.deploy = {
//   production: {
//     user: 'ubuntu',
//     host: 'your-server-ip',
//     ref: 'origin/main',
//     repo: 'git@github.com:yourusername/kopa-mkopaji.git',
//     path: '/var/www/kopa-mkopaji',
//     'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
//   }
// };