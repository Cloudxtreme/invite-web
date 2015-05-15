var React  = require("react");
var Router = require("react-router");
var https  = require("https-browserify");

function validateEmail(email) {
	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function validateUsername(name) {
	var re = /^[a-zA-Z0-9\.]+$/;
	return !(name.length > 31 || name.length < 3 || !re.test(name));
}

function checkFree(token, username, email, callback) {
	https.request({
		method: "POST",
		path:   "/free",
		host:   "invite-api.lavaboom.com",
		port: 443,
	}, function(res) {
		var buffer = "";
		res.on("data", function(buf) { buffer += buf; });

		res.on("end", function() {
			var result = JSON.parse(buffer);
			callback(result);
		});
	}).end(JSON.stringify({
		"token":    token,
		"username": username,
		"email":    email,
	}));
}

module.exports = React.createClass({
	mixins: [Router.State],

	setButtonState: function(b) {
		this.refs.submit.getDOMNode().disabled = !b;
	},
	setInputState: function(input, b) {
		var node = this.refs[input].getDOMNode();

		if (input.indexOf("Container") !== -1) {
			if (!this.refs[input.substring(0, input.length - 9)].getDOMNode().value) {
				b = true;
			}
		} else if (!node.value) {
			b = true;
		}

		if (input == "emailContainer" && !this.refs["email"].getDOMNode().value) {
			node.className = input;
			return
		}
		
		node.className = input + " " + (b ? "valid" : "invalid");

		console.log(node.className);
	},

	getInitialState: function() {
		return {token: {}};
	},
	componentDidMount: function() {
		this.props.stateCallback("container-create");

		// We shouldn't really query it twice, but I'm not sure how should
		// I accomplish this without setting up a whole event system. 

		var self = this;
		var params = this.getParams();

		https.request({
			method: "POST",
			path:   "/check",
			host:   "invite-api.lavaboom.com",
			port: 443,
		}, function(res) {
			// Gather the response
			var buffer = "";
			res.on("data", function(buf) { buffer += buf; });

			res.on("end", function() {
				// Parse the response
				var result = JSON.parse(buffer);

				// Put the result into the state
				self.setState({token: result});

				// Update the button
				self.updateValidation();

				// Tick the newsletter checkbox
				self.refs.newsletter.getDOMNode().checked = true;
			});
		}).end(JSON.stringify({
			"token": params.token,
		}));
	},

	updateValidation: function() {
		var self = this;

		var nameInput = self.refs.username.getDOMNode();
		var emailInput = self.refs.email.getDOMNode();

		var username = nameInput.value;
		var email = emailInput.value;

		var valid = true;
		if (!validateUsername(username)) {
			console.log("Invalid username");
			valid = false;
			self.setInputState("usernameContainer", false);
			self.setInputState("username", false);
			console.log("done");
		} else {
			self.setInputState("usernameContainer", true);
			self.setInputState("username", true);
		}

		if (!validateEmail(email)) {
			valid = false;
			self.setInputState("emailContainer", false);
			self.setInputState("email", false);
		} else {
			self.setInputState("emailContainer", true);
			self.setInputState("email", true);
		}

		if (!valid) {
			self.setButtonState(false);
			return;
		}

		checkFree(this.getParams().token, username, email, function(result) {
			if (result.success) {
				self.setInputState("usernameContainer", true);
				self.setInputState("username", true);
				self.setInputState("emailContainer", true);
				self.setInputState("email", true);
				self.setButtonState(true);
			} else {
				self.setInputState("usernameContainer", !result.username_taken);
				self.setInputState("username", !result.username_taken);
				self.setInputState("emailContainer", !result.email_used);
				self.setInputState("email", !result.email_used);
				self.setButtonState(false);
			}
		});
	},
	handleSubmit: function(e) {
		var self = this;

		e.preventDefault();

		var username = this.refs.username.getDOMNode().value;

		https.request({
			method: "POST",
			path: "/create",
			host: "invite-api.lavaboom.com",
			port: 443,
		}, function(res) {
			// Gather the response
			var buffer = "";
			res.on("data", function(buf) { buffer += buf; });

			res.on("end", function() {
				// Parse the buffer
				var result = JSON.parse(buffer);

				if (!self.refs.newsletter.getDOMNode().checked) {
					// Change window's location
					window.location = "https://mail.lavaboom.com/verify/" + username + "/" + result.code;
				} else {
					var fd = [];
					fd.push(encodeURIComponent("name") + '=' + encodeURIComponent(username));
					fd.push(encodeURIComponent("email") + '=' + encodeURIComponent(self.refs.email.getDOMNode().value));
					fd.push(encodeURIComponent("list") + '=' + encodeURIComponent("79P4A9RzHUgK70tiFy8KaA"));
					fd.push(encodeURIComponent("boolean") + '=' + encodeURIComponent(true));

					var data = fd.join('&').replace(/%20/g, '+');

					// Make a second request
					https.request({
						method: "POST",
						path: "/subscribe",
						host: "technical.lavaboom.com",
						port: 443,
						withCredentials: false,
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
					}, function(res) {
						res.on("end", function() {
							// Change window's location
							window.location = "https://mail.lavaboom.com/verify/" + username + "/" + result.code;
						});
					}).end(data);
				}
			})
		}).end(JSON.stringify({
			"token":    this.getParams().token,
			"username": username,
			"email":    this.refs.email.getDOMNode().value,
		}));
	},

	render: function() {
		return (
			<div className="create">
				<h2>
					Please type in your current email address and choose a username for your account
				</h2>

				<form onSubmit={this.handleSubmit}>
					<div className="usernameContainer" ref="usernameContainer">
						<input ref="username" type="text" placeholder="username"
							maxLength="32" onInput={this.updateValidation}
							onPropertyChange={this.updateValidation}
							value={this.state.token.name}
							readOnly={!!this.state.token.name}
							className="username" />
						<span>@lavaboom.com</span>
					</div>
					<div className="emailContainer" ref="emailContainer">
						<input ref="email" type="email" maxLength="48"
							placeholder="your current email address"
							onInput={this.updateValidation}
							onPropertyChange={this.updateValidation}
							value={this.state.token.email}
							readOnly={!!this.state.token.email} />
					</div>

					<div className="checkbox">
						<input id="newsletter" type="checkbox" ref="newsletter" className="checkbox" />
						<label htmlFor="newsletter">
							I want to be first to hear about Lavaboom news, send me the latest updates from Lava HQ.
						</label>
					</div>

					<span className="toc">
						By signing up I agree that I've read and understood the&nbsp;
						<a href="https://lavaboom.com/terms">Terms of Use</a>
						&nbsp;and&nbsp;<a href="https://lavaboom.com/privacy">Privacy Policy</a>.
					</span>

					<button ref="submit" type="submit" disabled>
						Next step
					</button>
				</form>
			</div>
		)
	}
});