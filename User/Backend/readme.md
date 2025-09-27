go mod init landchain

go get github.com/gin-gonic/gin
go get gorm.io/gorm

go get gorm.io/driver/postgres
go get github.com/joho/godotenv

go get github.com/gocarina/gocsv
go get github.com/someuser/ethers


Build Backed
cd /user/Backend
docker build -t backend .

docker tag backend:latest sikharet/backend-app:latest
docker push sikharet/backend-app:latest
