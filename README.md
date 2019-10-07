# Docker swarm #

## Install sandbox environment ##

![sandbox swarm architecture](https://github.com/Esenor/docker_swarm_sandbox/blob/master/sandbox_swarm_architecture.png)

### Create docker-machine servers network ###

> Use Virtualbox (or hyperV) has sandbox network of servers

Create one manager server and at least 2 worker server.

    docker-machine create --driver virtualbox manager1
    docker-machine create --driver virtualbox worker1
    docker-machine create --driver virtualbox worker2
    docker-machine create --driver virtualbox worker3

### Register `manager1` has manager node. ###

    docker-machine ip manager1
    docker-machine ssh manager1
    docker swarm init --advertise-addr {manage1 ip address}

### Register every other server in the swarm ###

    # Generate a Worker or manager token on manager1
    docker swarm join-token worker
    docker swarm join-token manager
    # And use token on every server 

### Build and install demo service ###

    # In service_receiver folder
    docker-compose -f docker-compose.yml build

    # Tag last service_receiver image
    docker tag service_receiver service_receiver:version_a
    docker tag service_receiver service_receiver:version_b

    # Save image
    docker save service_receiver:version_a > a.tar
    docker save service_receiver:version_b > b.tar

    # Install files on each server
    docker-machine scp docker-compose.yml manager1:/tmp
    docker-machine scp a.tar worker1:/tmp
    docker-machine scp b.tar worker2:/tmp

    # Install image on worker 1 and 2
    docker-machine ssh worker1
    docker load -i /tmp/a.tar
    
    docker-machine ssh worker2
    docker load -i /tmp/b.tar

### How to deploy docker-compose on the swarm ###

> Only docker-compose version 3 and no build

Docker-compose sample

    version: "3"
    services:
      receiver_a:
        image: service_receiver:version_a
        environment:
          - EFC_APP_ID=receiver_a
        deploy:
          mode: replicated
          replicas: 1
        command: "npm start"
      receiver_b:
        image: service_receiver:version_b
        environment:
          - EFC_APP_ID=receiver_b
        deploy:
          mode: replicated
          replicas: 3
        command: "npm start"
    networks:
      default:
        external:
            name: efc_swarm

Create docker network

    docker-machine ssh manager1
    docker network create -d overlay efc_swarm
    docker network create -d overlay --attachable efc_swarm

Use `stack` to deploy services in compose file

    docker-machine ssh manager1
    # deploy services
    docker stack deploy -c /tmp/docker-compose.yml {stack_name}

    # deploy visualizer tool
    docker run -it -d -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock dockersamples/visualizer


> Stack name is used as a container prefix, `target_a` became `{stack_name}_target_a`

### How to list services ###

    docker service ls

### How to list service repartition on each server ###

    docker service ps {service_name}

## Useful link ###

- [https://rominirani.com/docker-swarm-tutorial-b67470cf8872](https://rominirani.com/docker-swarm-tutorial-b67470cf8872)
- [https://github.com/dockersamples/docker-swarm-visualizer](https://github.com/dockersamples/docker-swarm-visualizer)
- [https://codeblog.dotsandbrackets.com/private-registry-swarm/](https://codeblog.dotsandbrackets.com/private-registry-swarm/)
- [https://docs.docker.com/network/overlay/](https://docs.docker.com/network/overlay/)
- [https://www.ionos.fr/digitalguide/serveur/know-how/docker-orchestration-avec-swarm-et-compose/](https://www.ionos.fr/digitalguide/serveur/know-how/docker-orchestration-avec-swarm-et-compose/)
- [https://www.it-wars.com/posts/virtualisation/docker-swarm-par-lexemple/](https://www.it-wars.com/posts/virtualisation/docker-swarm-par-lexemple/)
