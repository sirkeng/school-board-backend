require('dotenv').config();

module.exports = {
    apps: [
        {
            name: 'school-board', // 애플리케이션 이름
            script: 'dist/index.js',
            instances: 1, // 여러 인스턴스를 실행할 경우, 기본값 1
            autorestart: true, // 애플리케이션이 중지되었을 때 자동으로 재시작
            watch: false, // 파일 변경 시 자동 재시작 여부 (true로 설정 시 개발 환경에 유용)
            max_memory_restart: '1G', // 메모리 사용량이 1GB를 초과하면 재시작
            env: {
                NODE_ENV: process.env.NODE_ENV || 'development',
                PORT: process.env.PORT,
                DB_HOST: process.env.DB_HOST,
                DB_PORT: process.env.DB_PORT,
                DB_USERNAME: process.env.DB_USERNAME,
                DB_PASSWORD: process.env.DB_PASSWORD,
                DB_DATABASE: process.env.DB_DATABASE,
                AWS_BUCKET_REGION: process.env.AWS_BUCKET_REGION,
                AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
                AWS_S3_ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY,
                AWS_S3_SECRET_KEY: process.env.AWS_S3_SECRET_KEY,
                JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
                JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
                EMAIL_USER: process.env.EMAIL_USER,
                EMAIL_PASS: process.env.EMAIL_PASS,
            },
        },
    ],
};
