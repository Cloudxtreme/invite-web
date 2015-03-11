var React  = require("react");
var Router = require("react-router");
var http   = require("http");

module.exports = React.createClass({
	mixins: [Router.Navigation],

	setButtonState: function(b) {
		var submitNode = this.refs.submit.getDOMNode();

		if (b == "invalid") {
			submitNode.disabled = true;
			submitNode.innerHTML = '<i class="fa fa-lock"></i>';
		} else if (b == "valid") {
			submitNode.disabled = false;
			submitNode.innerHTML = '<i class="fa fa-unlock-alt"></i>';
		} else if (b == "loading") {
			submitNode.disabled = true;
			submitNode.innerHTML = '<i class="fa fa-cog fa-spin"></i>';
		}
	},
	handleSubmit: function(e) {
		e.preventDefault();

		var token = this.refs.token.getDOMNode().value;
		if (!token) {
			return;
		}

		if (token.length != 20) {
			return;
		}

		this.transitionTo('create', {token: token});
	},
	tokenChange: function(e) {
		var self = this;

		var token = this.refs.token.getDOMNode().value;
		if (!token) {
			return;
		}

		var submitNode = this.refs.submit.getDOMNode()

		if (token.length != 20) {
			self.setButtonState("invalid");
		} else {
			self.setButtonState("loading");

			http.request({
				method: "POST",
				path: "/check",
				host: "127.0.0.1",
				port: 8000,
			}, function(res) {
				// Gather the response
				var buffer = "";
				res.on('data', function(buf) {
					buffer += buf;
				});

				res.on('end', function() {
					// Parse the buffer
					var result = JSON.parse(buffer);

					// Enable or disable the button depending on the result
					var success = !!result.success;
					if (success) {
						self.setButtonState("valid");
					} else {
						self.setButtonState("invalid");
					}
				});
			}).end(JSON.stringify({
				"token": token,
			}));
		}
	},
	render: function() {
		return (
			<div className="welcome">
				<h1>Welcome to Lavaboom!</h1>
				<h3>Please type in your invitation code to proceed.</h3>
				
				<form onSubmit={this.handleSubmit}>
					<input ref="token" type="text" placeholder="invitation code"
						maxLength="20" onInput={this.tokenChange}
						onPropertyChange={this.tokenChange} />
					<button ref="submit" type="submit" disabled>
						<i className="fa fa-lock"></i>
					</button>
				</form>
			</div>
		);
	}
});