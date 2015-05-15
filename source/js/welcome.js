var React  = require("react");
var Router = require("react-router");
var https  = require("https-browserify");

module.exports = React.createClass({
	mixins: [Router.Navigation],

	setButtonState: function(b) {
		var submitNode = this.refs.submit.getDOMNode();
		var tokenNode = this.refs.token.getDOMNode();
		var tokenErrorNode = this.refs.tokenError.getDOMNode();
		var tokenContainerNode = this.refs.tokenContainer.getDOMNode();

		if (b == "invalid") {
			submitNode.disabled = true;
			tokenNode.className = "invalid";
			tokenErrorNode.className = "token-error";
			tokenContainerNode.className = "input-container invalid";
		} else if (b == "valid") {
			submitNode.disabled = false;
			tokenNode.className = "valid";
			tokenErrorNode.className = "token-error hidden";
			tokenContainerNode.className = "input-container valid";
		} else if (b == "loading") {
			submitNode.disabled = true;
			tokenNode.className = "valid";
			tokenErrorNode.className = "token-error hidden";
			tokenContainerNode.className = "input-container loading";
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

			https.request({
				method: "POST",
				path: "/check",
				host: "invite-api.lavaboom.com",
				port: 443,
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

	componentDidMount: function() {
		this.props.stateCallback("container-welcome");
	},
	render: function() {
		return (
			<div className="welcome">
				<h1>Get your own secure<br />email account!</h1>
				
				<form onSubmit={this.handleSubmit}>
					<div className="input-container" ref="tokenContainer">
						<input ref="token" type="text" placeholder="Paste your invitation code"
							maxLength="20" onInput={this.tokenChange}
							onPropertyChange={this.tokenChange} />
					</div>
					<span className="token-error hidden" ref="tokenError">This invitation code is not valid. Typo?</span>
					<button ref="submit" type="submit" disabled>
						Verify
					</button>
				</form>

				<div className="noInvite">
					<a href="https://mail.lavaboom.com/secure">No invite code yet? Get one here!</a>
				</div>
			</div>
		);
	}
});