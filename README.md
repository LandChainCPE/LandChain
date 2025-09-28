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







ก่อน Deploy เช็ค 
1.Url Azure Frontend
2.เช็ค contract address Frontend  (.env)
3.เช็คชื่อ  Database ของ Azure   (.env)
4.เช็คการเข้ารหัส sslmode

Docker
ที่ Root   ชื่อ Docker   rtppts

1. docker build -t backend-app -f User/Backend/Dockerfile User/Backend

- backend-app :ชื่อimageที่จะสร้าง   
- User/Backend/Dockerfile ตำแหน่งDocker  
- User/Backend:โฟลเดอร์ที่เราจะBuild

2. docker tag backend-app:latest rtppts/backend-app:latest

- backend-app:latest ใส่tag 
- rtppts/backend-app:latest ชื่อ image และ tag ที่จะใช้ push ต้องตรงกับ Repo



3. docker push rtppts/backend-app:latest
- rtppts/backend-app:latest : ชื่อimageและtagจริงที่อยู่บนDockerHub
- (ต้องตรงกับ repo ที่สร้างไว้ใน Docker Hub)


คำสั่ง
- ดูรายการ images
docker images

- ลบ image
docker rmi (id image)

- ดูคอนเทนเนอร์ที่กำลังรันอยู่
docker ps

- ดูคอนเทนเนอร์ทั้งหมด (รวมที่หยุดแล้ว)
docker ps -a

- หยุดคอนเทนเนอร์
docker stop (containerID)

- ลบคอนเทนเนอร์ที่หยุดแล้ว
docker rm (container_id)