var React  = require("react");
var Router = require("react-router");
var http   = require("http");

function validateEmail(email) {
	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function validateUsername(name) {
	var re = /^[a-zA-Z0-9\.]+$/;
	return !(name.length > 31 || name.length < 2 || !re.test(name));
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
		// We shouldn't really query it twice, but I'm not sure how should
		// I accomplish this without setting up a whole event system. 

		var self = this;
		var params = this.getParams();

		http.request({
			method: "POST",
			path:   "/check",
			host:   "127.0.0.1",
			port:   8000,
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
		var nameInput = this.refs.username.getDOMNode();
		var emailInput = this.refs.email.getDOMNode();

		var username = nameInput.value;
		var email = emailInput.value;

		var valid = true;
		if (!validateUsername(username)) {
			valid = false;
			this.setInputState("username", false);
		} else {
			this.setInputState("username", true);
		}

		if (!validateEmail(email)) {
			valid = false;
			this.setInputState("email", false);
		} else {
			this.setInputState("email", true);
		}

		if (!valid) {
			this.setButtonState(false);
			return;
		}

		this.setButtonState(true);
	},

	render: function() {
		var params = this.getParams();
		var query  = this.getQuery();

		return (
			<div className="create">
				<h2>
					Please type in your alternative e-mail address<br/>
					and choose a username for your account
				</h2>

				<form onSubmit={this.handleSubmit}>
					<input ref="username" type="text" placeholder="username"
						maxLength="32" onInput={this.updateValidation}
						onPropertyChange={this.updateValidation}
						value={this.state.token.name}
						readOnly={!!this.state.token.name} />
					<input ref="email" type="email" maxLength="32"
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