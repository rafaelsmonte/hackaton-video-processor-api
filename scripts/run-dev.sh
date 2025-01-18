#!/bin/sh
if [ -z "$BASEDIR" ]
then
    BASEDIR=$(pwd)
fi

#echo "Project Base Directory: $BASEDIR"
#DUID=$(id -u) DGID=$(id -g) docker-compose -f $BASEDIR/docker/docker-compose-dev.yml up -d

case "$1" in
        upd)
                echo "Up Daemon ..."
                DUID=$(id -u) DGID=$(id -g) docker compose -f $BASEDIR/docker/docker-compose-dev.yml up -d
                ;;
        up)
                echo "Up ..."
                DUID=$(id -u) DGID=$(id -g) docker compose -f $BASEDIR/docker/docker-compose-dev.yml up
                ;;
        down)
                echo "Down ..."
                DUID=$(id -u) DGID=$(id -g) docker compose -f $BASEDIR/docker/docker-compose-dev.yml down
                ;;
        down-volume)
                echo "Down ..."
                DUID=$(id -u) DGID=$(id -g) docker compose -f $BASEDIR/docker/docker-compose-dev.yml down -v
                ;;
        restart)
                echo "Restart ..."
                DUID=$(id -u) DGID=$(id -g) docker compose -f $BASEDIR/docker/docker-compose-dev.yml restart
                ;;
        logs)
                echo "Logs ..."
                DUID=$(id -u) DGID=$(id -g) docker compose -f $BASEDIR/docker/docker-compose-dev.yml logs -f
                ;;
        test)
                echo "E2E Tests ..."
                DUID=$(id -u) DGID=$(id -g) docker compose -f $BASEDIR/docker/docker-compose-test.yml up \
                --abort-on-container-exit  --exit-code-from tech-challenge-test; \
                DUID=$(id -u) DGID=$(id -g) docker compose -f $BASEDIR/docker/docker-compose-test.yml down -v
                ;;
        *)
                echo $"Usage: $0 {upd|up|down|down-volume|restart|logs|test}"
                RETVAL=2

esac
exit $RETVAL