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