build:
	./build_qlever.sh

generate_graphs:
	./generate_release_graphs.sh

start:
	docker run -d --name wwdh-qlever -p 8888:8888 wwdh-qlever

up: 
	docker run --name wwdh-qlever -p 8888:8888 wwdh-qlever

rm:
	docker rm -f wwdh-qlever

login:
	docker exec -it wwdh-qlever /bin/bash

push:
	docker tag wwdh-qlever:latest internetofwater/wwdh-qlever:latest
	docker push internetofwater/wwdh-qlever

scan:
	docker save -o /tmp/wwdh-qlever.tar wwdh-qlever
	mkdir /tmp/wwdh-qlever
	tar -xvf /tmp/wwdh-qlever.tar -C /tmp/wwdh-qlever
	trufflehog filesystem /tmp/wwdh-qlever

ui:
	qlever ui --host-name localhost