var React  = require("react");
var Router = require("react-router");
var https  = require("https-browserify");

function validateEmail(email) {
	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function validateUsername(name) {
	var re = /^[a-zA-Z0-9\.]+$/;
	return !(name.length > 31 || name.length < 2 || !re.test(name));
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
		if (!node.value) {
			b = true;
		}

		node.className = b ? "valid" : "invalid";
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
			valid = false;
			self.setInputState("username", false);
		} 

		if (!validateEmail(email)) {
			valid = false;
			self.setInputState("email", false);
		} 

		if (!valid) {
			self.setButtonState(false);
			return;
		}

		checkFree(this.getParams().token, username, email, function(result) {
			if (result.success) {
				self.setInputState("username", true);
				self.setInputState("email", true);
				self.setButtonState(true);
			} else {
				self.setInputState("username", !result.username_taken);
				self.setInputState("email", !result.email_used);
				self.setButtonState(false);
			}
		});
	},
	handleSubmit: function(e) {
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

				// Change window's location
				window.location = "https://mail.lavaboom.com/verify/" + username + "/" + result.code;
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
					Please type in your alternative email address and choose a username for your account
				</h2>

				<form onSubmit={this.handleSubmit}>
					<input ref="username" type="text" placeholder="username"
						maxLength="32" onInput={this.updateValidation}
						onPropertyChange={this.updateValidation}
						value={this.state.token.name}
						readOnly={!!this.state.token.name} />
					<input ref="email" type="email" maxLength="48"
						placeholder="alternative e-mail address"
						onInput={this.updateValidation}
						onPropertyChange={this.updateValidation}
						value={this.state.token.email}
						readOnly={!!this.state.token.email} />
					<button ref="submit" type="submit" disabled>
						Next step
					</button>
				</form>
			</div>
		)
	}
});