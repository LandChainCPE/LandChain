รันที่ Root เลย
docker build -t backend-app -f backend/Dockerfile .




docker tag backend-app autdev/backend-app:latest    แก้ Tag เฉยๆ
จากนั้น Push
docker push autdev/backend-app:latest

docker images
docker push rtppts/backendresume:latest   เลือกให้ตรง กับ Repo  ของDocker นั้นคือ rtppts/backendresume




Frontend
รันที่ Root เลย   ลบโฟลเดอร์ Dirth ก่อนจะทำให้ Build เร็ว
docker build -t frontend-app -f frontend/Dockerfile .

ใส่ Tag ให้ตรงกับ Repo Docker ที่ตั้งไว้
docker tag frontend-app rtppts/frontendresume:latest

แล้วก็ Push เข้า Docker ตามชื่อ Repoที่เราตั้งไว้
docker push rtppts/frontendresume:latest

ลบที่ไม่ต้องการ 
docker rmi 30611a615f44


Nginx เป็น Web Server และค่าเริ่มต้น (Default) ของ Nginx คือ ฟังที่ Port 80
Railway จะเข้ามาเชื่อมต่อที่ Port ที่ Container เปิดไว้ → ต้องตรงกับ EXPOSE
Client (443 HTTPS) → Railway → Container (Port 80)

