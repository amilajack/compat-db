## Setting Up Docker

Docker is a tool that allows everyone on a team to have the exact same environment. It prevents platform-specific issues and configuration issues.

Using mysql instead of sqlite gives us a significant improvement in performance.

Here is the list of steps to setup docker with this project.


## 1. Installing Docker

### Mac
```
# If you're on mac and have brew
brew cask install docker-toolbox
# Done! 🎉🎉🎉
```

### Other
Go to docker's website and find out install **docker**, **docker-compose**, and **docker-machine**


## 2. Running docker

⚠️ Make sure to run the following commands in a single terminal session. Don't create a new window/tab. If you do, you will need to run step 3 again ⚠️

```bash
# 1. Setup a vm for docker
# '-d' is short for driver. This command will create a vm with the name of
# 'compat-db' by using virtualbox
docker-machine create -d virtualbox compat-db

# 2. Start the vm
docker-machine start compat-db

# 3. Tell docker to point to the compat-db vm
eval $(docker-machine env compat-db)

# 4. Get the IP address of your docker machine
# Add this IP address to the `MYSQL_IP_ADDRESS`
# setting in your `.env` file
# ex. MYSQL_IP_ADDRESS=192.168.99.100
docker-machine ip compat-db

# 5. Set `.env` config to use sqlite
# USE_SQLITE=false

# 6. cd to the compat-db directory
cd compat-db

# 7. Install the project's dependencies (mysql)
# `-d` tells docker-compose to run in the background
docker-compose up -d
```
