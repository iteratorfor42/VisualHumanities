FROM nginx:1.27-alpine

# site/ 폴더의 정적 파일(HTML, CSS, JS)을 nginx 기본 서빙 경로로 복사
COPY site/ /usr/share/nginx/html/

# Render는 PORT 환경변수로 리슨 포트를 지정하도록 요구한다.
# 이 템플릿은 nginx 공식 이미지의 자동 envsubst 기능으로 $PORT를 실제 값으로 치환한다.
# (로컬 docker-compose 에서는 기본값 80을 그대로 사용)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=80

EXPOSE 80
