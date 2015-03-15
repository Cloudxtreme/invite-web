# invite-web

<img src="https://mail.lavaboom.com/img/Lavaboom-logo.svg" align="right" width="200px" />

ReactJS frontend of the Lavaboom's invitation app.

Currently it's a simple UI for interfacing with `lavab/invite-api`. Supports
all methods exported by that app, later it will also contain an admin app for
invite creation.

## Requirements

 - gulp (`npm install -g gulp`)

## Usage

### Inside a Docker container (production)

*This image will be soon uploaded to Docker Hub.*

```bash
git clone https://github.com/lavab/invite-web.git
cd invite-web
docker build -t "lavab/invite-web" .
docker run \
    -p 127.0.0.1:8001:80 \
    --name invite-web \
    lavab/invite-web
```

### Running using gulp (development)

```bash
git clone https://github.com/lavb/invite-web.git
cd invite-web
npm install
gulp
```

## License

This project is licensed under the MIT license. Check `LICENSE` for more
information.