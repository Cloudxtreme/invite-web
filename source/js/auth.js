var http = require("http");

module.exports = {
	login: function(username, password, cb){
		var self = this;

		cb = arguments[arguments.length - 1];
		if (localStorage.token) {
			if (cb) cb(true);
			this.onChange(true);
			return;
		}

		http.request({
			method: "POST",
			path: "/auth",
			host: "localhost",
			port: 8000,
		}, function(res) {
			// Gather the response
			var buffer = "";
			res.on("data", function(buf) { buffer += buf; });

			res.on("end", function() {
				// Parse the buffer
				var result = JSON.parse(buffer);

				if (result.success) {
					localStorage.token = result.token;
					if (cb) cb(true);
					self.onChange(true);
				} else {
					if (cb) cb(false);
					self.onChange(false);
				}
			});
		}).end(JSON.stringify({
			"username": username,
			"password": password,
		}));
	},

	getToken: function () {
		return localStorage.token;
	},

	logout: function (cb) {
		delete localStorage.token;
		if (cb) cb();
		this.onChange(false);
	},

	loggedIn: function () {
		return !!localStorage.token;
	},

	onChange: function () {}
};

function pretendRequest(username, pass, cb) {
	setTimeout(function(){
		if (username === 'joe' && pass === 'password1') {
			cb({
				authenticated: true,
				token: Math.random().toString(36).substring(7)
			});
		} else {
			cb({authenticated: false});
		}
	}, 0);
}